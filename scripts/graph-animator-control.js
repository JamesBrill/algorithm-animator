$(document).delegate('#graph-animator','pageinit',function () {
  var canvas, context; // Canvas variables
  var drawTimer; // Dictates rate at which canvas objects are redrawn
  var nodeRadius; // Radius of all nodes on the canvas
  var cursorX = -1; // X coordinate of cursor
  var cursorY = -1; // Y coordinate of cursor
  var nodes = new Array(); // Collection of nodes
  var edges = new Array(); // Collection of edges
  var currentItem = null; // Item that cursor is currently on
  var highlightMode = false; // Is an item being highlighted?
  var selectedItem = null; // The item currently selected
  var startX = 0; // Starting X coordinate of a drag
  var startY = 0; // Starting Y coordinate of a drag
  var isMouseDown = false; // Is the left mouse button held down?
  var nodeJustBeenPlaced = false; // Has a node just been placed?
  var graphMode = "build"; // The editing mode for the graph editor (build/run)
  var nodeNumber = 1; // Current node number
  var animationController = new AnimationController(); // Object that controls animation
  var width = $(window).width(); // Width of window
  var height = $(window).height(); // Height of window
  var pageX = 0; // Relative mouse x-coordinate
  var pageY = 0; // Relative mouse y-coordinate
  var algorithm = "dijkstra"; // Algorithm currently being animated

  // Begin running the graph animator
  init(); 

  // Initialization sequence
  function init () {
    // Find the canvas element
    canvas = $('#graph-canvas')[0];
    if (!canvas || !canvas.getContext) {
      alert('Error: browser does not support HTML5 canvas.');
      return;
    }

    // Get the 2D canvas context
    context = canvas.getContext('2d');
                
    // Hide all unneeded elements
    $('.hide-at-init').hide();
    
    // Set feed box to read-only
    $('.feed-box').prop("readonly", true);
    
    // Set proportional node radius
    nodeRadius = (width / 60);
    
    // Resize all elements on screen
    resizeDivs();
    
    // Initialise tooltips
    initialiseTooltips("graph");
    
    // Begin drawing on the canvas
    drawTimer = setInterval(function () { draw() }, 25);
  }
  
  // When the window is resized, resize all elements
  $(window).resize(function() {
    // Update window size
    width = $(window).width();
    height = $(window).height();
    resizeDivs();
  })
  
  // Resize all elements, unless width is too small
  function resizeDivs() {
    if (width > 500 && height > 500) {
      // Reposition nodes
      repositionNodes();
  
      // Update canvas size
      canvas.height = 0.72 * height - 4;
      canvas.width = width - 4;
      
      // Update size of other elements
      $('.mode').css('height', (0.06 * height)-1);
      $('.mode').css('line-height', '120%');
      $('#graph-select-button').css('height', (0.06 * height)-1);
      $('#graph-select-button').css('line-height', '140%');
      $('#graph-main-menu').css('line-height', '140%');
      $('#graph-button-box').height(0.22 * height - 10);
      $('#feed-title').height(0.15 * $('#graph-button-box').height());
      $('.bottom-left').css('width', 0.7 * width);
      $('.feed-box').css('height', $('#graph-button-box').height() - $('#feed-title').height());
      $('.feed-box').css('max-height', ($('#graph-button-box').height()) + 'px');
      $('.feed-box').css('max-width', (0.7 * width) + 'px');
      $('#graph-animation-control-buttons').height(0.18 * height);
      $('#graph-animation-control-buttons').width(0.3 * width);
      $('#graph-animation-control-buttons').css("margin-left", (0.7 * width) + 'px');
      $('.control').css("height", 0.4 * ($('#graph-animation-control-buttons').height()-4));
      $('.control').css("width", (1/6) * ($('#graph-animation-control-buttons').width()+1));
      $('#graph-slider-container').css('margin-top', '2px');
      $('#graph-slider-container').css('width', $('#graph-animation-control-buttons').width()-14);
      $('#graph-slider-container').css('height', 0.39 * ($('#graph-animation-control-buttons').height()-4));
      $('#graph-slider-label').css('height', 0.5 * ($('#graph-slider-container').height()-2));
      $('.ownslider + div.ui-slider').css("margin", '0px');
      $('.ownslider + div.ui-slider').css("width", $('#graph-slider-container').width()-2);
      $('.ownslider + div.ui-slider').css("height", 0.45 * ($('#graph-slider-container').height()-2));
      $('#feed-mode-container').css('width', $('#graph-animation-control-buttons').width()-10);
      $('#feed-mode-container').css('height', 0.3 * ($('#graph-animation-control-buttons').height()-4));
      $('.feed-mode').css('height', 0.95 * $('#feed-mode-container').height()); 
      $('.feed-mode').css('line-height', '50%');
      
      // Set proportional node radius
      nodeRadius = (width / 60);
    }
  }
  
  // Reposition nodes so that they remain in correct position on canvas
  function repositionNodes() {
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].setX(nodes[i].getXDepth() * (width - 4));
      nodes[i].setY(nodes[i].getYDepth() * (0.72 * height - 4));
    }  
  }
  
  // Virtual mouse-move event handler
  $('#graph-canvas').bind('vmousemove', function (ev) {
    // If in Build Mode...
    if (graphMode == "build" || (graphMode == "run" && !animationController.isReady())) {
      // Get the mouse position relative to the canvas element
      if (ev.pageX == undefined || ev.pageY == undefined) {
        cursorX = pageX - this.offsetLeft - 2; // Accommodates border of 2px
        cursorY = pageY - this.offsetTop - 2; // Accommodates border of 2px        
      }
      else {
        // Get the mouse position relative to the canvas element
        cursorX = ev.pageX - this.offsetLeft - 2; // Accommodates border of 2px
        cursorY = ev.pageY - this.offsetTop - 2; // Accommodates border of 2px
      }
    }

    // Variable that will contain the item the user has their mouse over
    var containingItem;

    // If in Build Mode...
    if (graphMode == "build") {
      // Get the node that the cursor is currently on, if there is one
      containingItem = determineSelectedItem();

      // Update the current item that the cursor is on
      updateCurrentItem(containingItem);
    }

    if (graphMode == "run" && !animationController.isReady()) {
      // Get the node that the cursor is currently on, if there is one
      containingItem = getNearbyNode(cursorX, cursorY, false, 1);     

      // Update the current item that the cursor is on
      updateCurrentItem(containingItem);
    }
  });
  
  // Virtual mouse-down event handler
