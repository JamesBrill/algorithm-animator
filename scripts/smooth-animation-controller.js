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
  
  // ID of pause button - enables it to be changed within this class
  this.pauseButtonID = "#button"; 
}

// Initialise animation
SmoothAnimationController.prototype.init = function (animationData, algorithm, display) { 
  this.display = display;
  this.display.setAnimationController(this); 
  this.display.setInput(animationData.getSortingInput());   
  this.algorithmAnimator = AnimatorFactory.getAnimator(animationData, algorithm);  
  this.algorithmAnimator.buildAnimation(); 
}

// Set pause button ID
SmoothAnimationController.prototype.setPauseButtonID = function(ID) {
  this.pauseButtonID = ID;
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

// Play animation
SmoothAnimationController.prototype.play = function() {
  // Only play if not paused and if display is not currently animating anything
  if (this.algorithmAnimator != null && this.paused == true && !this.display.isAnimating()) {
    this.paused = false;
    // Ensure pause button indicates animator is playing
    $(this.pauseButtonID).attr('src', 'images/pause.png');
    // Prepare display for playing
    this.display.setPlayMode(true);
    this.display.setSkipMode(false);
    this.display.turnForwards();
    // Begin animation unless animation has ended
    if (!this.algorithmAnimator.isEnded()) {
      // Ensure current instruction is not null
      this.algorithmAnimator.calibrateInstructionIndex();
      this.display.animateStep(this.currentInstruction(), "not instant", "not reverse");
    }
  }
}

// Pause animation
SmoothAnimationController.prototype.pause = function() {
  // Set display to Play Mode
  this.display.setPlayMode(false);
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
    // Skip current animation
    this.display.setSkipMode(true);
    // Ensure current instruction is not null
    this.algorithmAnimator.calibrateInstructionIndex();
                
    // Wait for current animation to finish before animating the next step
    var display = this.display;
    setTimeout(function() { display.nextStep(); }, 25);    
  }
}

// Go to previous step of animation
SmoothAnimationController.prototype.prev = function() {
  if (this.algorithmAnimator != null) {
    this.pause();
    // Skip current animation
    this.display.setSkipMode(true);
    // Ensure current instruction is not null
    this.algorithmAnimator.calibrateInstructionIndex();
    
    // Set display to reverse if on the last instruction
    if (this.algorithmAnimator.isLastInstruction()) {
      this.display.setReverse();
    }
    
    // Wait for current animation to finish before animating the previous step
    var display = this.display;
    setTimeout(function() { display.prevStep(); }, 25);    
  }
}

// Go to beginning of animation
SmoothAnimationController.prototype.beginning = function() {
  if (this.algorithmAnimator != null) {
    this.pause();
    // Skip current animation
    this.display.setSkipMode(true);
    // Ensure current instruction is not null
    this.algorithmAnimator.calibrateInstructionIndex(); 
    
    // Wait for current animation to finish before going to the beginning
    var display = this.display;
    setTimeout(function() { display.goToBeginning(); }, 35);
  }
}

// Go to end of animation
SmoothAnimationController.prototype.end = function() {
  if (this.algorithmAnimator != null) {
    this.pause();
    // Skip current animation
    this.display.setSkipMode(true);
    // Ensure current instruction is not null
    this.algorithmAnimator.calibrateInstructionIndex(); 
    
    // Wait for current animation to finish before going to the end
    var display = this.display;
    setTimeout(function() { display.goToEnd(); }, 35);
  }
}