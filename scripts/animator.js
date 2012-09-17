$(document).bind('pagecreate',function () {
  var canvas, context; // Canvas variables
  var nodeRadius; // Radius of all nodes on the canvas
  var cursorX, cursorY; // Coordinates of cursor
  var nodes = new Array(); // Collection of nodes
  var edges = new Array(); // Collection of edges
  var currentItem; // Item that cursor is currently on
  var highlightMode; // Is an item being highlighted?
  var selectedItem; // The item currently selected
  var startX, startY; // Starting coordinates of a drag
  var isMouseDown; // Is the left mouse button held down?
  var nodeJustBeenPlaced; // Has a node just been placed?
  var graphMode; // The editing mode for the graph editor (build/modify/run)
  var nodeNumber; // Current node number
  var algorithmAnimator; // Object that controls animation
  var animationTimer; // Timer that controls speed of animation

  // Begin running the app
  init(); 

  // Initialization sequence
  function init () {
    // Find the canvas element
    canvas = $('#canvas')[0];
    if (!canvas) {
      alert('Error: I cannot find the canvas element!');
      return;
    }

    if (!canvas.getContext) {
      alert('Error: no canvas.getContext!');
      return;
    }

    // Get the 2D canvas context
    context = canvas.getContext('2d');
    if (!context) {
      alert('Error: failed to getContext!');
      return;
    }
    
    // Set canvas width
    canvas.width = window.innerWidth - 14;
        
    // Initialise variables
    nodeRadius = 20;
    cursorX = -1;
    cursorY = -1;
    currentItem = null;
    highlightMode = false;
    selectedItem = null; 
    startX = 0;
    startY = 0;
    isMouseDown = false;
    nodeJustBeenPlaced = false;
    graphMode = "build";
    nodeNumber = 1;
    algorithmAnimator = null;
    animationTimer = null;
    
    // Hide all buttons related to item modification
    $('#mod-buttons').hide();
    
    // Hide algorithm feed text area and make it read-only
    $('#algorithm-feed-container').hide();
    $('#feed').prop("readonly", true);
    
    // Begin drawing on the canvas
    setInterval(function () { draw() }, 25);
  }
    
  // Virtual mouse-down event handler
  $('#canvas').bind('vmousedown', function (ev) {   
    // Prevent text from being highlighted
    ev.preventDefault();
    
    // If in Build Mode...
    if (graphMode == "build") {
      // Attempt to place a node. If a new node cannot be placed, the user may 
      // have intended to have been trying to place a new edge; try this instead.
      if (!placeNode()) { 
        placeEdge();
      }  
    }
    
    // If in Build Mode or Modify Mode...
    if (graphMode == "build" || graphMode == "modify") {
      // Attempt to initiate a dragging action
      initiateDrag();    
    }
  });

  // Virtual mouse-up event handler 
  $('#canvas').bind('vmouseup', function () {
    // If in Build Mode...
    if (graphMode == "build") {
      // If no drag was performed and the cursor is over a node that hasn't
      // just been placed, perform node selection.
      if (cursorX == startX && cursorY == startY && 
          currentItem != null && !nodeJustBeenPlaced) {
        updateSelectedItem();
      }  

      // Record that a node has finished being placed on the canvas. It can now
      // be selected.
      if (nodeJustBeenPlaced) {
        nodeJustBeenPlaced = false;
      }
    }
        
    // If in Modify Mode...
    if (graphMode == "modify") {
      // If the user has not performed a drag...
      if (cursorX == startX && cursorY == startY) {
        // Record any changes to the selected item
        updateSelectedItem();
        
        // Update the mod buttons accordingly
        updateModificationButtons();
      }     
    }
    
    // If in Build Mode or Modify Mode...
    if (graphMode == "build" || graphMode == "modify") {
      // Record that the mouse button is no longer being held down
      isMouseDown = false;
    }
  });
  
  // Virtual mouse-move event handler
  $('#canvas').bind('vmousemove', function (ev) {
    // If in Build Mode or Modify Mode...
    if (graphMode == "build" || graphMode == "modify") {
      // Get the mouse position relative to the canvas element
      cursorX = ev.pageX - this.offsetLeft - 2; // Accommodates border of 2px
      cursorY = ev.pageY - this.offsetTop - 2; // Accommodates border of 2px
    }
    
    // If in Build Mode...
    if (graphMode == "build") {
      // Get the node that the cursor is currently on, if there is one
      var containingNode = getNearbyNode(cursorX, cursorY, false, 1);
      
      // Update the current item that the cursor is on
      updateCurrentItem(containingNode);
    }
    
    // If in Build Mode
    if (graphMode == "modify") {
      // Get the node or edge that the cursor is currently on, if there is one
      var containingItem = determineSelectedItem();
      
      // Update the current item that the cursor is on
      updateCurrentItem(containingItem);
    }
  });
  
  // Click event handler for the 'delete' button
  $('#delete').click(function () {
    // Index of item to remove
    var index;
    // If selected item is a node...
    if (selectedItem instanceof Node) {
      // Delete any incident edges (disallows directional edges for now)
      deleteIncidentEdges(); 
      // Delete selected node
      index = nodes.indexOf(selectedItem);
      nodes.splice(index, 1);
      selectedItem = null;
    }
    
    // If selected item is an edge...
    else if (selectedItem instanceof Edge) {
      // Delete selected edge
      index = edges.indexOf(selectedItem);
      edges.splice(index, 1);
      selectedItem = null;
    }
    // Hide mod buttons as no item is currently selected
    $('#mod-buttons').hide();
  });
  
  // 'Change' event handler for the 'rename' text box
  $('#rename-item').change(function () {
    // If selected item is a node...
    if (selectedItem instanceof Node) {
      // Set the node's label to the contents of the text box
      selectedItem.setName($('#rename-item').val());
    }
    
    // If selected item is an edge...
    else if (selectedItem instanceof Edge) {
      // Set the edge's value to the contents of the text box 
      // (need to restrict to numerical values)
      selectedItem.setWeight(parseInt($('#rename-item').val()));
    }
  })
  
  // 'Change' event handler for the graph mode selector
  $('input[name=graph-mode]').change(function() {
    // Ensure there are no timer duplicates
    clearInterval(animationTimer);
    
    // Record the previous graph mode
    var oldGraphMode = graphMode;
    
    // Get current value of the selector
    graphMode = $('input[name=graph-mode]:checked').val();
    
    // If the user left Run Mode, remove the algorithm data from the nodes
    if (oldGraphMode == "run" && graphMode != "run") {
      $('#currentStep').html("");
      for (var i = 0; i < nodes.length; i++) {
        nodes[i].setLabel(nodes[i].getName());
        nodes[i].resetAlgorithmSpecificData();
      }
    }
    
    // If in Build Mode, hide the mod buttons (can't be used in this mode)
    if (graphMode == "build") {
      $('#mod-buttons').hide();
    }
    
    // Clear algorithm feed if user has left Run Mode
    if (graphMode != "run") {
      $('#feed').val('');
    }
    
    // Ensure there is no selected item after mode has been changed
    if (selectedItem != null) { 
      selectedItem = null;
    }
    
    // Hide algorithm feed - only Run Mode will show it
    $('#algorithm-feed-container').hide();
    
    // If in Run Mode, set up algorithm animator and being animation
    if (graphMode == "run") {  
      $('#mod-buttons').hide();
      $('#algorithm-feed-container').show();
      
      algorithmAnimator = new DijkstraAnimator(nodes,edges,nodes[0]);
      algorithmAnimator.buildAnimation();
      setTimeout(function () { updateAlgorithm() }, 1);
      animationTimer = setInterval(function () { updateAlgorithm() }, 5000);
    }
  });
  
  function updateAlgorithm() {
    algorithmAnimator.nextState();
    if (!algorithmAnimator.atEnd()) {
      var nextFeedLine = algorithmAnimator.getCurrentState().getFeedData();
      $('#currentStep').html(nextFeedLine);
      $('#feed').val($('#feed').val() + nextFeedLine);
      $('#feed').scrollTop($('#feed')[0].scrollHeight);
    }
  }
  
  $('#currentStep').click(function () {
    $('#feed').slideToggle();
  });
   
  // Updates the node or edge that is currently selected
  function updateSelectedItem() {
    // What did the user just click on?
    var itemClickedOn = determineSelectedItem(); 
    // If the user clicked on a selected item, un-select it
    if (itemClickedOn == selectedItem) {
      selectedItem = null;
    }   
    // Otherwise, select the item that the user clicked on    
    else {
      selectedItem = itemClickedOn;
    }  
  }
  
  // Update buttons used to modify the attributes of nodes and edges
  function updateModificationButtons() {
    // If no node or edge is selected, hide the mod buttons
    if (selectedItem == null) {
      $('#mod-buttons').hide();     
    }
    // Otherwise, show them
    else {
      $('#mod-buttons').show();
      // Show appropriate value in rename box
      if (selectedItem instanceof Node) {
        $('#rename-item').val(selectedItem.getLabel());
      }
      else if (selectedItem instanceof Edge) {
        $('#rename-item').val(selectedItem.getWeight()); 
      }
    }
  }
  
  // Test if a given node overlaps with any other node. The 
  // ignoreCurrentNode parameter determines whether the 
  // current node is included in this test. The checkLengthMultiplier
  // parameter determines whether a given node is overlapping any 
  // other node (value: 2) or has its centre inside another node 
  // (value: 1).
  function getNearbyNode (x,y,ignoreCurrentNode, checkLengthMultiplier) {  
    // For each node...
    for (var i = 0; i < nodes.length; i++) {
      // If current node isn't being ignored or this node isn't the current node...
      if (!ignoreCurrentNode || nodes[i] != currentItem) {
        // Coordinates of this node
        var nodeX = nodes[i].getX();
        var nodeY = nodes[i].getY();
        // Distance between this node and the given node
        var distanceBetweenNodes = distance(x,y,nodeX,nodeY);
        // If the two nodes overlap, return true
        if (distanceBetweenNodes < checkLengthMultiplier*nodeRadius) {
          return nodes[i];
        } 
      }
    }
    // If no node overlaps with given node, return false
    return null;
  }  
  
  // Determine which single node or edge the cursor is pointing to
  function determineSelectedItem() {
    // The only edges to be considered are ones that are nearby, reducing
    // the number of expensive distance calculations
    var edgePotentials = nearbyEdges();
    // The only node to be considered is the one containing the cursor
    var nodePotential = getNearbyNode(cursorX, cursorY, false, 1);
    // If the cursor is inside a node, return that node    
    if (nodePotential != null) {   
      return nodePotential;
    }
    
    // Nearest item found so far
    var nearestItem = null;
    // Distance to nearest item found so far
    var shortestDistance = Infinity;   

    // For each of the potential edges...
    for (var i = 0; i < edgePotentials.length; i++) {
      // Coordinates of the edge's start and end points
      var startX = edgePotentials[i].getFromNode().getX();
      var startY = edgePotentials[i].getFromNode().getY();
      var endX = edgePotentials[i].getToNode().getX();
      var endY = edgePotentials[i].getToNode().getY();
      
      // Distance from cursor to edge
      var edgeDistance = distanceFromPointToLineSegment(startX,startY,endX,endY,cursorX,cursorY);
      // If this distance is shorter than the shortest distance so far and is within the
      // cursor's radius, update the shortest distance and nearest item.
      if (edgeDistance < shortestDistance && edgeDistance < nodeRadius) {
        shortestDistance = edgeDistance;
        nearestItem = edgePotentials[i];
      }
    }    
    // Return the nearest item that was found
    return nearestItem;
  }
  
  // Returns an array of edges that are near to the cursor
  function nearbyEdges() {
    // Initialise array for nearby edges
    var edgePotentials = new Array();
    
    // For each edge...
    for (var i = 0; i < edges.length; i++) {
      // Coordinates of the edge's start and end points
      var startX = edges[i].getFromNode().getX();
      var startY = edges[i].getFromNode().getY();
      var endX = edges[i].getToNode().getX();
      var endY = edges[i].getToNode().getY();
      // Vertical and horizontal distances between cursor and edge
      var xDiff = Math.min(Math.abs(startX-cursorX), Math.abs(endX-cursorX));
      var yDiff = Math.min(Math.abs(startY-cursorY), Math.abs(endY-cursorY));
      // If both of these distances are greater than the cursor's radius AND
      // the edge does not cross the cursor diagonally, ignore the edge
      if (xDiff > nodeRadius && yDiff > nodeRadius &&
          (startX > cursorX && endX > cursorX ||
          startX < cursorX && endX < cursorX ||
          startY > cursorY && endY > cursorY ||
          startY < cursorY && endY < cursorY)) {
            continue;        
      }
      // Otherwise, add it to the array of nearby edges
      else {
        edgePotentials.push(edges[i]);
      }
    }
    // Return the array of nearby edges
    return edgePotentials;
  }
  
  // Moves the current node (selected node in Build Mode) to the cursor
  function moveCurrentNodeToCursor() {
    // If the cursor does not overlap any other node, move the current node
    // to its location.
    if (currentItem instanceof Node &&
        getNearbyNode(cursorX, cursorY, true, 2) == null) {
      currentItem.setX(cursorX);
      currentItem.setY(cursorY); 
    }
  }
  
  // Deletes edges incident to the selected node in Modify Mode
  function deleteIncidentEdges() {
    // Initialise an array of edges to be deleted
    var deletedEdges = new Array();
    
    // For each edge...
    for (var i = 0; i < edges.length; i++) {
      // If the edge is incident to the selected node, add it to the array of
      // edges to be deleted.
      if (edges[i].getToNode() == selectedItem || 
          edges[i].getFromNode() == selectedItem) {
        deletedEdges.push(edges[i]);
      }
    }
    
    // Delete each edge from the array
    for (var j = 0; j < deletedEdges.length; j++) {
      var index = edges.indexOf(deletedEdges[j]);
      edges.splice(index,1);
    }
  }
  
  // Update the current item that the cursor is on
  function updateCurrentItem (containingItem) {
    // Check if a node is currently being dragged
    var isDragged = nodeIsBeingDragged();   
    // If cursor is on an item AND no node is being dragged... 
    if (containingItem != null && !isDragged) {
      // If there is still a different current item, un-highlight it
      if (currentItem != null) {
        currentItem.highlight();
      }
      // Make current item the item that the cursor is on
      currentItem = containingItem;
      // Highlight the containing item and activate highlight mode    
      currentItem.highlight();
      highlightMode = true;
    }
    // If cursor is not on an item...
    else {       
      // If the current item is highlighted and no node is being dragged,
      // unhighlight it and deactivate highlight mode.
      if (currentItem.isHighlighted() && !isDragged) {
        currentItem.highlight();
        highlightMode = false;
      }
      // There is now no longer a current item, unless it is still being dragged
      if (!isDragged) {
        currentItem = null;
      }
    }   
    
    // If a node being dragged, move it to where the cursor is
    if (isDragged) {
      moveCurrentNodeToCursor();
    }
  }

  // Attempt to place a new node where the cursor is
  function placeNode () {
    // If there is space for a node to be placed at the cursor's position,
    // create a new node there
    if (nodeCanBePlaced()) {      
      var newNode = new Node(cursorX,cursorY,nodeRadius,nodeNumber);
      nodes.push(newNode);  
      nodeNumber++;
      currentItem = newNode;
      currentItem.highlight();
      highlightMode = true;
      nodeJustBeenPlaced = true;  
      return true;
    }
    return false;
  }
  
  // Attempt to place a new edge 
  function placeEdge() {
    // If an edge can be placed between the selected and current nodes, do so
    if (edgeCanBePlaced()) {
      var newEdge = new Edge(selectedItem, currentItem);
      edges.push(newEdge);
    }
  }
  
  // Returns true if edge can be placed between the selected and current nodes
  function edgeCanBePlaced() {
    // If user has not clicked a node different to the selected node, return false
    if (selectedItem == null || currentItem == null || currentItem == selectedItem) {
      return false;
    }
    
    // If an edge already exists between the two nodes, return false
    for (var i = 0; i < edges.length; i++) {
      if ((edges[i].getFromNode() == selectedItem && 
          edges[i].getToNode() == currentItem) ||
          (edges[i].getToNode() == selectedItem && 
          edges[i].getFromNode() == currentItem)) {
          // Note that the last two expressions disallow directed graphs for now
        return false;
      }
    }
    // If no edge already exists between the two nodes, return true
    return true;
  }
  
  // Record that the mouse button is being held down and the starting 
  // coordinates of the dragging action.
  function initiateDrag () {    
    isMouseDown = true;
    startX = cursorX;
    startY = cursorY;
  }
  
  // Returns true if a node is being dragged. Note that the cursor may not
  // currently be over a node due to latency, so a node check is not included.
  function nodeIsBeingDragged () {
    return isMouseDown && (startX != cursorX || startY != cursorY);
  }
  
  // Returns true if a node can be placed at the cursor's position
  function nodeCanBePlaced () {
    return isInsideCanvas(cursorX, cursorY) && 
           getNearbyNode(cursorX, cursorY, false, 2) == null;
  }    

  // Returns true if the given coordinates are inside the canvas
  function isInsideCanvas (x,y) {
    if (x >= nodeRadius && y >= nodeRadius && x <= canvas.width-nodeRadius && 
        y <= canvas.height-nodeRadius) {
      return true;
    }
    return false;
  }

  // Draws all items to the canvas
  function draw () {
    // Clear the contents of the canvas
    context.clearRect(0,0,canvas.width,canvas.height);  
       
    // Draw each node
    for (var i = 0; i < nodes.length; i++) {
      drawNode(nodes[i]);
    }
    
    // If nothing is being highlighted while building, draw an appropriate cursor
    if (!highlightMode && graphMode == "build") {
      drawCursor();
    }
    
    // If the user is in build mode, suggest a potential edge if possible
    if (graphMode == "build") {
      drawPotentialEdge();
    }    
    
    // Draw each edge
    for (i = 0; i < edges.length; i++) {      
      drawEdge(edges[i]);
    }    
  }  
  
  // Draws a cursor on the canvas
  function drawCursor() {
    // Begin drawing
    context.beginPath();
    
    // If a node could be placed here, draw a green cursor
    if (isInsideCanvas(cursorX, cursorY) && getNearbyNode(cursorX, cursorY, false, 2) == null) {
      context.strokeStyle = "#008000";
    }
    // Otherwise, draw a red cursor
    else {
      context.strokeStyle = "#FF0000";
    }
    
    // Draw cursor
    context.arc(cursorX,cursorY,nodeRadius,0,Math.PI*2,false);
    context.stroke();
  }

  // Draws a given node on to the canvas
  function drawNode(node) {    
    // Coordinates of the node's centre
    var x = node.getX();
    var y = node.getY();
    
    // Begin drawing
    context.beginPath();
    
    // Fill style is black by default
    context.fillStyle = "#000000";
    
    // Draw the node's label
    context.font="18px sans-serif";
    context.fillText(node.getLabel(), x + nodeRadius, y - nodeRadius);
    
    // Use the algorithm animator to draw the node if in Run Mode
    if (graphMode == "run" && algorithmAnimator != null) {
      algorithmAnimator.drawNode(node, context);
    }
    else {
      // If the node is selected, set it's colour to blue
      if (selectedItem == node) {
        context.fillStyle = "#0000FF"; 
      }

      // Draw the node
      context.arc(x,y,nodeRadius,0,Math.PI*2,false);
      context.fill();  

      // If the node is highlighted, give it a yellow outer ring
      if (node.isHighlighted()) {
        context.strokeStyle = "#FFD700";
        for (var i = 0; i < 3; i++) {
          context.arc(x,y,nodeRadius-i,0,Math.PI*2,false);
        }
        context.stroke(); 
      } 
    }
  }

  // Draws a 'ghost' edge that could potentially be placed if the mouse was clicked
  function drawPotentialEdge() {
    // If user has clicked a node different to the selected node, draw the potential edge
    if (selectedItem != null && currentItem != null && currentItem != selectedItem) {
      var potentialEdge = new Edge(currentItem,selectedItem); 
      potentialEdge.setWeight(0);
      drawEdge(potentialEdge);
    }
  }
  
  // Draw edge with given endpoints on to the canvas
  function drawEdge(edge) {
    // Coordinates of the edge's endpoints
    var x0 = edge.getToNode().getX();
    var y0 = edge.getToNode().getY();
    var x1 = edge.getFromNode().getX();
    var y1 = edge.getFromNode().getY();
    
    // Begin drawing
    context.beginPath();
    
    // Edges are coloured black by default, yellow if they are highlighted and
    // blue if they are selected
    context.strokeStyle = "#000000";
    if (edge == selectedItem) {
      context.strokeStyle = "#0000FF"; 
    }
    else if (edge.isHighlighted()) {
      context.strokeStyle = "#FFD700";
    }    
    
    // Draw the edge
    context.moveTo(x0,y0);
    context.lineTo(x1,y1); 
    context.stroke();   
    
    // Draw the edge's value
    drawEdgeValue(edge);
  }
  
  // Draw the value of an edge on to the canvas
  function drawEdgeValue(edge) {
    // Calculate appropriate coordinates to draw text next to edge
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
    
    // Begin drawing
    context.beginPath();
    context.fillStyle = "#000000";
    context.font="16px sans-serif";
    
    // Draw at coordinates where the edge is least likely to cross the text 
    if (y1 < y2) {
      context.fillText(edge.getWeight(), x3,y3+5);
    }
    else {
      context.fillText(edge.getWeight(), x4,y4+5);
    }
  }  
}); 