$('#graph-canvas').bind('vmousedown', function (ev) { 
    // Prevent text from being highlighted
    ev.preventDefault();

    // Store current relative mouse position so vmousemove event handler can 
    // access it when it is fired (they are undefined in that handler otherwise).
    pageX = ev.pageX;
    pageY = ev.pageY;

    // Ensures cursor is moved to current location on touch devices
    $('#graph-canvas').trigger('vmousemove');

    // If in Build Mode...
    if (graphMode == "build") {
      if (!(currentItem != null && currentItem.isHighlighted() && currentItem instanceof Edge)) {
        // Attempt to place a node. If a new node cannot be placed, the user may 
        // have intended to have been trying to place a new edge; try this instead.
        if (!placeNode()) { 
          placeEdge();
        }  
      }
      
      // Attempt to initiate a dragging action
      initiateDrag(); 
    }

    // If in Run Mode and starting node hasn't been selected yet...
    if (graphMode == "run" && !animationController.isReady()) { 
      // If user has clicked on a node...
      if (currentItem != null && currentItem instanceof Node) {
        // Unhighlight that node and turn off highlight mode
        currentItem.highlight();
        highlightMode = false;        

        // Disable alert message
        $('#graph-button-box').qtip('hide');
        $('#graph-button-box').qtip('disable');

        // Initialise animation controller
        var animationData = new AnimationData(nodes, edges, currentItem);
        animationController.init(animationData, algorithm);
        animationController.setReady();
      }
    }
  });

  // Virtual mouse-up event handler 
