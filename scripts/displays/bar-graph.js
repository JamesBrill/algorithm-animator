/* This object is a kind of display for sorting algorithms, which 
 * represents each number as a bar in a bar chart. It can animate
 * a number of different steps in common sorting algorithms, such 
 * as swapping, recolouring and comparing. 
 */
BarGraph = function(canvas) {
  this.canvas = canvas; // The canvas that the bar graph will be drawn on
  this.context = this.canvas.getContext('2d'); // The drawing context
  this.input = new Array(); // The algorithm input in bar form
  this.height = canvas.height; // Height of canvas
  this.width = canvas.width; // Width of canvas
  this.oldWidth = canvas.width; // Canvas width before resize
  this.largestInput = 0; // Size of largest input number
  this.animationController = null; // Animation controller
  this.animating = false; // Is an animation in progress?
  this.playMode = false; // Is overall animation being played automatically?
  this.skipMode = false; // Should the current animation be skipped?
  this.singleStepMode = false; // Is only one step to be animated?
  this.lastInstruction = null; // The last instruction that was animated
  this.lastDirection = "not reverse"; // Direction of previous animation
  this.comparedBars = new Array(); // Bars that are being compared
  this.barWidth = 0; // Width of each bar
  this.barSwapper = null; // Object used for coordinating bar swaps
}

// Get the algorithm's input numbers in bar form
BarGraph.prototype.getInput = function() {
  return this.input;
}

// Set algorithm's input numbers in form
BarGraph.prototype.setInput = function(input) {
  for (var i = 0; i < input.length; i++) {
    this.addInputNumber(input[i].getValue());
  }
}

// Set animation controller
BarGraph.prototype.setAnimationController = function(animationController) {
  this.animationController = animationController;
}

// Set play mode
BarGraph.prototype.setPlayMode = function(isPlaying) {  
  this.playMode = isPlaying;
}

// Is overall animation being played automatically?
BarGraph.prototype.isPlaying = function() {
  return this.playMode;
}

// Is an animation in progress?
BarGraph.prototype.isAnimating = function() {
  return this.animating;
}

// Set skip mode
BarGraph.prototype.setSkipMode = function(skipMode) {
  this.skipMode = skipMode;
}

// Set reverse mode to "reverse"
BarGraph.prototype.setReverse = function() {
  this.lastDirection = "reverse";
}

// Animate current step and then move to next step
BarGraph.prototype.nextStep = function() { 
  // Ensure skipMode is turned off and that singleStepMode is on so that 
  // only one animated step of the algorithm is performed
  this.skipMode = false;
  this.singleStepMode = true;
  // Compensate for changes in direction
  this.turnForwards();
  // Animate current step instantly in a forward direction
  this.animateStep(this.animationController.currentInstruction(), "instant", "not reverse");
}

// Animate current step and then move to previous step
BarGraph.prototype.prevStep = function() {
  // Ensure skipMode is turned off and that singleStepMode is on so that 
  // only one animated step of the algorithm is performed
  this.skipMode = false;
  this.singleStepMode = true;
  // Compensate for changes in direction
  this.turnBackwards();  
  // Animate current step instantly in a backward direction
  this.animateStep(this.animationController.currentInstruction(), "instant", "reverse");
}

// Go to beginning of animation, where all inputs are unsorted
BarGraph.prototype.goToBeginning = function() {
  this.turnBackwards();
  this.animateStep(this.animationController.currentInstruction(), "instant", "reverse");
}

// Go to end of animation, where all inputs are sorted
BarGraph.prototype.goToEnd = function() {
  this.turnForwards();
  this.animateStep(this.animationController.currentInstruction(), "instant", "not reverse");
}

// Add a new input number in bar form to the display
BarGraph.prototype.addInputNumber = function(inputNumber) {
  // Update largest input number
  if (inputNumber > this.largestInput) {
    this.largestInput = inputNumber;
  }
  // Add new input number in bar form
  this.input.push(new SortingInput(inputNumber));
  
  // Resize bars
  this.resize();
}

// If changing direction from backwards to forwards, make appropriate moves to compensate
BarGraph.prototype.turnForwards = function() {
  if (this.lastDirection == "reverse") {
    this.animationController.moveToNextInstruction();
    // If changing direction on a "compare" step, skip it
    if (this.lastInstruction != null && this.lastInstruction.split(" ")[0] == "compare") {
      this.animationController.moveToNextInstruction();
    }
  }  
}

