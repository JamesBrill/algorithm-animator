$(document).bind('pagecreate',function () {
  var canvas, context, nodeRadius;
  var cursorX, cursorY;
  var nodes = new Array();
  var edges = new Array();
  var currentNode; // Node cursor is currently on, if any
  var highlightMode;
  var selectedNode; // The node being selected
  var startX, startY;
  var isMouseDown;
  var nodeJustBeenPlaced;
  var graphMode;
  var popupMenuOnScreen;

  function Node (x, y) {
    this.x = x;
    this.y = y;
    this.selected = false; 
    this.highlighted = false;

    this.getX = function () {
      return this.x;
    }

    this.setX = function (newX) {
      this.x = newX;
    }
  
    this.getY = function () {
      return this.y;
    }

    this.setY = function (newY) {
      this.y = newY; 
    }
   
    this.select = function () {
      this.selected = !this.selected;
    }

    this.isSelected = function () {
      return this.selected;
    }
 
    this.highlight = function () {
      this.highlighted = !this.highlighted;
    }
   
    this.isHighlighted = function () {
      return this.highlighted; 
    }
  }  
  
  function Edge (x, y) {
    this.fromNode = x;
    this.toNode = y;
    this.selected = false; 
    this.highlighted = false;

    this.getFromNode = function () {
      return this.fromNode;
    }
  
    this.getToNode = function () {
      return this.toNode;
    }   
  }

  // Initialization sequence.
  function init () {
    // Find the canvas element.
    canvas = $('#snow')[0];
    if (!canvas) {
      alert('Error: I cannot find the canvas element!');
      return;
    }

    if (!canvas.getContext) {
      alert('Error: no canvas.getContext!');
      return;
    }

    // Get the 2D canvas context.
    context = canvas.getContext('2d');
    if (!context) {
      alert('Error: failed to getContext!');
      return;
    }
        
    nodeRadius = 20;
    cursorX = -1;
    cursorY = -1;
    currentNode = null;
    highlightMode = false;
    selectedNode = null; 
    startX = 0;
    startY = 0;
    isMouseDown = false;
    nodeJustBeenPlaced = false;
    graphMode = "build";
    popupMenuOnScreen = false;

    setInterval(function () { draw() }, 25);
  }

  function distance (x0, y0, x1, y1) {
    var distance = Math.sqrt((x0-x1)*(x0-x1)+(y0-y1)*(y0-y1));
    return distance;
  }

  function overlapsWithAnotherNode (x,y,ignoreCurrentNode) {    
    for (var i = 0; i < nodes.length; i++) {
      if (!ignoreCurrentNode || nodes[i] != currentNode) {
        var nodeX = nodes[i].getX();
        var nodeY = nodes[i].getY();
        var distanceBetweenNodes = distance(x,y,nodeX,nodeY);
        if (distanceBetweenNodes < 2*nodeRadius) {
          return true;
        } 
      }
    }
    return false;
  }
  
  $('#snow').bind('vmousedown', function (ev) {
    if (graphMode == "build") {
      // Prevents text from being selected after a double click; this prevents
      // an error that causes dragging to stop working properly
      ev.preventDefault();

      // Attempt to place a node. If a new node cannot be placed, the user may 
      // have intended to have been trying to place a new edge; try this instead.
      if (!placeNode()) { 
        placeEdge();
      }  
    }
    
    if (graphMode == "build" || graphMode == "modify") {
      // Attempt to initiate a dragging action
      initiateDrag();    
    }
  });

  $('#snow').bind('vmouseup', function (ev) {
    if (graphMode == "build") {
      // If no drag was performed and the cursor is over a node that hasn't
      // just been placed, perform node selection.
      if (cursorX == startX && cursorY == startY && 
          currentNode != null && !nodeJustBeenPlaced) {
        performNodeSelection();
      }  

      // Record that a node has finished being placed on the canvas. It can now
      // be selected.
      if (nodeJustBeenPlaced) {
        nodeJustBeenPlaced = false;
      }
    }
    
    if (graphMode == "build" || graphMode == "modify") {
      // Record that the mouse button is no longer being held down
      isMouseDown = false;
    }
    
    if (graphMode == "modify") {
      if (cursorX == startX && cursorY == startY && currentNode != null) {
        deleteIncidentEdges(); // Disallows directional edges for now
        var index = nodes.indexOf(currentNode);
        nodes.splice(index, 1); 
      }       
    }
  });

  $('#snow').bind('vmousemove', function (ev) {
    if (graphMode == "build" || graphMode == "modify") {
      // Get the mouse position relative to the canvas element
      cursorX = ev.pageX - this.offsetLeft;
      cursorY = ev.pageY - this.offsetTop;

      // Get the node that currently contains the cursor, if there is one
      var containingNode = getContainingNode(cursorX, cursorY);

      // Update the current node that the cursor is on
      updateCurrentNode(containingNode);
    }
  });
  
  $('input[name=radio-choice]').change(function() {
    graphMode = $('input[name=radio-choice]:checked').val();
    if (selectedNode != null) { 
      selectedNode.select(); 
      selectedNode = null;
    }
  });
  
  function moveCurrentNodeToCursor() {
    if (!overlapsWithAnotherNode(cursorX, cursorY, true)) {
      currentNode.setX(cursorX);
      currentNode.setY(cursorY); 
    }
  }
  
  function deleteIncidentEdges() {
    var deletedEdges = new Array();
    for (var i = 0; i < edges.length; i++) {
      if (edges[i].getToNode() == currentNode || 
          edges[i].getFromNode() == currentNode) {
        deletedEdges.push(edges[i]);
      }
    }
    for (var j = 0; j < deletedEdges.length; j++) {
      var index = edges.indexOf(deletedEdges[j]);
      edges.splice(index,1);
    }
  }
  
  function updateCurrentNode (containingNode) {
    // Check if a node is currently being dragged
    var isDragged = nodeIsBeingDragged();   
    
    // If cursor is on a node AND no node is being dragged... 
    if (containingNode != null && !isDragged) {
      // If there is still a different current node, un-highlight it
      if (currentNode != null) {
        currentNode.highlight();
      }
      // Make current node the node that the cursor is on
      currentNode = containingNode;
      // Highlight the containing node and activate highlight mode    
      currentNode.highlight();
      highlightMode = true;
    }
    // If cursor is not on a node...
    else { 
      // If the current node is highlighted and no node is being dragged,
      // unhighlight it and deactivate highlight mode.
      if (currentNode.isHighlighted() && !isDragged) {
        currentNode.highlight();
        highlightMode = false;
      }
      // There is now no longer a current node, unless it is still being dragged
      if (!isDragged) {
        currentNode = null;
      }
    }   
    
    // If the current node is being dragged, move it to where the cursor is
    if (isDragged) {
      moveCurrentNodeToCursor();
    }
  }
  
  function performNodeSelection () {
    // If the current node isn't selected...
    if (!currentNode.isSelected()) {
      // If there is exists a selected node, unselect it
      if (selectedNode != null) {
        selectedNode.select();
      }  
      // Make the current node the selected node
      selectedNode = currentNode;
    } 
    // If the current node is selected, nullify the selected node variable
    else {
      selectedNode = null;
    }
    // Change the select status of the current node
    currentNode.select();     
  }
  
  function placeNode () {
    // If there is space for a node to be placed at the cursor's position,
    // create a new node there
    if (nodeCanBePlaced()) {
      var newNode = new Node(cursorX,cursorY);
      nodes.push(newNode);   
      currentNode = newNode;
      currentNode.highlight();
      highlightMode = true;
      $('p#numberOfNodes').html(nodes.length);
      nodeJustBeenPlaced = true;      
      return true;
    }
    return false;
  }
  
  function placeEdge() {
    if (edgeCanBePlaced()) {
      edges.push(new Edge(selectedNode, currentNode));
      $('p#numberOfEdges').html(edges.length);
    }
  }
  
  function edgeCanBePlaced() {
    if (selectedNode == null || currentNode == null || currentNode == selectedNode) {
      return false;
    }
    for (var i = 0; i < edges.length; i++) {
      if ((edges[i].getFromNode() == selectedNode && 
          edges[i].getToNode() == currentNode) ||
          (edges[i].getToNode() == selectedNode && 
          edges[i].getFromNode() == currentNode)) {
          // Note that the last two expressions disallow directed graphs for now
        return false;
      }
    }
    return true;
  }
  
  function initiateDrag () {
    // If the cursor is over a node when the mouse is clicked, record that
    // the mouse button is being held down and the starting coordinates of 
    // the dragging action.
    if (currentNode != null) {
      isMouseDown = true;
      startX = cursorX;
      startY = cursorY;
    }
  }
  
  function nodeIsBeingDragged () {
    return isMouseDown && (startX != cursorX || startY != cursorY);
      //&&
        //isInsideCanvas(cursorX, cursorY) && !overlapsWithAnotherNode(cursorX, cursorY, true);
  }
  
  function nodeCanBePlaced () {
    return isInsideCanvas(cursorX, cursorY) && 
           !overlapsWithAnotherNode(cursorX, cursorY, false);
  }

  function draw () {
    context.clearRect(0,0,canvas.width,canvas.height);
    for (var i = 0; i < nodes.length; i++) {
      drawNode(i);
    }
    if (!highlightMode) {
      context.beginPath();
      if (isInsideCanvas(cursorX, cursorY) && !overlapsWithAnotherNode(cursorX, cursorY, false)) {
        context.strokeStyle = "#008000";
      }
      else {
        context.strokeStyle = "#FF0000";
      }
      context.arc(cursorX,cursorY,nodeRadius,0,Math.PI*2,false);
      context.stroke();
    }
    suggestEdgePosition();
    for (var i = 0; i < edges.length; i++) {
      var toNode = edges[i].getToNode();
      var fromNode = edges[i].getFromNode();
      drawEdge(toNode, fromNode);
    }
    var dataDisplay = document.getElementById('smeg2');
    dataDisplay.innerHTML = "isMouseDown: " + isMouseDown;
  }

  function drawNode (i) {
    var x = nodes[i].getX();
    var y = nodes[i].getY();
    context.beginPath();
    context.fillStyle = "#000000";
    if (nodes[i].isSelected()) {
      context.fillStyle = "#0000FF"; 
    }
    context.arc(x,y,nodeRadius,0,Math.PI*2,false);
    context.fill();  
    if (nodes[i].isHighlighted()) {
      context.strokeStyle = "#FFD700";
      context.arc(x,y,nodeRadius,0,Math.PI*2,false);
      context.arc(x,y,nodeRadius-1,0,Math.PI*2,false);
      context.arc(x,y,nodeRadius-2,0,Math.PI*2,false);
      context.stroke(); 
    } 
  }

  function suggestEdgePosition() {
    if (selectedNode != null && currentNode != null && currentNode != selectedNode) {
      drawEdge(currentNode, selectedNode);
    }
  }
  
  function drawEdge(toNode, fromNode) {
    var x0 = toNode.getX();
    var y0 = toNode.getY();
    var x1 = fromNode.getX();
    var y1 = fromNode.getY();
    context.beginPath();
    context.strokeStyle = "#000000";
    context.moveTo(x0,y0);
    context.lineTo(x1,y1); 
    context.stroke();   
  }

  function getContainingNode (x,y) {
    for (var i = 0; i < nodes.length; i++) {
      var nodeX = nodes[i].getX();
      var nodeY = nodes[i].getY();
      var distanceFromCursorToNode = distance(x,y,nodeX,nodeY);
      if (distanceFromCursorToNode < nodeRadius) {
        return nodes[i];
      }
    }
    return null; 
  }

  function isInsideCanvas (x,y) {
    if (x >= nodeRadius && y >= nodeRadius && x <= canvas.width-nodeRadius && 
        y <= canvas.height-nodeRadius) {
      return true;
    }
    return false;
  }

  init();
}); 