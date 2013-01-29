$(document).delegate('#sorting-animator','pageinit',function () {
  var canvasArray = new Array(); // Canvas array
  var drawTimer; // Dictates rate at which canvas objects are redrawn
  var animationControllers = new Array(); // Object that controls animation
  var width = $(window).width(); // Width of window
  var height = $(window).height(); // Height of window
  var algorithm = "selection"; // Algorithm currently being animated
  var displays = new Array(); // Array of algorithm displays

  // Begin running the sorting animator
  init(); 

  // Initialization sequence
  function init () {
    for (var i = 1; i < 4; i++) {
      $('#sorting-canvas' + (i+1)).hide();
    }
    
    if (!$('#sorting-canvas1')[0] || !$('#sorting-canvas1')[0].getContext) {
      alert('Error: browser does not support HTML5 canvas.');
      return;
    }
    
    // Hide all unneeded elements
    //$('.hide-at-init').hide();              
       
    var randomSortingInput = SortingInputGenerator.generateRandomSortingInput(15, 100);
    addDisplay(randomSortingInput, algorithm);
    addDisplay(randomSortingInput, algorithm);
    addDisplay(randomSortingInput, algorithm);
    addDisplay(randomSortingInput, algorithm);
    
    // Resize all elements on screen
    resizeDivs();    
    
    // Initialise tooltips
    initialiseTooltips("sorting");   
    
    // Begin drawing on the canvas
    drawTimer = setInterval(function() { draw() }, 25);
  }
  
  // When the window is resized, resize all elements
  $(window).resize(function() {
    // Update window size
    width = $(window).width();
    height = $(window).height();
    resizeDivs();
  })
  
  // Add new algorithm display to the screen
  function addDisplay(randomSortingInput, algorithm) {
    addController();
    resizeDivs();
    for (var i = 0; i < animationControllers.length; i++) {
      setUpController(i, buckets.arrays.copy(randomSortingInput), algorithm);
    }
  }
   
  // Add new animation controller
  function addController() {
    var size = canvasArray.length;
    canvasArray[size] = new Canvas('#sorting-canvas' + (size + 1));
    canvasArray[size].show();
    var newAnimationController = new SmoothAnimationController();
    animationControllers.push(newAnimationController);
  }
  
  // Initialise animation controllers
  function setUpController(index, sortingInput, algorithm) {
    var newDisplay = new BarGraph(canvasArray[index].getUsableCanvas());
    displays.push(newDisplay);
    var data = new SortingAnimationData(sortingInput);
    animationControllers[index].init(data, algorithm, newDisplay);
    animationControllers[index].setPauseButtonID("#sorting-pause-button"); 
  }
  
  // Resize all elements, unless width is too small
  function resizeDivs() {
    if (width > 500 && height > 500) {       
      // Update canvas size
      resizeCanvasArray();
      
      // Update size of other elements
      $('.mode').css('height', (0.06 * height)-1);
      $('.mode').css('line-height', '120%');
      $('#sorting-select-button').css('height', (0.06 * height)-1);
      $('#sorting-select-button').css('line-height', '140%');
      $('#sorting-main-menu').css('line-height', '140%');
      $('#sorting-button-box').height(0.22 * height - 10);
      $('.bottom-left').css('width', 0.7 * width);
      $('#sorting-animation-control-buttons').height(0.18 * height);
      $('#sorting-animation-control-buttons').width(0.3 * width);
      $('#sorting-animation-control-buttons').css("margin-left", (0.7 * width) + 'px');
      $('.control').css("height", 0.4 * ($('#sorting-animation-control-buttons').height()-4));
      $('.control').css("width", (1/6) * ($('#sorting-animation-control-buttons').width()+1));
      $('#sorting-slider-container').css('margin-top', '2px');
      $('#sorting-slider-container').css('width', $('#sorting-animation-control-buttons').width()-14);
      $('#sorting-slider-container').css('height', 0.39 * ($('#sorting-animation-control-buttons').height()-4));
      $('#sorting-slider-label').css('height', 0.5 * ($('#sorting-slider-container').height()-2));
      $('.ownslider + div.ui-slider').css("margin", '0px');
      $('.ownslider + div.ui-slider').css("width", $('#sorting-slider-container').width()-2);
      $('.ownslider + div.ui-slider').css("height", 0.45 * ($('#sorting-slider-container').height()-2));      
    }
  }    
  
  function resizeCanvasArray() {
    if (canvasArray.length == 0) {
      $('#sorting-canvas1')[0].height = 0.72 * height - 4;
      $('#sorting-canvas1')[0].width = width - 4;
    }
    else {
      for (var i = 0; i < canvasArray.length; i++) {
        canvasArray[i].resize(canvasArray.length, width, height);
      }
    }
  }  
  
  function pauseAll() {
    for (var i = 0; i < animationControllers.length; i++) {
      animationControllers[i].pause();
    }
  }
  
  function playAll() {
    for (var i = 0; i < animationControllers.length; i++) {
      animationControllers[i].play();
    }
  }
  
  function stopAll() {
    for (var i = 0; i < animationControllers.length; i++) {
      animationControllers[i].play();
    }
  }
  
  function resetAll() {
    for (var i = 0; i < animationControllers.length; i++) {
      animationControllers[i] = new AnimationController();
    }
  }
  
  function nextAll() {    
    for (var i = 0; i < animationControllers.length; i++) {
      animationControllers[i].next();
    }
  }
  
  function prevAll() {
    for (var i = 0; i < animationControllers.length; i++) {
      animationControllers[i].prev();
    }
  }
  
  function startAll() {
    for (var i = 0; i < animationControllers.length; i++) {
      animationControllers[i].beginning();
    }
  }
  
  function endAll() {
    for (var i = 0; i < animationControllers.length; i++) {
      animationControllers[i].end();
    }
  }
  
  function setStepDelay(stepsPerMinute) {
    for (var i = 0; i < animationControllers.length; i++) {
      animationControllers[i].setStepDelay(60000 / stepsPerMinute);
    }
  }  
  
  function drawDisplays() {
    for (var i = 0; i < displays.length; i++) {
      displays[i].draw();
    }    
  }

  // Event listener for when sorting animator page is shown
  $('#sorting-animator').live('pageshow', function () {
    drawTimer = setInterval(function () {draw()}, 25);
    // What was the animation state when this page was last hidden?
    if (animationControllers[0].isPaused()) {
      pauseAll();
    }
    else {
      playAll();
    }
  });

  // Event listener for when sorting animator page is hidden
  $('#sorting-animator').live('pagehide', function () {
    clearInterval(drawTimer);
    if (animationControllers[0].isReady()) {
      stopAll();
    }
  }); 
  
  // When a graph algorithm is selected, update the algorithm to be animated
  $('#sorting-select').change(function () {
    confirm('Do you want to reset the animator?', function(yes) {
      // If user clicked 'OK', reset animator
			if (yes) {
        algorithm = $('#sorting-select option:selected').val();
        stopAll();
        resetAll();
      }
      // If user clicked 'Cancel', return selected algorithm to original value
      else {
        $('#sorting-select').val(algorithm);
        $('#sorting-select').selectmenu("refresh",true);
      }
		});    
  });      
  
  // When 'play' button is clicked, play algorithm and enable 'pause' button
  $('#sorting-play').click(function () {
    playAll();
  });
  
  // When 'pause' button is clicked, pause algortihm and disable 'pause' button
  $('#sorting-pause').click(function () {
    pauseAll();
  });
  
  // When 'next' button is clicked, go to next step of algorithm
  $('#sorting-next').click(function () {
    nextAll();
  });
  
  // When 'prev' button is clicked, go to previous step of algorithm
  $('#sorting-prev').click(function () {
    prevAll();
  });
  
  // When 'start' button is clicked, go to first step of algorithm
  $('#sorting-start').click(function () {
    startAll();
  });
  
  // When 'end' button is clicked, go to end of algorithm
  $('#sorting-end').click(function () {
    endAll();
  });
  
  // 'Change' event handler for slider. Updates step delay value
  $('#sorting-slider').change(function(){
    var stepsPerMinute = $(this).val();
    setStepDelay(stepsPerMinute);
  });    

  // Draws all items to the canvas
  function draw () {
    drawDisplays();
  }  
}); 