// If changing direction from forwards to backwards, make appropriate moves to compensate
BarGraph.prototype.turnBackwards = function() {
  if (this.lastDirection == "not reverse") {
    this.animationController.moveToPrevInstruction();
    // If changing direction on a "compare" step, skip it
    if (this.lastInstruction != null && this.lastInstruction.split(" ")[0] == "compare") {
      this.animationController.moveToPrevInstruction();
    }
  }  
}

// Animate a given step, either instantly or through animation and either forwards
// or in reverse
BarGraph.prototype.animateStep = function(instruction, instantMode, reverseMode) {
  // If no animations are currently in progress...
  if (!this.animating) {
    // An animation is not in progress if this step is to be animated instantly
    this.animating = (instantMode == "instant") ? false : true;
    var operation = instruction.split(" ");
    
    // If current step is a swap animation...
    if (operation[0] == "swap") {
      // Animate the swap either smoothly or instantly, depending on situation
      if (instantMode == "not instant" || this.singleStepMode) {
        this.animating = true;
        this.swap(operation, "not instant", reverseMode);
      }
      else {
        this.swap(operation, "instant", reverseMode);
      }
    }
    // Animate comparison step
    else if (operation[0] == "compare") {
      this.compare(operation, instantMode, reverseMode);
    }
    // Animate recolouring step
    else if (operation[0] == "recolour") {
      this.recolour(operation, instantMode, reverseMode);
    } 
    // Animate marking step
    else if (operation[0] == "mark") {
      this.mark(operation, instantMode, reverseMode);
    } 
    // Animate "begin" step
    else {
      this.begin(operation, instantMode, reverseMode);
    }
  }
}

// Animate "begin" step. This kind of step is just a sentinel with no
// animation involved so that the overall animation has a step in which
// all bars are unsorted
BarGraph.prototype.begin = function(operation, instantMode, reverseMode) {
  // Move to following step, which is dependent on current direction
  this.moveToFollowingStep(reverseMode);   
  // Remove any unwanted colourings/highlighting/peripheral drawings from last step
  this.tidyUpLastStep(operation, reverseMode);
  
  // Set all bars to unsorted
  for (var i = 0; i < this.input.length; i++) {
    this.input[i].setStatus("unsorted");
  }  
  
  // The next instruction that will be dealt with by the next call to animateStep
  var nextInstruction = this.animationController.currentInstruction();  
  // The animation has ended
  this.animating = false;  
  // If at the end of the algorithm, ensure singleStepMode is not left on and return
  if (nextInstruction == null) {
    this.singleStepMode = false;
    return;
  }  
  // Animate next step
  this.animateStep(nextInstruction, instantMode, reverseMode);  
  // Ensure singleStepMode is not left on
  this.singleStepMode = false;
}

// Animate "recolour" step. This changes a given bar from one colour to another
BarGraph.prototype.recolour = function(operation, instantMode, reverseMode) {
  // Bar to be recoloured depends on current direction
  var operationIndexOfRecolouredBar = (reverseMode == "reverse") ? 2 : 3;  
  // Recolour the chosen bar
  this.input[operation[1]].setStatus(operation[operationIndexOfRecolouredBar]);
  
  // Move to following step, which is dependent on current direction
  this.moveToFollowingStep(reverseMode);   
  // Remove any unwanted colourings/highlighting/peripheral drawings from last step
  this.tidyUpLastStep(operation, reverseMode);
  
  // The next instruction that will be dealt with by the next call to animateStep
  var nextInstruction = this.animationController.currentInstruction();  
  // The animation has ended
  this.animating = false; 
  // If at the end of the algorithm, ensure singleStepMode is not left on and return
  if (nextInstruction == null) {
    this.singleStepMode = false;
    return;
  }
  // Animate next step
  if (this.playMode || instantMode == "instant" || nextInstruction.split(" ")[0] == "recolour") {
    this.animateStep(nextInstruction, instantMode, reverseMode);
  }
}

