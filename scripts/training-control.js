$(document).delegate('#training','pageinit',function () {
  var canvas = new Canvas('#training-canvas'); // Canvas
  var drawTimer; // Dictates rate at which canvas objects are redrawn
  var width = $(window).width(); // Width of window
  var height = $(window).height(); // Height of window

  // Begin running the sorting animator
  init(); 
  
  // Initialization sequence
  function init () {
    // Disables scrollbars. Prevents jQuery Mobile popups from mysteriously
    // breaking layout, apparently by adding a scrollbar and not affecting the
    // size of any elements. Why this happened is still a mystery.
    //$("body").css("overflow", "hidden");
    
    if (!$('#training-canvas')[0] || !$('#training-canvas')[0].getContext) {
      alert('Error: browser does not support HTML5 canvas.');
      return;
    }
    
    // Hide all unneeded elements
    //$('.hide-at-init').hide();    q
    
    // Resize all elements on screen
    resizeDivs();    
    
    // Initialise tooltips
    initialiseTooltips("sorting");  
    
    // Initialise canvas for training display/interaction
    initialiseTrainingDisplay();
    
    // Initialise click listener
    initialiseClickListener();
    
    // Begin drawing on the canvas
    drawTimer = setInterval(function() {draw()}, 25);
  }
    
  // When the window is resized, resize all elements
  $(window).resize(function() {
    // Update window size
    width = $(window).width();
    height = $(window).height();
    resizeDivs();
  });
  
  function initialiseTrainingDisplay() {
    var display = new BarGraph(canvas.getUsableCanvas());
    var input = SortingInputGenerator.generateRandomSortingInput(10, 100, 'unchanged');
    canvas.setAnimation(display, input, 'bubble');
    canvas.makeTrainingCanvas();
  }
  
  function initialiseClickListener() {
    // Virtual mouse click event handler
    $(canvas.getName()).bind('vclick', function (ev) {
      // Get the mouse position relative to the canvas element
      var cursorX = ev.pageX - this.offsetLeft - 2; // Accommodates border of 2px
      var cursorY = ev.pageY - this.offsetTop - 2; // Accommodates border of 2px

      canvas.getAnimationController().getDisplay().registerClick(cursorX, cursorY); 
    });
  }  
  
  function isCorrectAnswer(userInstruction) {
    var animationController = canvas.getAnimationController();
    var actualInstruction = animationController.getNextAnimatedInstruction();
    return (userInstruction == actualInstruction);    
  }
  
  $('#am-i-right').click(function() {
    var animationController = canvas.getAnimationController();
    if (animationController.guessMade()) {
      var guessType = $('input:radio[name=guess-mode]:checked').val();
      var guessIndexes = animationController.getGuessIndexes();
      var smallerIndex = Math.min.apply(Math, guessIndexes);
      var largerIndex = Math.max.apply(Math, guessIndexes);
      var guess = guessType + " " + smallerIndex + " " + largerIndex;
      if (isCorrectAnswer(guess)) {
        alert("CORRECT");
      }
      else {
        alert("WRONG");
      }
      animationController.clearGuessIndexes();
      animationController.next();
    }
  });
  
  $('#show-me').click(function() {    
    var animationController = canvas.getAnimationController();
    if (animationController.guessMade()) {
      animationController.clearGuessIndexes();
    } 
    animationController.next();
  });
  
  // Resize all elements, unless width is too small
  function resizeDivs() {
    //if (width > 500 && height > 500) {       
      // Update canvas size
      canvas.setHeight(0.72 * height - 4);
      canvas.setWidth(width - 4);      
      if (canvas.isActive()) {
        canvas.getAnimationController().getDisplay().resize();
      }
      
      // Update size of other elements
      /*$('#header').css('height', (0.06 * height)-1);
      var menuButtonHeight = ($('#header').height() - 2);
      $('#menu-button').css('height', menuButtonHeight);      
      $('#menu-button').css('line-height', (0.4 * menuButtonHeight) + 'px');
      $('#sorting-button-box').height(0.22 * height - 10);      
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
      $('.ownslider + div.ui-slider').css("height", 0.45 * ($('#sorting-slider-container').height()-2));*/      
    //}
  }    
  
  // Event listener for when sorting animator page is shown
  $('#training').on('pageshow', function () {
    drawTimer = setInterval(function () {draw()}, 25);
  });

  // Event listener for when sorting animator page is hidden
  $('#training').on('pagehide', function () {
    clearInterval(drawTimer);
  }); 

  // Draws all items to the canvas
  function draw () {
    canvas.getAnimationController().getDisplay().draw();   
  }  
}); 

