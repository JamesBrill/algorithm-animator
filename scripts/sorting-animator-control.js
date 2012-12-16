$(document).delegate('#sorting-animator','pageinit',function () {
  var canvas1, canvas2, context; // Canvas variables
  var drawTimer; // Dictates rate at which canvas objects are redrawn
  var animationController = new AnimationController(); // Object that controls animation
  var width = $(window).width(); // Width of window
  var height = $(window).height(); // Height of window
  var algorithm = "bubble"; // Algorithm currently being animated
  var display;

  // Begin running the sorting animator
  init(); 

  // Initialization sequence
  function init () {
    // Find the canvas element
    canvas1 = $('#sorting-canvas1')[0];
    canvas2 = $('#sorting-canvas2')[0];
    if (!canvas1 || !canvas1.getContext) {
      alert('Error: browser does not support HTML5 canvas.');
      return;
    }

    // Get the 2D canvas context
    context = canvas1.getContext('2d');
    
    // Hide all unneeded elements
    $('.hide-at-init').hide(); 
    
    // Resize all elements on screen
    resizeDivs();
    
    // Initialise tooltips
    initialiseTooltips("sorting");    
    
    display = new BarGraph(canvas1);
    display.addInputNumber(1);
    display.addInputNumber(7);
    display.addInputNumber(7);
    display.addInputNumber(2);

    display.animateStep("swap 3 1", 20000); // MIN STEP DELAY IS 150
    setTimeout(function() {display.animateStep("swap 3 1", 20000); }, 20000);
    
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
      // Update canvas size
      canvas1.height = 0.72 * height - 4;
      canvas1.width = 0.5*width - 4;
            canvas2.height = 0.72 * height - 4;
      canvas2.width = 0.5*width - 4;
      
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

  // Event listener for when sorting animator page is shown
  $('#sorting-animator').live('pageshow', function () {
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

  // Event listener for when sorting animator page is hidden
  $('#sorting-animator').live('pagehide', function () {
    clearInterval(drawTimer);
    if (animationController.isReady()) {
      animationController.stop();
    }
  }); 
  
  // When a graph algorithm is selected, update the algorithm to be animated
  $('#sorting-select').change(function () {
    confirm('Do you want to reset the animator?', function(yes) {
      // If user clicked 'OK', reset animator
			if (yes) {
        algorithm = $('#sorting-select option:selected').val();
        animationController.stop();
        animationController = new AnimationController();
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
    animationController.play();
    $('#sorting-pause-button').attr('src', 'images/pause.png');
  });
  
  // When 'pause' button is clicked, pause algortihm and disable 'pause' button
  $('#sorting-pause').click(function () {
    if (animationController.isReady()) {
      animationController.pause();
      $('#sorting-pause-button').attr('src', 'images/paused.png');
    }
  });
  
  // When 'next' button is clicked, go to next step of algorithm
  $('#sorting-next').click(function () {
    animationController.next();
  });
  
  // When 'prev' button is clicked, go to previous step of algorithm
  $('#sorting-prev').click(function () {
    animationController.prev();
  });
  
  // When 'start' button is clicked, go to first step of algorithm
  $('#sorting-start').click(function () {
    animationController.beginning();
  });
  
  // When 'end' button is clicked, go to end of algorithm
  $('#sorting-end').click(function () {
    animationController.end();
  });
  
  // 'Change' event handler for slider. Updates step delay value
  $('#sorting-slider').change(function(){
    var stepsPerMinute = $(this).val();
    animationController.changeSpeed(60000 / stepsPerMinute);
  });    

  // Draws all items to the canvas
  function draw () {
    // Clear the contents of the canvas
    context.clearRect(0,0,canvas1.width,canvas1.height);    

    display.draw();
  }  
}); 