// Animate "mark" step. This applies a special property to a given bar
BarGraph.prototype.mark = function(operation, instantMode, reverseMode) {
  // Bar to be recoloured depends on current direction
  var operationIndexOfMarkedBar = (reverseMode == "reverse") ? 2 : 3;  
  // Recolour the chosen bar
  this.input[operation[1]].setMarker(operation[operationIndexOfMarkedBar]);
  
  // Move to following step, which is dependent on current direction
  this.moveToFollowingStep(reverseMode);   
  // Remove any unwanted colourings/highlighting/peripheral drawings from last step
  this.tidyUpLastStep(operation, reverseMode);
  
  // The next instruction that will be dealt with by the next call to animateStep
  var nextInstruction = this.animationController.currentInstruction();  
  // The animation has ended
  this.animating = false; 
  // If at the end of the algorithm, ensure singleStepMode is not left on and return
  if (nextInstruction == null) {
    this.singleStepMode = false;
    return;
  }
  // Animate next step
  this.animateStep(nextInstruction, instantMode, reverseMode);
}

// Animate "compare" step. This highlights two given bars for the duration of 
// the step delay and produces a text indicator over those bars. Can be 
// performed instantly or smoothly.
BarGraph.prototype.compare = function(operation, instantMode, reverseMode) {
  // The two bars being compared
  var firstBar = this.input[operation[1]];
  var secondBar = this.input[operation[2]];  
  // Set their statuses to be compared so the draw method can highlight them
  firstBar.setStatus("compared");
  secondBar.setStatus("compared");

  // Move to following step, which is dependent on current direction
  this.moveToFollowingStep(reverseMode);   
  // Remove any unwanted colourings/highlighting/peripheral drawings from last step
  this.tidyUpLastStep(operation, reverseMode);
  
  // If the animation is to be smooth, start an interval timer that waits for the
  // duration of the step delay to move on to the next step
  if (instantMode == "not instant") {
    // Number of intervals
    var numberOfChecksLeft = this.animationController.getStepDelay() / 25;
    // Begin interval timer
    var compareTimer = setInterval(function() {
      numberOfChecksLeft -= 1;
      // When step delay is finished or skipMode has been turned on, animate next 
      // step and clear interval
      if (numberOfChecksLeft <= 0 || this.skipMode) {
        // The animation has ended
        this.animating = false;
        // The next instruction that will be dealt with by the next call to animateStep
        var nextInstruction = this.animationController.currentInstruction();

        // Only animate the next step if the animation is being played automatically
        if (this.playMode) {
          this.animateStep(nextInstruction, "not instant", reverseMode);    
        }  
        clearInterval(compareTimer);
      }
    }.bind(this), 25);  
  }
  // If the animation is to be instant, immediately move on to the next step
  else {
    // The next instruction that will be dealt with by the next call to animateStep
    var nextInstruction = this.animationController.currentInstruction(); 
    // If at the end of the algorithm, ensure singleStepMode is not left on and return
    if (nextInstruction == null) {
      this.singleStepMode = false;
      return;
    }

    // Animate the next step, unless singleStepMode is on
    if (!this.singleStepMode) {
      this.animateStep(nextInstruction, "instant", reverseMode); 
    }
    // Ensure singleStepMode is not left on
    this.singleStepMode = false;
  }
}

