// This will eventually replace original animation controller. Concept is
// that this controller will be able to work with displays (views of an
// algorithm on a canvas) to animate steps that use smooth transitions
// rather than discrete ones. 
SmoothAnimationController = function() {
  this.reset();
}

// Reset animation variables
SmoothAnimationController.prototype.reset = function() {
  this.algorithmAnimator = null; // Custom animator object
  this.speed = 300; // Delay between steps (ms)
  this.paused = true; // Is animation paused?
  this.display = null; // The algorithm's view for this animation
  this.trainer = false; // Is this animation controller a trainer?
  
  // ID of pause button - enables it to be changed within this class
  this.pauseButtonID = "#button"; 
}

// Initialise animation
SmoothAnimationController.prototype.init = function (animationData, algorithm, display) {
  this.display = display;
  this.display.setAnimationController(this); 
  if (!(this.display instanceof Pseudocode)) {
    this.display.setInput(animationData.getSortingInput());   
  }
  this.algorithmAnimator = AnimatorFactory.getAnimator(animationData, algorithm);  
  this.algorithmAnimator.buildAnimation(); 
}

// Make this animation controller instance a trainer
SmoothAnimationController.prototype.makeTrainer = function() {
  this.trainer = true;  
  this.display.hideDeleteIcon();
}

// Set pause button ID
SmoothAnimationController.prototype.setPauseButtonID = function(ID) {
  this.pauseButtonID = ID;
}

// Get name of algorithm
SmoothAnimationController.prototype.getName = function() {
  return this.algorithmAnimator.getName();
}

// Get display
SmoothAnimationController.prototype.getDisplay = function() {
  return this.display;
}

// Get algorithm pseudocode as a string
SmoothAnimationController.prototype.getPseudocode = function() {
  return this.algorithmAnimator.getPseudocode();
}

// Get number of lines in algorithm's pseudocode
SmoothAnimationController.prototype.getNumberOfPseudocodeLines = function() {
  return this.algorithmAnimator.getNumberOfPseudocodeLines();
}

// Return current instruction of algorithm
SmoothAnimationController.prototype.currentInstruction = function() {
  if (this.algorithmAnimator != null) {
    return this.algorithmAnimator.currentInstruction();
  }  
  return null;
}

// Return previous instruction of algorithm
SmoothAnimationController.prototype.prevInstruction = function() {
  if (this.algorithmAnimator != null) {
    return this.algorithmAnimator.prevInstruction();
  }  
  return null;
}

// Return next instruction of algorithm
SmoothAnimationController.prototype.nextInstruction = function() {
  if (this.algorithmAnimator != null) {
    return this.algorithmAnimator.nextInstruction();
  }  
  return null;
}

// Return current pseudocode instruction of algorithm
SmoothAnimationController.prototype.currentPseudocodeInstruction = function() {
  if (this.algorithmAnimator != null) {
    return this.algorithmAnimator.currentPseudocodeInstruction();
  }  
  return null;
}

// Return previous pseudocode instruction of algorithm
SmoothAnimationController.prototype.prevPseudocodeInstruction = function() {
  if (this.algorithmAnimator != null) {
    return this.algorithmAnimator.prevPseudocodeInstruction();
  }  
  return null;
}

// Return next pseudocode instruction of algorithm
SmoothAnimationController.prototype.nextPseudocodeInstruction = function() {
  if (this.algorithmAnimator != null) {
    return this.algorithmAnimator.nextPseudocodeInstruction();
  }  
  return null;
}

// Get the next instruction from the animator that is animated
SmoothAnimationController.prototype.getNextAnimatedInstruction = function() {
  if (this.algorithmAnimator != null) {
    return this.algorithmAnimator.getNextAnimatedInstruction();
  }  
  return null;
}

// Move to next instruction of algorithm
SmoothAnimationController.prototype.moveToNextInstruction = function() {
  if (this.algorithmAnimator != null) {
    this.algorithmAnimator.moveToNextInstruction();
  }  
}

// Move to previous instruction of algorithm
SmoothAnimationController.prototype.moveToPrevInstruction = function() {
  if (this.algorithmAnimator != null) {
    this.algorithmAnimator.moveToPrevInstruction();
  }  
}

// Set algorithm step delay (speed)
SmoothAnimationController.prototype.setStepDelay = function(stepDelay) {
  this.speed = stepDelay;
}

// Get algorithm step delay (speed)
SmoothAnimationController.prototype.getStepDelay = function() {
  return this.speed;
}

// Ensure current instruction is not null
SmoothAnimationController.prototype.calibrateInstructionIndex = function() {
  this.algorithmAnimator.calibrateInstructionIndex();
}

// Is animator on last instruction
SmoothAnimationController.prototype.isLastInstruction = function() {
  this.algorithmAnimator.isLastInstruction();
}

// Has algorithm reached its end?
SmoothAnimationController.prototype.isEnded = function() {
  this.algorithmAnimator.isEnded();
}

// Play animation
SmoothAnimationController.prototype.play = function() {
  // Only play if not paused and if display is not currently animating anything
  if (this.algorithmAnimator != null && this.paused == true && !this.display.isAnimating()) {
    this.paused = false;
    // Ensure pause button indicates animator is playing
    $(this.pauseButtonID).attr('src', 'images/pause.png');
    this.display.play();
  }
}

// Pause animation
SmoothAnimationController.prototype.pause = function() {
  this.display.pause();
  this.paused = true;
  // Ensure pause button indicates animator is paused
  $(this.pauseButtonID).attr('src', 'images/paused.png');
}

// Is animation paused?
SmoothAnimationController.prototype.isPaused = function() {
  return this.paused;
}

// Go to next step of animation
SmoothAnimationController.prototype.next = function() {
  if (this.algorithmAnimator != null) {
    this.pause();
    this.display.nextStep();  
  }
}

// Go to previous step of animation
SmoothAnimationController.prototype.prev = function() {
  if (this.algorithmAnimator != null) {
    this.pause();
    this.display.prevStep();  
  }
}

// Go to beginning of animation
SmoothAnimationController.prototype.beginning = function() {
  if (this.algorithmAnimator != null) {
    this.pause();
    this.display.goToBeginning();
  }
}

// Go to end of animation
SmoothAnimationController.prototype.end = function() {
  if (this.algorithmAnimator != null) {
    this.pause();
    this.display.goToEnd();
  }
}

// Has the user guessed the next step of the algorithm?
SmoothAnimationController.prototype.guessMade = function() {
  if (this.algorithmAnimator != null && this.trainer) {
    return this.display.guessMade();
  }
  return false;
}

// Get the user's guess at the next step of the algorithm
SmoothAnimationController.prototype.getGuessIndexes = function() {
  if (this.algorithmAnimator != null) {
    return this.display.getGuessIndexes();
  }
  return null;
}

// Clear all data related to the user's guess
SmoothAnimationController.prototype.clearGuessIndexes = function() {
  if (this.algorithmAnimator != null) {
    return this.display.clearGuessIndexes();
  }
  return null;
}