$('#graph-canvas').bind('vmouseup', function () {
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
      
      // Update the mod buttons accordingly
      updateModificationButtons();

      // Record that the mouse button is no longer being held down
      isMouseDown = false;
    }
  });    

  // Event listener for when graph animator page is shown
  $('#graph-animator').on('pageshow', function () {
    drawTimer = setInterval(function () { draw() }, 25);
    if (animationController.isReady()) {
      if (animationController.isPaused()) {
        animationController.pause();
      }
      else {
        animationController.play();
      }
    }   
  });

  // Event listener for when graph animator page is hidden
  $('#graph-animator').on('pagehide', function () {
    clearInterval(drawTimer);
    if (animationController.isReady()) {
      animationController.stop();
    }    
  }); 
  
  // When a graph algorithm is selected, update the algorithm to be animated
  $('#graph-select').change(function () {
    confirm('Do you want to reset the animator?', function(yes) {
      // If user clicked 'OK', reset animator
			if (yes) {
        algorithm = $('#graph-select option:selected').val();
        animationController.stop();
        animationController = new AnimationController();
        $('#feed').val('');
        $('#currentStep').val('');
        nodes = new Array(); 
        edges = new Array(); 
        currentItem = null;
        highlightMode = false; 
        selectedItem = null;
        isMouseDown = false; 
        nodeJustBeenPlaced = false;
        nodeNumber = 1; 
      }
      // If user clicked 'Cancel', return selected algorithm to original value
      else {
        $('#graph-select').val(algorithm);
        $('#graph-select').selectmenu("refresh",true);
      }
		});    
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
  
  // Make sure the 'select starting node' tooltip is hidden when user moves to main menu
  $('#graph-main-menu').click(function() {
    $('#graph-button-box').qtip('hide');
  });
  
  // Change mode to Build when the "Build" button is clicked
  $('#build').click(function() {
    changeMode('build');
  })
    
  // Change mode to Run when the "Run" button is clicked
  $('#run').click(function() {
    if (graphMode != 'run') {
      changeMode('run');
    }
  })
  
  // Change feed mode to 'high-level'
  $('#high-level').click(function() {
    animationController.setFeedMode("high-level");
    animationController.updateFeed(animationController);
  });

  // Change feed mode to 'pseudocode'
  $('#pseudocode').click(function() {
    animationController.setFeedMode("pseudocode");
    animationController.updateFeed(animationController);
  });
  
  // 'Change' event handler for the graph mode selector
  function changeMode(newGraphMode) {
    // Ensure there are no timer duplicates
    animationController.clearTimer();
    
    // Record the previous graph mode
    var oldGraphMode = graphMode;   
    
    graphMode = newGraphMode;
       
    // If the user left Run Mode, remove the algorithm data from the nodes
    if (oldGraphMode == "run" && graphMode != "run") {
      // Disable alert message
      $('#graph-button-box').qtip('hide');
      if ($('#graph-button-box').qtip('disable', 'false')) {
        $('#graph-button-box').qtip('disable');
      }
      // Hide animation elements
      $('.hide-at-init').hide();
      // Ensure text on pause button is correct
      $('#graph-pause-button').attr('src', 'images/pause.png');
      // Reset animation controller
      animationController.reset();
      // Remove all animation-related data from nodes
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
    
    // If in Run Mode...
    if (graphMode == "run") { 
      // Show animation elements and hide mod buttons
      $('.hide-at-init').show();
      $('#mod-buttons').hide(); 
      
      // Initialise feed
      $('#feed-title').html("Current Line Of Algorithm (click box to see all lines so far)");
      $('#feed').hide();
      $('#feed').val('');
      $('#currentStep').show();
      $('#currentStep').val("");
      
      // Turn off highlight mode to enable cursor after mode change
      highlightMode = false;
      
      // Enable the 'pause' button and set the slider to 12
      $('#graph-slider').val(12).slider('refresh');

      // Turn on alert for user to select starting node
      activateAlert();
    }
  }
  
  // Alert user to the fact that a starting node needs to be selected
  function activateAlert() {
    $('#graph-button-box').qtip('enable');
    $('#graph-button-box').qtip('show');
  }  
    
  // When 'current step' box is clicked, show 'feed' box
  $('#currentStep').click(function () {
    $('#feed-title').html("All Lines Of Algorithm Run So Far (click box to see current line)");
    $('#currentStep').slideToggle('fast');
    // Pause to let 'current step' box disappear (prevents scroll bar from appearing)
    setTimeout(function() { $('#feed').slideToggle('fast') }, 400);
  });
  
  // When 'feed' box is clicked, show 'current step' box
  $('#feed').click(function () {
    $('#feed-title').html("Current Line Of Algorithm (click box to see all lines so far)");
    $('#feed').slideToggle('fast');
    // Pause to let 'feed' box disappear (prevents scroll bar from appearing)
    setTimeout(function() { $('#currentStep').slideToggle('fast') }, 400);
  });
  
  // When 'play' button is clicked, play algorithm and enable 'pause' button
  $('#graph-play').click(function () {
    animationController.play();
    $('#graph-pause-button').attr('src', 'images/pause.png');
  });
  
  // When 'pause' button is clicked, pause algortihm and disable 'pause' button
  $('#graph-pause').click(function () {
    if (animationController.isReady()) {
      animationController.pause();
      $('#graph-pause-button').attr('src', 'images/paused.png');
    }
  });
  
  // When 'next' button is clicked, go to next step of algorithm
  $('#graph-next').click(function () {
    animationController.next();
  });
  
  // When 'prev' button is clicked, go to previous step of algorithm
  $('#graph-prev').click(function () {
    animationController.prev();
  });
  
  // When 'start' button is clicked, go to first step of algorithm
  $('#graph-start').click(function () {
    animationController.beginning();
  });
  
  // When 'end' button is clicked, go to end of algorithm
  $('#graph-end').click(function () {
    animationController.end();
  });
  
  // 'Change' event handler for slider. Updates step delay value
  $('#graph-slider').change(function(){
    var stepsPerMinute = $(this).val();
    animationController.changeSpeed(60000 / stepsPerMinute);
 })
   
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
  function getNearbyNode (x,y,ignoreCurrentItem, checkLengthMultiplier) {  
    // For each node...
    for (var i = 0; i < nodes.length; i++) {
      // If current node isn't being ignored or this node isn't the current node...
      if (!ignoreCurrentItem || nodes[i] != currentItem) {
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
      // Update node's relative position on canvas
      var xDepth = cursorX/canvas.width;
      var yDepth = cursorY/canvas.height;
      currentItem.setDepth(xDepth,yDepth);
    }
  }
  
  // Deletes edges incident to the selected node 
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
      if (currentItem != null && currentItem.isHighlighted() && !isDragged) {
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
      // These depth coordinates record node's relative position on canvas
      var xDepth = cursorX/canvas.width;
      var yDepth = cursorY/canvas.height;
      var newNode = new Node(cursorX,cursorY,nodeNumber,xDepth,yDepth);
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
    if (selectedItem == null || currentItem == null || currentItem == selectedItem ||
        currentItem instanceof Edge || selectedItem instanceof Edge) {
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
    if (!highlightMode && (graphMode == "build" || (graphMode == "run" && !animationController.isReady()))) {
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
    if (graphMode == "run" && animationController.isActive()) {
      animationController.draw(node, context, nodeRadius);
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
    if (selectedItem != null && currentItem != null && currentItem != selectedItem &&
        selectedItem instanceof Node && currentItem instanceof Node && 
        edgeCanBePlaced()) {
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