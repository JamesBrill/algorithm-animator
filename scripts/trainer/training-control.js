$(document).delegate('#training','pageinit',function () {
  var canvas = new Canvas('#training-canvas'); // Canvas
  var drawTimer; // Dictates rate at which canvas objects are redrawn
  var width = $(window).width(); // Width of window
  var height = $(window).height(); // Height of window
  var correctGuesses = 0;
  var totalGuesses = 0;

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
    var input = SortingInputGenerator.generateRandomSortingInput(10, 100, 'unchanged');
    setTrainingDisplay(input, 'bubble');
    
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
  
  function setTrainingDisplay(input, algorithm) {
    var display = new BarGraph(canvas.getUsableCanvas());
    canvas.setAnimation(display, input, algorithm);
    canvas.makeTrainingCanvas();
  }
  
  function collapsePopupCollapsibles() {
    $('#training-choose-algorithm').trigger('collapse');
    $('#training-choose-view').trigger('collapse');
    $('#training-choose-data').trigger('collapse');
    $('#training-choose-random-data').trigger('collapse');
    $('#training-choose-custom-data').trigger('collapse');
    $('#training-choose-data-order').trigger('collapse');
    $('#training-set-data').trigger('collapse');
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
    var actualInstruction = getInstructionWithOrderedIndexes(animationController.getNextAnimatedInstruction());
    return (userInstruction == actualInstruction);    
  }
  
  $('#am-i-right').click(function() {
    var animationController = canvas.getAnimationController();
    if (animationController.guessMade()) {
      totalGuesses++;
      var guessType = $('input:radio[name=guess-mode]:checked').val();
      var guessIndexes = animationController.getGuessIndexes();
      var guessWithUnorderedIndexes = guessType + " " + guessIndexes[0] + " " + guessIndexes[1];
      var guess = getInstructionWithOrderedIndexes(guessWithUnorderedIndexes);
      
      if (isCorrectAnswer(guess)) {
        $('#correct-or-wrong').css('color', 'green');
        $('#correct-or-wrong').text('Correct');
        correctGuesses++;
      }
      else {
        $('#correct-or-wrong').css('color', 'red');
        $('#correct-or-wrong').text('Wrong');
      }
      
      var correctRatioTextSize = $('#correct-ratio').width() / 12;
      $('#correct-ratio').css('font-size', correctRatioTextSize + 'px');
      $('#correct-ratio').text("Correct answers: " + correctGuesses + "/" + totalGuesses);      
      var userStepText = convertInstructionToText(guess);
      var userStepTextSize = $('#user-step').width() / 20;
      $('#user-step').css('font-size', userStepTextSize + 'px');
      $('#user-step').text("Predicted Step: " + userStepText);
      var actualInstruction = getInstructionWithOrderedIndexes(animationController.getNextAnimatedInstruction());
      var actualStepText = convertInstructionToText(actualInstruction);
      var actualStepTextSize = $('#actual-step').width() / 20;
      $('#actual-step').css('font-size', actualStepTextSize + 'px');
      $('#actual-step').text("Actual Step: " + actualStepText);
      
      animationController.clearGuessIndexes();
      animationController.next();
      
      setTimeout(function() {
        if (animationController.getNextAnimatedInstruction() == null) {
          animationController.end();
        }
      }, 100);
    }
  });
  
  function getInstructionWithOrderedIndexes(instruction) {
    var splitInstruction = instruction.split(" ");
    var instructionIndexes = splitInstruction.splice(1);
    var smallerIndex = Math.min.apply(Math, instructionIndexes);
    var largerIndex = Math.max.apply(Math, instructionIndexes);
    return splitInstruction[0] + " " + smallerIndex + " " + largerIndex;
  }
  
  function convertInstructionToText(instruction) {
    var splitInstruction = instruction.split(" ");
    var operation = splitInstruction[0];
    var firstIndex = splitInstruction[1];
    var secondIndex = splitInstruction[2];
    return operation.charAt(0).toUpperCase() + operation.slice(1) + " bars " + firstIndex +
           " and " + secondIndex + ".";
  }
  
  $('#show-me').click(function() {    
    var animationController = canvas.getAnimationController();
    animationController.clearGuessIndexes();
    $('#correct-or-wrong').text("");
    $('#user-step').text("");
    var actualInstruction = animationController.getNextAnimatedInstruction();
    var actualStepText = "";
    if (actualInstruction != null) {
      actualStepText = convertInstructionToText(actualInstruction);
    }
    $('#actual-step').text("Actual Step: " + actualStepText);
    animationController.next();
  });
  
  // Resize all elements, unless width is too small
  function resizeDivs() {    
      // Update size of other elements
      $('.training-grid').css('height', '35px');
      $('#guess-mode').css('height', '40px');
      $('#training-menu-button').css('height', '40px');
      
      var remainingHeight = height - 2 * $('.training-grid').height() - 
                            $('#guess-mode').height() - $('#training-menu-button').height() - 22;
      
      var userStepTextSize = $('#user-step').width() / 20;
      $('#user-step').css('font-size', userStepTextSize + 'px');
      
      var actualStepTextSize = $('#actual-step').width() / 20;
      $('#actual-step').css('font-size', actualStepTextSize + 'px');
      
      var correctRatioTextSize = $('#correct-ratio').width() / 12;
      $('#correct-ratio').css('font-size', correctRatioTextSize + 'px');
      
      // Update canvas size
      canvas.setHeight(remainingHeight);
      canvas.setWidth(width - 4);      
      if (canvas.isActive()) {
        canvas.getAnimationController().getDisplay().resize();
      }
  }    
  
  $("#training-menu-button").click(function () {
    collapsePopupCollapsibles();
    $('#training-menu-popup').popup('open');
  });
  
  $('#create-training-session').click(function() {
    var chosenAlgorithm = $('input:radio[name=training-algo]:checked').val();
    var dataOrder = $('input:radio[name=training-order]:checked').val();
    var dataMode = $('input:radio[name=training-set-data]:checked').val();
    var sortingInput;
    
    if (dataMode == 'random') {
      var randomDataSize = $('#training-random-data-size').val();
      sortingInput = SortingInputGenerator.generateRandomSortingInput(randomDataSize, 100, dataOrder);
    }
    else {
      var inputData = $('#training-custom-data-content').val();
      sortingInput = SortingInputGenerator.parseInputList(inputData, dataOrder);
    }
    
    collapsePopupCollapsibles();
    setTrainingDisplay(sortingInput, chosenAlgorithm);
    
    $('#training-menu-popup').popup('close');
    
    correctGuesses = 0;
    totalGuesses = 0;
    $('#correct-or-wrong').text("");
    $('#user-step').text("");
    $('#actual-step').text("");
    $('#correct-ratio').text("");
  });
  
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

