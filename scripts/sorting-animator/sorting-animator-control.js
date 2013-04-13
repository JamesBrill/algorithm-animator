// This is the code to be run when the Sorting Algorithms page is initialised. 
// It initialises all variables related to the sorting animator and
// begins the rendering cycle for any canvases that are being shown.
$(document).delegate('#sorting-animator','pageinit',function () {
  var canvasArray = new Array(); // Canvas array
  var canvasGroups = new Array(); // Canvas groups for each dataset
  var drawTimer; // Dictates rate at which canvas objects are redrawn
  var width = $(window).width(); // Width of window
  var height = $(window).height(); // Height of window
  var algorithm = "selection"; // Algorithm currently being animated
  var numberOfActiveCanvases = 0; // Number of canvases ready to be drawn on
  var baseCanvasIndex = 0; // Visible canvas when no displays are drawn
  var remainingHeight = determineRemainingCanvasHeight(); // Height allocated to canvas

  // Begin running the sorting animator
  init(); 
  
  // Initialization sequence
  function init () {
    // Hide three of the four canvases
    for (var i = 1; i < 4; i++) {
      $('#sorting-canvas' + (i+1)).hide();
    }
    
    // Display error message if canvas not supported
    if (!$('#sorting-canvas1')[0] || !$('#sorting-canvas1')[0].getContext) {
      alert('Error: browser does not support HTML5 canvas.');
      return;
    }
    
    // Create Canvas object for each HTML5 canvas
    for (i = 0; i < 4; i++) {
      canvasArray[i] = new Canvas('#sorting-canvas' + (i + 1));
    }
    
    // Resize all elements on screen
    resizeDivs();    
    
    // Initialise tooltips
    initialiseTooltips("sorting");  
    
    // Initialise click listeners
    initialiseClickListeners();
    
    // Begin drawing on the canvas
    drawTimer = setInterval(function() {draw()}, 25);
  }
  
  // Open popup when view creation button is clicked. Ensure all collapsible
  // menu elements are already collapsed when first opening the popup.
  $("#sorting-menu-button").click(function () {    
    collapsePopupCollapsibles();    
    $('#menu-popup').popup('open');
  });
    
  // Handler for view creation button inside the popup. Creates a new algorithm
  // view according to the user's specification.
  $('#create-algorithm-view').click(function() {
    // Parameters of algorithm view chosen by user
    var chosenAlgorithm = $('input:radio[name=algo-radio]:checked').val();
    var chosenView = $('input:radio[name=view-radio]:checked').val();
    var dataOrder = $('input:radio[name=order]:checked').val();
    var dataMode = $('input:radio[name=set-data]:checked').val();
    
    // Variable that will contain the generated dataset
    var sortingInput;
    
    // If the dataset is to be random, generate a random dataset
    if (dataMode == 'random') {
      var randomDataSize = $('#random-data-size').val();
      sortingInput = SortingInputGenerator.generateRandomSortingInput(randomDataSize, 100, dataOrder);
    }
    // Otherwise, generate dataset according to user's custom specification
    else {
      var inputData = $('#custom-data-content').val();
      sortingInput = SortingInputGenerator.parseInputList(inputData, dataOrder);
    }
    
    // If this dataset is not already being used by an existing algorithm view,
    // create a new canvas group for this dataset
    if (isNewDataSet(sortingInput)) {
      createNewCanvasGroup(sortingInput);
    }
    
    // Collapse all collapsible menus in the popup
    collapsePopupCollapsibles();
    
    // Add a canvas containing the new algorithm view
    addCanvas(sortingInput, chosenAlgorithm, chosenView);
        
    // Close the popup    
    $('#menu-popup').popup('close');
  });
    
  // When the window is resized, resize all elements
  $(window).resize(function() {
    // Update window size
    width = $(window).width();
    height = $(window).height();
    resizeDivs();
  });
  
  // Is a given dataset not already used by existing algorithm views?
  function isNewDataSet(input) {
    // Compare dataset with those used by existing canvas groups. 
    // If there is a match, it is not original, so return false.
    // Otherwise, return true.
    for (var i = 0; i < canvasGroups.length; i++) {
      if (canvasGroups[i].matchData(input)) {
        return false;
      }
    }
    return true;
  }
  
  // Create new canvas group using a given dataset
  function createNewCanvasGroup(input) {
    var newGroup = new CanvasGroup(input, canvasGroups.length);
    canvasGroups.push(newGroup);
  }
  
  // Remove given canvas group from canvas group array. Adjust group IDs to
  // ensure remaining datasets are still ordered from 0 upwards in unit increments.
  function removeCanvasGroup(group) {
    var newCanvasGroups = new Array();
    var idCounter = 0;
    for (var i = 0; i < canvasGroups.length; i++) {
      if (!canvasGroups[i].matchData(group.getData())) {
        newCanvasGroups.push(canvasGroups[i]);
        canvasGroups[i].setID(idCounter);
        idCounter++;
      }
    }
    canvasGroups = newCanvasGroups;
  }
  
  // Add new canvas with given dataset to a canvas group
  function addCanvasToGroup(canvas, input) {
    for (var i = 0; i < canvasGroups.length; i++) {
      if (canvasGroups[i].matchData(input)) {
        canvasGroups[i].addCanvas(canvas);
      }
    }    
  }
  
  // Remove a canvas from its canvas group
  function removeCanvasFromGroup(canvas) {
    // Find containing canvas group and remove canvas from it. If canvas group is
    // then empty, remove the canvas group.
    for (var i = 0; i < canvasGroups.length; i++) {
      if (canvasGroups[i].contains(canvas)) {
        canvasGroups[i].removeCanvas(canvas);
        if (canvasGroups[i].getCanvasArray().length == 0) {
          removeCanvasGroup(canvasGroups[i]);
        }
        return;
      }
    }    
    
    // Canvas should always be contained by a group before being deleted from one;
    // if this is the case, an error has occurred and an error message is produced.
    alert("Error: canvas not contained by any group.");
  }
  
  // Collapse all collapsible menus inside the view creation popup
  function collapsePopupCollapsibles() {
    $('#choose-algorithm').trigger('collapse');
    $('#choose-view').trigger('collapse');
    $('#choose-data').trigger('collapse');
    $('#choose-random-data').trigger('collapse');
    $('#choose-custom-data').trigger('collapse');
    $('#choose-data-order').trigger('collapse');
    $('#set-data').trigger('collapse');
  }
  
  // Initialise click listeners for each canvas to handle user interaction with them
  function initialiseClickListeners() {
    // For each canvas...
    for (var i = 0; i < canvasArray.length; i++) {
      // Virtual mouse click event handler
      $(canvasArray[i].getName()).bind('vclick', function (ev) {
        // Get the mouse position relative to the canvas element
        var cursorX = ev.pageX - this.offsetLeft - 2; // Accommodates border of 2px
        var cursorY = ev.pageY - this.offsetTop - 2; // Accommodates border of 2px
        
        // Get index of the canvas that was clicked on
        var index = ev.target.id.substring(ev.target.id.length-1) - 1;
        
        // If user clicked on 'delete' icon, remove the canvas
        if (canvasArray[index].getAnimationController().getDisplay().isDeleteClick(cursorX, cursorY)) {
          removeCanvas(index);
        }  
      });
    }
  }  
  
  // Add new algorithm view canvas to the screen
  function addCanvas(sortingInput, algorithm, view) {
    // If no active canvases, set animation for the default canvas that is always shown
    if (numberOfActiveCanvases == 0) {
      numberOfActiveCanvases++;  
      // Specify algorithm view details of canvas
      setAnimation(baseCanvasIndex, buckets.arrays.copy(sortingInput), algorithm, view);
      
      // Add the canvas to a canvas group
      addCanvasToGroup(canvasArray[baseCanvasIndex], sortingInput);
    }
    // If multiple active canvases, determine index of new canvas and set its animation
    else if (numberOfActiveCanvases > 0 && numberOfActiveCanvases < 4){
      // Determine index of new canvas
      var indexOfNewCanvas = 0;
      for (var i = 0; i < canvasArray.length; i++) {
        if (!canvasArray[i].isActive()) {
          indexOfNewCanvas = i; 
          break;
        }
      }
      // Unhide the new canvas
      canvasArray[indexOfNewCanvas].show();
      numberOfActiveCanvases++;  
      
      // Specify algorithm view details of canvas
      setAnimation(indexOfNewCanvas, buckets.arrays.copy(sortingInput), algorithm, view);
      
      // Add the canvas to a canvas group
      addCanvasToGroup(canvasArray[indexOfNewCanvas], sortingInput);
    }   
    
    // Resize page elements
    resizeDivs();
  }
  
  // Remove algorithm display with given index from the screen
  function removeCanvas(index) {
    // If chosen canvas is not active, remove the first active canvas
    if (!canvasArray[index].isActive()) {
      for (var i = 0; i < canvasArray.length; i++) {
        if (canvasArray[i].isActive()) {
          index = i; 
          break;
        }
      }
    }
    // If chosen canvas is active, shut it down
    if (index >= 0 && index <= 3 && canvasArray[index].isActive()) {
      // Shut down canvas
      canvasArray[index].shutdownDisplay(numberOfActiveCanvases); 
      numberOfActiveCanvases--;
      
      // Remove canvas from its canvas group
      removeCanvasFromGroup(canvasArray[index]);
      
      // If no more active canvases, update index of default canvas
      if (numberOfActiveCanvases == 0) {
        baseCanvasIndex = index;
      }
      
      // Resize page elements
      resizeDivs();
    }
  }
     
  // Initialise animation
  function setAnimation(index, sortingInput, algorithm, view) {
    // Create algorithm view object for the canvas to hold
    var newDisplay;
    if (view == "bar-graph") {
      newDisplay = new BarGraph(canvasArray[index].getUsableCanvas());
    }
    else if (view == "pseudocode-view") {
      newDisplay = new Pseudocode(canvasArray[index].getUsableCanvas());
    }
    else {
      newDisplay = null;
    }
    
    // Set the algorithm view fields of the canvas
    canvasArray[index].setAnimation(newDisplay, sortingInput, algorithm);
  }
  
  // Resize all elements
  function resizeDivs() {     
      // Update canvas size
      updateCanvasArray();
      
      // Calculate remaining height allocated to canvas after resizing other major elements
      determineRemainingCanvasHeight();
      
      // Update size of other elements      
      var menuButtonHeight = ($('#header').height() - 2);
      $('#sorting-menu-button').css('height', menuButtonHeight);      
      $('#sorting-menu-button').css('line-height', (0.4 * menuButtonHeight) + 'px');
      $('#sorting-animation-control-buttons').height('120px');
      $('#sorting-animation-control-buttons').width(0.3 * width);
      $('#sorting-animation-control-buttons').css("margin-left", (0.7 * width) + 'px');
      $('.control').css("height", 0.4 * ($('#sorting-animation-control-buttons').height()-4));
      $('.control').css("width", (1/6) * ($('#sorting-animation-control-buttons').width()+1));
      $('#sorting-slider-container').css('margin-top', '2px');
      $('#sorting-slider-container').css('width', $('#sorting-animation-control-buttons').width()-14);
      $('#sorting-slider-container').css('height', '50px');
      $('#sorting-slider-label').css('height', 0.5 * ($('#sorting-slider-container').height()-2));
      $('.slider + div.ui-slider').css("margin", '0px');
      $('.slider + div.ui-slider').css("width", $('#sorting-slider-container').width()-2);
      $('.slider + div.ui-slider').css("height", '20px');     
  }    
  
  // Calculate and set canvas height
  function determineRemainingCanvasHeight() {
    $('#header').css('height', '35px');
    $('#sorting-button-box').height('115px');
    remainingHeight = height - $('#header').height() - $('#sorting-button-box').height() - 10;
    return remainingHeight;
  }
  
  // Update attributes of canvas array
  function updateCanvasArray() {
    // If no active canvases, adjust the dimensions of the default canvas
    if (numberOfActiveCanvases == 0) {
      canvasArray[baseCanvasIndex].setHeight(remainingHeight - 4);
      canvasArray[baseCanvasIndex].setWidth(width - 4);
    }
    // Otherwise, determine dimensions and float attributes of all active canvases
    else {
      floatCanvasArray();
      resizeCanvasArray();
    }
    
    // Resize contents of each canvas
    for (var i = 0; i < canvasArray.length; i++) {
      if (canvasArray[i].isActive()) {
        canvasArray[i].getAnimationController().getDisplay().resize();
      }
    }
  }    
    
  // To ensure each canvas is positioned correctly, give them an appropriate 
  // CSS float attribute value.  
  function floatCanvasArray() {
    switch (numberOfActiveCanvases) {
      // If 0 or 1 active canvases, apply no float
      case 0:
        break;
      case 1:
        for (var i = 0; i < canvasArray.length; i++) {
          if (canvasArray[i].isActive()) {
            canvasArray[i].css('float', 'none');
            break;
          }
        }
        break;
      // If 2 or 3 active canvases, apply right-hand float to one of them
      case 2:     
      case 3:
        var activeCanvases = 0;
        for (i = 0; i < canvasArray.length; i++) {
          if (canvasArray[i].isActive()) {
            activeCanvases++;
          }
          if (activeCanvases == 1) {
            canvasArray[i].css('float', 'right');
          }
          else {
            canvasArray[i].css('float', 'none');
          }
        }
        break; 
      // If 4 active canvases, apply right-hand float to half of them  
      case 4:
        activeCanvases = 0;
        for (i = 0; i < canvasArray.length; i++) {
          if (canvasArray[i].isActive()) {
            activeCanvases++;
          }
          if (activeCanvases == 1 || activeCanvases == 3) {
            canvasArray[i].css('float', 'right');
          }
          else {
            canvasArray[i].css('float', 'none');
          }
        }
        break;        
    }
  }  
  
  // Resize canvases to ensure they fit neatly in the canvas area
  function resizeCanvasArray() {
    switch (numberOfActiveCanvases) {
      // If 1 active canvas, make it fill the canvas area
      case 1:
        for (var i = 0; i < canvasArray.length; i++) {
          if (canvasArray[i].isActive()) {
            canvasArray[i].setHeight(remainingHeight - 4);
            canvasArray[i].setWidth(width - 4);
          }
        }
        break;
      // If 2 active canvases, give them the canvas area's height and half of the
      // canvas area's width so they are placed side-by-side.
      case 2:
        for (i = 0; i < canvasArray.length; i++) {
          if (canvasArray[i].isActive()) {
            canvasArray[i].setHeight(remainingHeight - 4);
            canvasArray[i].setWidth(0.5 * width - 4);
          }
        }
        break;
      // If 3 active canvases, give two of them half of the canvas area's height and
      // width and give the third one half of the canvas area's height and its full
      // width so it is placed beneath the other two. 
      case 3:
        var activeCanvases = 0;
        for (i = 0; i < canvasArray.length; i++) {
          canvasArray[i].setHeight(0.5 * remainingHeight - 4);
          if (canvasArray[i].isActive()) {
            activeCanvases++;
          }
          if (activeCanvases == 3) {
            canvasArray[i].setWidth(width - 4);
          }
          else {
            canvasArray[i].setWidth(0.5 * width - 4);
          }
        }
        break; 
      // If 4 active canvases, give all of them half of the canvas area's height
      // and width so they each form a quadrant.
      case 4:
        for (i = 0; i < canvasArray.length; i++) {
          if (canvasArray[i].isActive()) {
            canvasArray[i].setHeight(0.5 * remainingHeight - 4);
            canvasArray[i].setWidth(0.5 * width - 4);
          }
        }
        break;        
    }
  }  
  
  // Pause animations in each canvas
  function pauseAll() {
    for (var i = 0; i < canvasArray.length; i++) {
      if (canvasArray[i].isActive()) {
        var animationController = canvasArray[i].getAnimationController();
        animationController.pause();
      }
    }
  }
  
  // Play animations in each canvas
  function playAll() {
    for (var i = 0; i < canvasArray.length; i++) {
      var animationController = canvasArray[i].getAnimationController();
      animationController.play();
    }
  }
    
  // Reset contents of each canvas
  function resetAll() {
    for (var i = 0; i < canvasArray.length; i++) {
      canvasArray[i].eraseAnimation();
    }
  }
  
  // Move to next animation step in each canvas
  function nextAll() {        
    for (var i = 0; i < canvasArray.length; i++) {
      var animationController = canvasArray[i].getAnimationController();
      animationController.next();
    }
  }

  // Move to previous animation step in each canvas
  function prevAll() {
    for (var i = 0; i < canvasArray.length; i++) {
      var animationController = canvasArray[i].getAnimationController();
      animationController.prev();
    }
  }
  
  // Move to first animation step in each canvas
  function startAll() {
    for (var i = 0; i < canvasArray.length; i++) {
      var animationController = canvasArray[i].getAnimationController();
      animationController.beginning();
    }
  }

  // Move to end of animation in each canvas
  function endAll() {
    for (var i = 0; i < canvasArray.length; i++) {
      var animationController = canvasArray[i].getAnimationController();
      animationController.end();
    }
  }
  
  // Set step delay of animations in each canvas in steps per minute
  function setStepDelay(stepsPerMinute) {
    for (var i = 0; i < canvasArray.length; i++) {
      var animationController = canvasArray[i].getAnimationController();
      animationController.setStepDelay(60000 / stepsPerMinute);
    }
  }  
  
  // Draw contents of each canvas
  function drawDisplays() {
    for (var i = 0; i < canvasArray.length; i++) {
      if (canvasArray[i].isActive()) {
        canvasArray[i].getAnimationController().getDisplay().draw();
      }
    }   
  }

  // Event listener for when sorting animator page is shown
  $('#sorting-animator').on('pageshow', function () {
    drawTimer = setInterval(function () { draw() }, 25);
    if (canvasArray[0].isActive()) {
      var animationController = canvasArray[0].getAnimationController();
      // What was the animation state when this page was last hidden?
      if (animationController.isPaused()) {
        pauseAll();
      }
      else {
        playAll();
      }
    }
  });

  // Event listener for when sorting animator page is hidden
  $('#sorting-animator').on('pagehide', function () {
    clearInterval(drawTimer);
    if (canvasArray[0].isActive()) {
      pauseAll();
    }
  }); 
  
  // When 'play' button is clicked, play animations and enable 'pause' button
  $('#sorting-play').click(function () {
    playAll();
  });
  
  // When 'pause' button is clicked, pause animations and disable 'pause' button
  $('#sorting-pause').click(function () {
    pauseAll();
  });
  
  // When 'next' button is clicked, go to next step of animations
  $('#sorting-next').click(function () {
    nextAll();
  });
  
  // When 'prev' button is clicked, go to previous step of animations
  $('#sorting-prev').click(function () {
    prevAll();
  });
  
  // When 'start' button is clicked, go to first step of animations
  $('#sorting-start').click(function () {
    startAll();
  });
  
  // When 'end' button is clicked, go to end of animations
  $('#sorting-end').click(function () {
    endAll();
  });
  
  // 'Change' event handler for slider. Updates animation speed
  $('#sorting-slider').change(function(){
    var stepsPerMinute = $(this).val();
    setStepDelay(stepsPerMinute);
  });    

  // Draws all items to the canvas
  function draw () {
    drawDisplays();
  }  
}); 