// Animate "swap" step. This swaps the position of two bars, either smoothly 
// within the step delay or instantly.
BarGraph.prototype.swap = function(operation, instantMode, reverseMode) {  
  // Create BarSwapper object to handle positioning of bars during the animation
  this.barSwapper = new BarSwapper(this.input, operation, this.animationController.getStepDelay());  
  // Move to following step, which is dependent on current direction
  this.moveToFollowingStep(reverseMode);   
  // Remove any unwanted colourings/highlighting/peripheral drawings from last step
  this.tidyUpLastStep(operation, reverseMode); 
  
  // If the animation is to be smooth, start an interval timer that is used
  // to change the positions of the bars every 25 milliseconds. It does this 
  // until the end of the step delay, when the next step is animated
  if (instantMode == "not instant") {
    // Begin interval timer
    var swapTimer = setInterval(function() {  
      // If skipMode has been turned on, swap the two bars immediately and return
      if (this.skipMode) {     
        // Clear interval and ensure singleStepMode is not left on
        clearInterval(swapTimer);
        this.singleStepMode = false;
        // Swap the two bars instantly both on the canvas and in the virtual representation
        this.barSwapper.instantSwap();
        buckets.arrays.swap(this.input,operation[1],operation[2]);
        // The animation has ended
        this.animating = false;
        // Turn off skipMode
        this.skipMode = false;        
        return;
      }
      // Ensure bar statuses are set to "swapping" so draw method can highlight them
      this.barSwapper.setBarStatuses("swapping");
      // If the bars could not be moved any further without going beyond their index
      // positions, clear the timer, perform a virtual swap and animate the next step
      if (!this.barSwapper.moveBarsTowardsEachOther()) { 
        clearInterval(swapTimer); 
        // Perform virtual swap
        buckets.arrays.swap(this.input,operation[1],operation[2]);
        // The animation has ended
        this.animating = false;
        // The next instruction that will be dealt with by the next call to animateStep
        var nextInstruction = this.animationController.currentInstruction();
        // Set the bar statuses back to "unsorted"
        this.barSwapper.setBarStatuses("unsorted");
        // If at the end of the algorithm, ensure singleStepMode is not left on and return
        if (nextInstruction == null) {
          this.singleStepMode = false;
          return;
        }
        // If the overall animation is playing automatically and singleStepMode is
        // not on, animate the next step
        if ((this.playMode && !this.singleStepMode) || nextInstruction.split(" ")[0] == "recolour") { 
          this.animateStep(nextInstruction, "not instant", reverseMode);    
        }
        // Ensure singleStepMode is not left on        
        this.singleStepMode = false;
      }
    }.bind(this),25);
  }
  // If the animation is to be instant, immediately swap and move on to the next step
  else {
    // Swap the two bars instantly both on the canvas and in the virtual representation
    this.barSwapper.instantSwap();
    buckets.arrays.swap(this.input,operation[1],operation[2]);
    // The next instruction that will be dealt with by the next call to animateStep
    var nextInstruction = this.animationController.currentInstruction(); 
    // Animate next step
    this.animateStep(nextInstruction, "instant", reverseMode);   
  }
}

// Move to next step of the algorithm - dependent on current direction
BarGraph.prototype.moveToFollowingStep = function(reverseMode) {
  (reverseMode == "reverse") ? this.animationController.moveToPrevInstruction() 
                             : this.animationController.moveToNextInstruction();  
}

// Remove any unwanted colourings/highlighting/peripheral drawings from last step 
BarGraph.prototype.tidyUpLastStep = function(operation, reverseMode) {
  // Split instruction into its components
  var splitLastInstruction = (this.lastInstruction != null) ? this.lastInstruction.split(" ") : null;
  // Number of bars to compare against depends on current instruction  
  var numberOfPreviousBarsToCheck = (operation[0] == "recolour" || operation[0] == "mark") ? 1 : 2;
    
  // If last instruction is not a recolouring and neither instruction is begin...
  if (this.lastInstruction != null && splitLastInstruction[0] != "recolour"
   && splitLastInstruction[0] != "mark" && operation[0] != "begin" 
   && splitLastInstruction[0] != "begin") {
    // Reset status of bars operated on in last instruction to "unsorted" if 
    // they are no operated on in the current instruction
    for (var i = 1; i < 3; i++) {
      var setBarToUnsorted = true;
      for (var j = 1; j < numberOfPreviousBarsToCheck + 1; j++) {
        if (splitLastInstruction[i] == operation[j] && operation[0] != "mark") {
          setBarToUnsorted = false;
        }
      }
      if (setBarToUnsorted) {
        this.input[splitLastInstruction[i]].setStatus("unsorted");
      }
    }
  }   
  
  // Update last instruction to current instruction
  this.lastInstruction = operation.join(" ");
  // Update last direction taken
  this.lastDirection = reverseMode;
}

// Resize bars to fit new canvas size
BarGraph.prototype.resize = function() {
  // Update canvas dimensions
  this.updateCanvasDimensions();  
  // Calculate scaling factor and update old width
  var xScalingFactor = this.width / this.oldWidth;
  this.oldWidth = this.width;  
  // Scale x-coordinate information stored in the bar swapper
  if (this.barSwapper != null) {
    this.barSwapper.scaleX(xScalingFactor);
  }  
  // Keep track of current x-coordinate of the current bar being operated on
  var xCoordinate = 0.05 * this.width;
  // Update x-coordinate and height of each bar
  for (var i = 0; i < this.input.length; i++) {
    // Update x-coordinate of bar
    this.input[i].setXCoordinate(xCoordinate);
    // Update height of bar
    var inputProportion = this.input[i].getValue() / this.largestInput;
    var barHeight = inputProportion * (0.79 * this.height);
    this.input[i].setSize(barHeight);
    // Move x-coordinate to next position on display
    xCoordinate += (0.9 * this.width) / ((this.input.length * 3 - 1)/3);
  }
  // Update width of all bars
  this.barWidth = ((0.9 * this.width) / this.input.length) * (2/3);
}

