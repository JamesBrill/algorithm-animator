// This is the code to be run when the Training page is initialised. 
// It initialises all variables related to the trainer and
// begins the rendering cycle for the canvas.
$(document).delegate('#training','pageinit',function () {
  var canvas = new Canvas('#training-canvas'); // Canvas
  var drawTimer; // Dictates rate at which canvas objects are redrawn
  var width = $(window).width(); // Width of window
  var height = $(window).height(); // Height of window
  var correctGuesses = 0; // Number of correct guesses made in current training session
  var totalGuesses = 0; // Total number of guesses made in current training session

  // Begin running the trainer
  init(); 
  
  // Initialization sequence
  function init () {    
    // Display error message if canvas not supported
    if (!$('#training-canvas')[0] || !$('#training-canvas')[0].getContext) {
      alert('Error: browser does not support HTML5 canvas.');
      return;
    }
        
    // Resize all elements on screen
    resizeDivs();    
    
    // Initialise tooltips
    initialiseTooltips("trainer");  
    
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
  
  // Set the contents of the training canvas
  function setTrainingDisplay(input, algorithm) {
    var display = new BarGraph(canvas.getUsableCanvas());
    canvas.setAnimation(display, input, algorithm);
    canvas.makeTrainingCanvas();
  }
  
  // Collapse all collapsible menus inside the training session creation popup
  function collapsePopupCollapsibles() {
    $('#training-choose-algorithm').trigger('collapse');
    $('#training-choose-view').trigger('collapse');
    $('#training-choose-data').trigger('collapse');
    $('#training-choose-random-data').trigger('collapse');
    $('#training-choose-custom-data').trigger('collapse');
    $('#training-choose-data-order').trigger('collapse');
    $('#training-set-data').trigger('collapse');
  }
  
  // Initialise click listeners for the canvas  
  function initialiseClickListener() {
    // Virtual mouse click event handler
    $(canvas.getName()).bind('vclick', function (ev) {
      // Get the mouse position relative to the canvas element
      var cursorX = ev.pageX - this.offsetLeft - 2; // Accommodates border of 2px
      var cursorY = ev.pageY - this.offsetTop - 2; // Accommodates border of 2px

      canvas.getAnimationController().getDisplay().registerClick(cursorX, cursorY); 
    });
  }  
  
  // Given a predicted instruction from the user, is this prediction correct?
  function isCorrectAnswer(userInstruction) {
    var animationController = canvas.getAnimationController();
    // Get actual instruction taken by algorithm
    var actualInstruction = getInstructionWithOrderedIndexes(animationController.getNextAnimatedInstruction());
    // Return comparison with user-provided instruction
    return (userInstruction == actualInstruction);    
  }
  
  // Click handler for the 'Am I Right?' button
  $('#am-i-right').click(function() {
    var animationController = canvas.getAnimationController();
    
    // If two bars have been selected on the canvas...
    if (animationController.guessMade()) {
      // Increment total guesses
      totalGuesses++;
      
      // Type of operation predicted (swap or compare)
      var guessType = $('input:radio[name=guess-mode]:checked').val();
      
      // Construct the user-provided instruction for the information available
      var guessIndexes = animationController.getGuessIndexes();
      var guessWithUnorderedIndexes = guessType + " " + guessIndexes[0] + " " + guessIndexes[1];
      var guess = getInstructionWithOrderedIndexes(guessWithUnorderedIndexes);
      
      // Set colour and content of 'Correct/Wrong' text box according to correctness of prediction
      if (isCorrectAnswer(guess)) {
        $('#correct-or-wrong').css('color', 'green');
        $('#correct-or-wrong').text('Correct');
        correctGuesses++;
      }
      else {
        $('#correct-or-wrong').css('color', 'red');
        $('#correct-or-wrong').text('Wrong');
      }
      
      // Update the user's score
      var correctRatioTextSize = $('#correct-ratio').width() / 12;
      $('#correct-ratio').css('font-size', correctRatioTextSize + 'px');
      $('#correct-ratio').text("Correct answers: " + correctGuesses + "/" + totalGuesses); 
      
      // Show predicted step
      var userStepText = convertInstructionToText(guess);
      var userStepTextSize = $('#user-step').width() / 20;
      $('#user-step').css('font-size', userStepTextSize + 'px');
      $('#user-step').text("Predicted Step: " + userStepText);
      
      // Show actual step taken
      var actualInstruction = getInstructionWithOrderedIndexes(animationController.getNextAnimatedInstruction());
      var actualStepText = convertInstructionToText(actualInstruction);
      var actualStepTextSize = $('#actual-step').width() / 20;
      $('#actual-step').css('font-size', actualStepTextSize + 'px');
      $('#actual-step').text("Actual Step: " + actualStepText);
      
      // Clear guess information and animate the actual step taken
      animationController.clearGuessIndexes();
      animationController.next();
      
      // Wait for transition to end and then end the animation if algorithm finished
      setTimeout(function() {
        if (animationController.getNextAnimatedInstruction() == null) {
          animationController.end();
        }
      }, 100);
    }
  });
  
  // Order instruction so the lower index comes first; ensures it meets consistent format
  function getInstructionWithOrderedIndexes(instruction) {
    var splitInstruction = instruction.split(" ");
    var instructionIndexes = splitInstruction.splice(1);
    var smallerIndex = Math.min.apply(Math, instructionIndexes);
    var largerIndex = Math.max.apply(Math, instructionIndexes);
    return splitInstruction[0] + " " + smallerIndex + " " + largerIndex;
  }
  
  // Convert instruction to natural language form that can be understood by user
  function convertInstructionToText(instruction) {
    // Break instruction down to its components
    var splitInstruction = instruction.split(" ");
    var operation = splitInstruction[0];
    var firstIndex = splitInstruction[1];
    var secondIndex = splitInstruction[2];
    // Rebuild as an equivalent sentence
    return operation.charAt(0).toUpperCase() + operation.slice(1) + " bars " + firstIndex +
           " and " + secondIndex + ".";
  }
  
  // Click handler for the 'Show Me!' button
  $('#show-me').click(function() {    
    var animationController = canvas.getAnimationController();
    // Clear guess information
    animationController.clearGuessIndexes();
    
    // Clear text boxes irrelevant to a system-demonstrated step
    $('#correct-or-wrong').text("");
    $('#user-step').text("");
    
    // Obtain text for actual step taken
    var actualInstruction = animationController.getNextAnimatedInstruction();
    var actualStepText = "";
    if (actualInstruction != null) {
      actualStepText = convertInstructionToText(actualInstruction);
    }
    
    // Increment total guesses
    totalGuesses++;
    
    // Update the user's score (use of this button counts as failed prediction)
    var correctRatioTextSize = $('#correct-ratio').width() / 12;
    $('#correct-ratio').css('font-size', correctRatioTextSize + 'px');
    $('#correct-ratio').text("Correct answers: " + correctGuesses + "/" + totalGuesses); 
    
    // Show actual step taken
    var actualStepTextSize = $('#actual-step').width() / 20;
    $('#actual-step').css('font-size', actualStepTextSize + 'px');
    $('#actual-step').text("Actual Step: " + actualStepText);
    
    // Animate actual step taken
    animationController.next();
  });
  
  // Resize all elements, unless width is too small
  function resizeDivs() {    
      // Update size of other elements
      $('.training-grid').css('height', '35px');
      $('#guess-mode').css('height', '40px');
      $('#training-menu-button').css('height', '40px');
      
      // Updated canvas height
      var remainingHeight = height - 2 * $('.training-grid').height() - 
                            $('#guess-mode').height() - $('#training-menu-button').height() - 22;
      
      // Set width of prediction feedback text
      var userStepTextSize = $('#user-step').width() / 20;
      $('#user-step').css('font-size', userStepTextSize + 'px');      
      var actualStepTextSize = $('#actual-step').width() / 20;
      $('#actual-step').css('font-size', actualStepTextSize + 'px');      
      var correctRatioTextSize = $('#correct-ratio').width() / 12;
      $('#correct-ratio').css('font-size', correctRatioTextSize + 'px');
      
      // Update canvas size
      canvas.setHeight(remainingHeight);
      canvas.setWidth(width - 4);  
      
      // If canvas is active, resize its contents
      if (canvas.isActive()) {
        canvas.getAnimationController().getDisplay().resize();
      }
  }    
  
  // Open popup when training session creation button is clicked. Ensure all collapsible
  // menu elements are already collapsed when first opening the popup.
  $("#training-menu-button").click(function () {
    collapsePopupCollapsibles();
    $('#training-menu-popup').popup('open');
  });
  
  // Handler for training session creation button inside the popup. Creates a new algorithm
  // view according to the user's specification.
  $('#create-training-session').click(function() {
    // Parameters of algorithm view chosen by user
    var chosenAlgorithm = $('input:radio[name=training-algo]:checked').val();
    var dataOrder = $('input:radio[name=training-order]:checked').val();
    var dataMode = $('input:radio[name=training-set-data]:checked').val();
    
    // Variable that will contain the generated dataset
    var sortingInput;
    
    // If the dataset is to be random, generate a random dataset
    if (dataMode == 'random') {
      var randomDataSize = $('#training-random-data-size').val();
      sortingInput = SortingInputGenerator.generateRandomSortingInput(randomDataSize, 100, dataOrder);
    }
    // Otherwise, generate dataset according to user's custom specification    
    else {
      var inputData = $('#training-custom-data-content').val();
      sortingInput = SortingInputGenerator.parseInputList(inputData, dataOrder);
    }
    
    // Collapse all collapsible menus in the popup    
    collapsePopupCollapsibles();
    
    // Set contents of training canvas
    setTrainingDisplay(sortingInput, chosenAlgorithm);
    
    // Close the popup
    $('#training-menu-popup').popup('close');
    
    // Initialise prediction feedback information
    correctGuesses = 0;
    totalGuesses = 0;
    $('#correct-or-wrong').text("");
    $('#user-step').text("");
    $('#actual-step').text("");
    $('#correct-ratio').text("");
  });
  
  // Event listener for when trainer page is shown
  $('#training').on('pageshow', function () {
    // Begin drawing canvas contents
    drawTimer = setInterval(function () {draw()}, 25);
  });

  // Event listener for when trainer page is hidden
  $('#training').on('pagehide', function () {
    // Stop drawing canvas contents
    clearInterval(drawTimer);
  }); 

  // Draws all items to the canvas
  function draw () {
    canvas.getAnimationController().getDisplay().draw();   
  }  
}); 

