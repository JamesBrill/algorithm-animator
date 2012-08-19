$(document).bind('pagecreate',function () {
  var canvas, context, nodeRadius;
  var cursorX, cursorY;
  var nodes = new Array();
  var edges = new Array();
  var currentNode; // Node cursor is currently on, if any
  var highlightMode;
  var selectedItem; // The node being selected
  var startX, startY;
  var isMouseDown;
  var nodeJustBeenPlaced;
  var graphMode;
  var nodeNumber;

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
    selectedItem = null; 
    startX = 0;
    startY = 0;
    isMouseDown = false;
    nodeJustBeenPlaced = false;
    graphMode = "build";
    nodeNumber = 1;
    $('#mod-buttons').hide();
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
    ev.preventDefault();
    
    if (graphMode == "build") {
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
    
    // Refactor this area to remove duplication *******************************************
    if (graphMode == "modify") {
      if (cursorX == startX && cursorY == startY) {
        var itemClickedOn = determineSelectedItem(); // What did the user just click on?
        if (itemClickedOn == selectedItem) {
          selectedItem = null;
        }       
        else {
          selectedItem = itemClickedOn;
        }
        if (selectedItem == null) {
          $('#mod-buttons').hide();     
        }
        else {
          $('#mod-buttons').show();
          if (selectedItem instanceof Node) {
            $('#rename-item').val(selectedItem.getLabel());
          }
          else if (selectedItem instanceof Edge) {
            $('#rename-item').val(selectedItem.getValue()); 
          }
        }
      }     
    }
  });
  
  $('#delete').click(function () {
    var index;
    if (selectedItem instanceof Node) {
      deleteIncidentEdges(); // Disallows directional edges for now
      index = nodes.indexOf(selectedItem);
      nodes.splice(index, 1);
      selectedItem = null;
    }
    else if (selectedItem instanceof Edge) {
      index = edges.indexOf(selectedItem);
      edges.splice(index, 1);
      selectedItem = null;
    }
    $('#mod-buttons').hide();
  });
  
  $('#rename-item').change(function () {
    if (selectedItem instanceof Node) {
      selectedItem.setLabel($('#rename-item').val());
    }
    else if (selectedItem instanceof Edge) {
      selectedItem.setValue($('#rename-item').val());
    }
  })
  

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
  
  $('input[name=graph-mode]').change(function() {
    graphMode = $('input[name=graph-mode]:checked').val();
    if (graphMode == "build") {
      $('#mod-buttons').hide();
    }
    if (selectedItem != null) { 
      selectedItem = null;
    }
  });
  
  function determineSelectedItem() {
    var edgePotentials = nearbyEdges();
    var nodePotential = getContainingNode(cursorX, cursorY);
    var shortestDistance = 100000;
    var distanceToNode = 0;
    if (nodePotential != null) {   
      distanceToNode = distance(cursorX, cursorY, 
          nodePotential.getX(), nodePotential.getY()); 
      if (distanceToNode < nodeRadius) {
        return nodePotential;
      }
      shortestDistance = distanceToNode;
    }
    var nearestItem = nodePotential;
    for (var i = 0; i < edgePotentials.length; i++) {
      var startX = edgePotentials[i].getFromNode().getX();
      var startY = edgePotentials[i].getFromNode().getY();
      var endX = edgePotentials[i].getToNode().getX();
      var endY = edgePotentials[i].getToNode().getY();
      var edgeDistance = distanceFromCursorToLineSegment(startX,startY,endX,endY);
      if (edgeDistance < shortestDistance) {
        shortestDistance = edgeDistance;
        nearestItem = edgePotentials[i];
      }
    }    
    if (shortestDistance < nodeRadius) { 
      return nearestItem;
    }
    return null;
  }
  
  function distanceFromCursorToLineSegment(ax,ay,bx,by) {
    var cx = cursorX;
    var cy = cursorY;
    var r_numerator = (cx-ax)*(bx-ax) + (cy-ay)*(by-ay);
	  var r_denominator = (bx-ax)*(bx-ax) + (by-ay)*(by-ay);
	  var r = r_numerator / r_denominator;
    var s = ((ay-cy)*(bx-ax)-(ax-cx)*(by-ay)) / r_denominator; 
	  var distanceLine = Math.abs(s) * Math.sqrt(r_denominator);
    var distanceSegment = 0;

    if ((r >= 0) && (r <= 1)) {
      distanceSegment = distanceLine;
    }
    else {
      var dist1 = (cx-ax)*(cx-ax) + (cy-ay)*(cy-ay);
      var dist2 = (cx-bx)*(cx-bx) + (cy-by)*(cy-by);
      if (dist1 < dist2) {
        distanceSegment = Math.sqrt(dist1);
      }
      else {
        distanceSegment = Math.sqrt(dist2);
      }
    }        
    return distanceSegment;
  }
  
  function nearbyEdges() {
    var edgePotentials = new Array();
    for (var i = 0; i < edges.length; i++) {
      var startX = edges[i].getFromNode().getX();
      var startY = edges[i].getFromNode().getY();
      var endX = edges[i].getToNode().getX();
      var endY = edges[i].getToNode().getY();
      var xDiff = Math.min(Math.abs(startX-cursorX), Math.abs(endX-cursorX));
      var yDiff = Math.min(Math.abs(startY-cursorY), Math.abs(endY-cursorY));
      if (xDiff > nodeRadius && yDiff > nodeRadius &&
          (startX > cursorX && endX > cursorX ||
          startX < cursorX && endX < cursorX ||
          startY > cursorY && endY > cursorY ||
          startY < cursorY && endY < cursorY)) {
            continue;        
      }
      else {
        edgePotentials.push(edges[i]);
      }
    }
    return edgePotentials;
  }
  
  function moveCurrentNodeToCursor() {
    if (!overlapsWithAnotherNode(cursorX, cursorY, true)) {
      currentNode.setX(cursorX);
      currentNode.setY(cursorY); 
    }
  }
  
  function deleteIncidentEdges() {
    var deletedEdges = new Array();
    for (var i = 0; i < edges.length; i++) {
      if (edges[i].getToNode() == selectedItem || 
          edges[i].getFromNode() == selectedItem) {
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
    if (currentNode != selectedItem) {
      // Make the current node the selected node
      selectedItem = currentNode;
    } 
    // If the current node is selected, nullify the selected node variable
    else {
      selectedItem = null;
    }    
  }
  
  function placeNode () {
    // If there is space for a node to be placed at the cursor's position,
    // create a new node there
    if (nodeCanBePlaced()) {
      var newNode = new Node(cursorX,cursorY,nodeRadius,nodeNumber);
      nodes.push(newNode);  
      nodeNumber++;
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
      var newEdge = new Edge(selectedItem, currentNode);
      edges.push(newEdge);
      $('p#numberOfEdges').html(edges.length);
    }
  }
  
  function edgeCanBePlaced() {
    if (selectedItem == null || currentNode == null || currentNode == selectedItem) {
      return false;
    }
    for (var i = 0; i < edges.length; i++) {
      if ((edges[i].getFromNode() == selectedItem && 
          edges[i].getToNode() == currentNode) ||
          (edges[i].getToNode() == selectedItem && 
          edges[i].getFromNode() == currentNode)) {
          // Note that the last two expressions disallow directed graphs for now
        return false;
      }
    }
    return true;
  }
  
  function initiateDrag () {
    // Record that the mouse button is being held down and the starting 
    // coordinates of the dragging action.
    isMouseDown = true;
    startX = cursorX;
    startY = cursorY;
  }
  
  function nodeIsBeingDragged () {
    return isMouseDown && (startX != cursorX || startY != cursorY);
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
    if (graphMode == "build") {
      suggestEdgePosition();
    }    
    for (i = 0; i < edges.length; i++) {
      var toNode = edges[i].getToNode();
      var fromNode = edges[i].getFromNode();
      var isSelected = selectedItem == edges[i];
      drawEdgeValue(edges[i]);
      drawEdge(toNode, fromNode, isSelected);
    }    
  }  

  function drawNode (i) {
    var x = nodes[i].getX();
    var y = nodes[i].getY();
    context.beginPath();
    context.fillStyle = "#000000";
    context.font="18px sans-serif";
    context.fillText(nodes[i].getLabel(), x + nodeRadius, y - nodeRadius);
    if (selectedItem == nodes[i]) {
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
    if (selectedItem != null && currentNode != null && currentNode != selectedItem) {
      drawEdge(currentNode, selectedItem);
    }
  }
  
  function drawEdge(toNode, fromNode, isSelected) {
    var x0 = toNode.getX();
    var y0 = toNode.getY();
    var x1 = fromNode.getX();
    var y1 = fromNode.getY();
    context.beginPath();
    context.strokeStyle = "#000000";
    if (isSelected) {
      context.strokeStyle = "#0000FF"; 
    }
    context.moveTo(x0,y0);
    context.lineTo(x1,y1); 
    context.stroke();   
  }
  
  function drawEdgeValue(edge) {
    var fromNode = edge.getFromNode();
    var toNode = edge.getToNode();
    var x1 = fromNode.getX();
    var x2 = toNode.getX();
    var y1 = fromNode.getY();
    var y2 = toNode.getY();
    var midpointX = (x1+x2)/2;
    var midpointY = (y1+y2)/2;
    var dx = x2-midpointX;
    var dy = y2-midpointY;    
    var dist = Math.sqrt(dx*dx + dy*dy)
    dx /= dist;
    dy /= dist;
    var x3 = midpointX + 15*dy;
    var y3 = midpointY - 15*dx;
    var x4 = midpointX - 15*dy;
    var y4 = midpointY + 15*dx;
    context.beginPath();
    context.fillStyle = "#000000";
    context.font="16px sans-serif";
    if (y1 < y2) {
      //if (x1 < x2) {
        //context.fillText(edge.getValue(), x3,y3+10); 
      //}
      //else {
        context.fillText(edge.getValue(), x3,y3);
      //}
    }
    else {
      //if (x1 < x2) {
        //context.fillText(edge.getValue(), x4,y4);
      //}
      //else {
        context.fillText(edge.getValue(), x4,y4+10);
      //}
    }
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