// Update canvas dimensions
BarGraph.prototype.updateCanvasDimensions = function() {
  this.height = this.canvas.height;
  this.width = this.canvas.width;
}

// Draw all bars and peripherals to canvas
BarGraph.prototype.draw = function() {
  // Clear canvas
  this.canvas.width = this.canvas.width;
  // Update canvas dimensions
  this.updateCanvasDimensions();
      
  // Collect bars that are moving so that they can be drawn over other bars
  var movingBars = new Array();
  
  // Draw each bar
  for (var i = 0; i < this.input.length; i++) {
    if (this.input[i].getStatus() != "swapping") {
      this.drawBar(this.input[i], i);
    }
    else {
      movingBars.push({bar: this.input[i], index: i});
    }
  }
  
  // Draw bars that are in process of moving last so that they are in focus
  for (i = 0; i < movingBars.length; i++) {
    this.drawBar(movingBars[i].bar, movingBars[i].index);
  }
  
  this.drawTitle(); // Draw name of algorithm at top
  this.drawArrayBoxes(); // Draw boxes around input values
  this.drawIndexes(); // Draw index numbers
  this.drawDeleteIcon(); // Draw delete icon
  this.showComparisons(); // Show any comparisons on display
  this.comparedBars = new Array(); // Reset compared bars
}

// Draw name of algorithm down side of canvas
BarGraph.prototype.drawTitle = function() {
  this.context.save();
  this.context.translate(0,this.height);
  this.context.rotate(Math.PI*1.5);
  if (this.width > 3 * this.height) {
    this.prepareText(0.015 * this.width, "bottom");
    this.context.fillText(this.animationController.getName(), this.height / 2, 0.028 * this.width, this.height / 3.5);
  }
  else {
    this.prepareText(0.02 * this.width, "bottom");
    this.context.fillText(this.animationController.getName(), this.height / 2, 0.035 * this.width, this.height / 4);
  }
  this.context.restore();  
}

// Draw a given bar
BarGraph.prototype.drawBar = function(input) {
  // Coordinates of the bar's top-left corner
  var topX = input.getXCoordinate();
  var topY = 0.85 * this.height - input.getSize();
  
  // Draw bar with appropriate colour
  this.context.fillStyle = (input.getStatus() == "sorted") ? "#228B22" : "#ADFF2F";
  this.context.fillRect(topX, topY, this.barWidth, input.getSize());
  
  // Draw bar outline if it is in process of being compared or is swapping
  if (input.getStatus() == "swapping" || input.getStatus() == "compared") {
    this.context.strokeStyle = "#228B22";
    this.drawBarOutline(topX, topY, this.barWidth, input.getSize());
  } 
  
  // Draw marker if bar has special propety
  if (input.getMarker() == "nextSmallest") {
    this.context.fillStyle = 'red';

    this.context.beginPath();
    this.context.moveTo(topX + this.barWidth/2, topY); 
    this.context.lineTo(topX, topY - 20);
    this.context.lineTo(topX + this.barWidth, topY - 20);
    this.context.lineTo(topX + this.barWidth/2, topY);

    this.context.fill();
    this.context.closePath();
  }
  
  // Add bar to collection of bars being compared if appropriate
  this.addComparedBar(input);
  
  // Draw the input's value under the bar
  this.prepareText(0.08 * this.height, "top");
  this.context.fillText(input.getValue(), topX + 0.5 * this.barWidth, topY + input.getSize(), this.barWidth);
}

// Is this point inside the delete icon area?
BarGraph.prototype.isDeleteClick = function(cursorX, cursorY) {
  if (cursorX >= 0.97 * this.width && cursorY <= 0.03 * this.width) {
    return true;
  }
  return false;
}

