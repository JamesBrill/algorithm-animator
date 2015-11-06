Pseudocode = function(canvas) {  
  this.canvas = canvas; // The canvas that the pseudocode will be drawn on
  this.context = this.canvas.getContext('2d'); // The drawing context
  this.highlighterYCoordinate = 0; // Y-coordinate of line highlighter
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
}

// Set animation controller
Pseudocode.prototype.setAnimationController = function(animationController) {
  this.animationController = animationController;
}

// Is overall animation being played automatically?
Pseudocode.prototype.isPlaying = function() {
  return this.playMode;
}

// Is an animation in progress?
Pseudocode.prototype.isAnimating = function() {
  return this.animating;
}

// Set reverse mode to "reverse"
Pseudocode.prototype.setReverse = function() {
  this.lastDirection = "reverse";
}

// Animate current step and then move to next step
Pseudocode.prototype.nextStep = function() { 
  // Ensure skipMode is turned off and that singleStepMode is on so that 
  // only one animated step of the algorithm is performed
  this.skipMode = false;
  this.singleStepMode = true;
  // Compensate for changes in direction
  this.turnForwards();
  // Animate current step instantly in a forward direction
  this.animateStep(this.animationController.currentPseudocodeInstruction(), "instant", "not reverse");
}

// Animate current step and then move to previous step
Pseudocode.prototype.prevStep = function() {
  // Ensure skipMode is turned off and that singleStepMode is on so that 
  // only one animated step of the algorithm is performed
  this.skipMode = false;
  this.singleStepMode = true;
  // Compensate for changes in direction
  this.turnBackwards();  
  // Animate current step instantly in a backward direction
  this.animateStep(this.animationController.currentPseudocodeInstruction(), "instant", "reverse");
}

// Go to beginning of animation, where all inputs are unsorted
Pseudocode.prototype.goToBeginning = function() {
  this.turnBackwards();
  this.animateStep(this.animationController.currentPseudocodeInstruction(), "instant", "reverse");
}

// Go to end of animation, where all inputs are sorted
Pseudocode.prototype.goToEnd = function() {
  this.turnForwards();
  this.animateStep(this.animationController.currentPseudocodeInstruction(), "instant", "not reverse");
}

// If changing direction from backwards to forwards, make appropriate moves to compensate
Pseudocode.prototype.turnForwards = function() {
  if (this.lastDirection == "reverse") {
    this.animationController.moveToNextInstruction();
    
    if (this.lastInstruction != null) {
      this.animationController.moveToNextInstruction();
    }
  }  
}

// If changing direction from forwards to backwards, make appropriate moves to compensate
Pseudocode.prototype.turnBackwards = function() {
  if (this.lastDirection == "not reverse") {
    this.animationController.moveToPrevInstruction();
    
    if (this.lastInstruction != null) {
      this.animationController.moveToPrevInstruction();
    }
  }  
}

// Animate a given step, either instantly or through animation and either forwards
// or in reverse
Pseudocode.prototype.animateStep = function(instruction, instantMode, reverseMode) {
  // If no animations are currently in progress...
  if (!this.animating) {
    // An animation is not in progress if this step is to be animated instantly
    this.animating = instantMode != "instant";
  }
}

// Move to next step of the algorithm - dependent on current direction
Pseudocode.prototype.moveToFollowingStep = function(reverseMode) {
  (reverseMode == "reverse") ? this.animationController.moveToPrevInstruction() 
                             : this.animationController.moveToNextInstruction();  
}
 
Pseudocode.prototype.tidyUpLastStep = function(operation, reverseMode) {
  // Update last instruction to current instruction
  this.lastInstruction = operation.join(" ");
  // Update last direction taken
  this.lastDirection = reverseMode;
}

// Resize bars to fit new canvas size
Pseudocode.prototype.resize = function() {
  // Update canvas dimensions
  this.updateCanvasDimensions();  
}

// Update canvas dimensions
Pseudocode.prototype.updateCanvasDimensions = function() {
  this.height = this.canvas.height;
  this.width = this.canvas.width;
}

// Draw all bars and peripherals to canvas
Pseudocode.prototype.draw = function() {
  // Clear canvas
  this.canvas.width = this.canvas.width;
  // Update canvas dimensions
  this.updateCanvasDimensions();
      
  this.drawTitle(); // Draw name of algorithm at top
  this.drawLineHighlighter(); // Draw line highlighter
  this.drawPseudocode(); // Draw pseudocode text
  this.drawDeleteIcon(); // Draw delete icon 
}

// Draw name of algorithm down side of canvas
Pseudocode.prototype.drawTitle = function() {
  this.context.save();
  this.context.translate(0,this.height);
  this.context.rotate(Math.PI*1.5);
  if (this.width > 3 * this.height) {
    this.prepareText('#00f', 0.015 * this.width, "bottom", 'center');
    this.context.fillText(this.animationController.getName(), this.height / 2, 0.028 * this.width, this.height / 3.5);
  }
  else {
    this.prepareText('#00f', 0.02 * this.width, "bottom", 'center');
    this.context.fillText(this.animationController.getName(), this.height / 2, 0.035 * this.width, this.height / 4);
  }
  this.context.restore();  
}

// Is this point inside the delete icon area?
Pseudocode.prototype.isDeleteClick = function(cursorX, cursorY) {
  if (cursorX >= 0.97 * this.width && cursorY <= 0.03 * this.width) {
    return true;
  }
  return false;
}

// Draw bar that highlights lines
Pseudocode.prototype.drawLineHighlighter = function() {
  var numberOfLines = this.animationController.getNumberOfPseudocodeLines();
  var textSize = (this.height / numberOfLines) - 2;
  this.context.fillStyle = "#32CD32";
  this.context.fillRect(0.05 * this.width, this.highlighterYCoordinate, 
                        this.width, this.highlighterYCoordinate + textSize);
}

// Draw pseudocode text
Pseudocode.prototype.drawPseudocode = function() {
  var pseudocode = this.animationController.getPseudocode();
  var numberOfLines = this.animationController.getNumberOfPseudocodeLines();
  var textSize = (this.height / numberOfLines) - 2;
  this.prepareText('black', textSize, 'top', 'left');
  var x = 0.05 * this.width;
  var y = 0;
  var lines = pseudocode.split('\n');

  for (var i = 0; i < lines.length; i++) {
    this.context.fillText(lines[i], x, y);
    y += textSize;
  }
}

// Draw icon for deleting canvas display
Pseudocode.prototype.drawDeleteIcon = function() {
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

// Prepare canvas text with given size and baseline
Pseudocode.prototype.prepareText = function(colour, size, baseline, alignment) {
  this.context.fillStyle    = colour;
  this.context.font         = size + 'px sans-serif';
  this.context.textBaseline = baseline;
  this.context.textAlign    = alignment;  
}