// Draw outline of bar - i.e. highlight it
BarGraph.prototype.drawBarOutline = function(topX, topY, width, height) {
  for (var i = 0; i < 5; i++) {
    this.context.strokeRect(topX + i, topY + i, width - 2 * i, height - 2 * i);
  }  
}

// If bar is being compared, record it
BarGraph.prototype.addComparedBar = function(input) {
  if (input.getStatus() == "compared") {
    this.comparedBars.push(input);
  }  
}

// Draw boxes around input values
BarGraph.prototype.drawArrayBoxes = function() {
  this.context.strokeStyle = "black";
  var x = 0.05 * this.width - (((0.9 * this.width) / this.input.length) * (1/6));
  for (var i = 0; i < this.input.length; i++) {
    this.context.strokeRect(x, 0.85 * this.height, ((0.9 * this.width) / this.input.length), 0.08 * this.height);
    x += (0.9 * this.width) / ((this.input.length * 3 - 1)/3);
  }
}

// Draw indexes of each input position
BarGraph.prototype.drawIndexes = function() {
  var x = 0.05 * this.width;
  for (var i = 0; i < this.input.length; i++) {
    var topX = x + ((0.9 * this.width) / this.input.length) * (1/3);
    var topY = 0.93 * this.height;
    var maxWidth = ((0.9 * this.width) / this.input.length) * (2/3);
    this.prepareText(0.05 * this.height, "top");
    this.context.fillText(i, topX, topY, maxWidth);
    x += (0.9 * this.width) / ((this.input.length * 3 - 1)/3);
  }
}

// Draw icon for deleting canvas display
BarGraph.prototype.drawDeleteIcon = function() {
  this.context.fillStyle = "red";
  this.context.fillRect(0.97 * this.width, 0, 0.03 * this.width, 0.03 * this.width);
  
  this.context.beginPath();
  this.context.moveTo(0.995 * this.width, 0.005 * this.width); 
  this.context.lineTo(0.975 * this.width, 0.025 * this.width);
  this.context.moveTo(0.995 * this.width, 0.025 * this.width); 
  this.context.lineTo(0.975 * this.width, 0.005 * this.width);

  this.context.strokeStyle = "white";
  this.context.stroke();
  this.context.closePath();
}

// Show comparisons between bars - currently only handles two compared bars
BarGraph.prototype.showComparisons = function() {
  if (this.comparedBars.length == 2) {
    var firstBarX = this.comparedBars[0].getXCoordinate() + 0.5 * this.barWidth;
    var secondBarX = this.comparedBars[1].getXCoordinate() + 0.5 * this.barWidth;
    var topY = 0.06 * this.height;
    
    // Draw comparison lines coming up from the top of each bar and then some
    // "compared" text above the lines
    this.drawComparisonLines(firstBarX, secondBarX, topY);    
    this.drawComparisonText(firstBarX, secondBarX, topY);
  }
}

// Draw vertical lines from top of each compared bar to the top of the display
// and connect them. This drawing indicates that the two bars are being compared
BarGraph.prototype.drawComparisonLines = function(firstBarX, secondBarX, topY) {
  var firstBarY = 0.85 * this.height - this.comparedBars[0].getSize();
  var secondBarY = 0.85 * this.height - this.comparedBars[1].getSize();
  this.context.beginPath();
  this.context.moveTo(firstBarX, firstBarY);
  this.context.lineTo(firstBarX, topY);
  this.context.lineTo(secondBarX, topY);  
  this.context.lineTo(secondBarX, secondBarY); 
  this.context.strokeStyle = "black";
  this.context.stroke();
  this.context.closePath();
}

// Draw text that indicates that two bars are being compared 
BarGraph.prototype.drawComparisonText = function(firstBarX, secondBarX, topY) {
  var distanceBetweenBars = secondBarX - firstBarX;

  this.prepareText(topY, "bottom");
  this.context.fillText("Compared", firstBarX + 0.5 * distanceBetweenBars, topY, distanceBetweenBars);  
}

// Prepare canvas text with given size and baseline
BarGraph.prototype.prepareText = function(size, baseline) {
  this.context.fillStyle    = '#00f';
  this.context.font         = size + 'px sans-serif';
  this.context.textBaseline = baseline;
  this.context.textAlign    = 'center';  
}