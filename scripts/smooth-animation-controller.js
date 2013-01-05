// This will eventually replace original animation controller. Concept is
// that this controller will be able to work with displays (views of an
// algorithm on a canvas) to animate steps that use smooth transitions
// rather than discrete ones. "States" will most likely be replaced by 
// "instructions" to make it clear to the display where the smooth
// animation is to take place.
SmoothAnimationController = function() {
  this.reset();
}

SmoothAnimationController.prototype.reset = function() {
  this.algorithmAnimator = null; // Custom animator object
  this.speed = 300; // Delay between steps (ms)
  this.paused = true; // Is animation paused?
  this.display = null; // The algorithm's view for this animation
  this.pauseButtonID = "#button";
}

SmoothAnimationController.prototype.init = function (animationData, algorithm, display) { 
  this.display = display;
  this.display.setAnimationController(this); 
  this.display.setInput(animationData.getSortingInput());   
  this.algorithmAnimator = AnimatorFactory.getAnimator(animationData, algorithm);  
  this.algorithmAnimator.buildAnimation(); 
}

SmoothAnimationController.prototype.setPauseButtonID = function(ID) {
  this.pauseButtonID = ID;
}

SmoothAnimationController.prototype.currentState = function() {
  if (this.algorithmAnimator != null) {
    return this.algorithmAnimator.currentState();
  }  
  return null;
}

SmoothAnimationController.prototype.prevState = function() {
  if (this.algorithmAnimator != null) {
    return this.algorithmAnimator.prevState();
  }  
  return null;
}

SmoothAnimationController.prototype.nextState = function() {
  if (this.algorithmAnimator != null) {
    return this.algorithmAnimator.nextState();
  }  
  return null;
}

SmoothAnimationController.prototype.moveToNextState = function() {
  if (this.algorithmAnimator != null) {
    this.algorithmAnimator.moveToNextState();
  }  
}

SmoothAnimationController.prototype.moveToPrevState = function() {
  if (this.algorithmAnimator != null) {
    this.algorithmAnimator.moveToPrevState();
  }  
}

SmoothAnimationController.prototype.setStepDelay = function(stepDelay) {
  this.speed = stepDelay;
}

SmoothAnimationController.prototype.getStepDelay = function() {
  return this.speed;
}

// Play animation
SmoothAnimationController.prototype.play = function() {
  if (this.algorithmAnimator != null && this.paused == true && !this.display.isAnimating()) {
    this.paused = false;
    $(this.pauseButtonID).attr('src', 'images/pause.png');
    this.display.setPlayMode(true);
    this.display.setSkipMode(false);
    this.display.turnForwards();
    if (!this.algorithmAnimator.isEnded()) {
      this.algorithmAnimator.calibrateStateIndex();
      this.display.animateStep(this.currentState(), "not instant", "not reverse");
    }
  }
}

// Pause animation
SmoothAnimationController.prototype.pause = function() {
  this.display.setPlayMode(false);
  this.paused = true;
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
    this.display.setSkipMode(true);
    this.algorithmAnimator.calibrateStateIndex();
                
    var display = this.display;
    setTimeout(function() { display.nextStep(); }, 25);    
  }
}

// Go to previous step of animation
SmoothAnimationController.prototype.prev = function() {
  if (this.algorithmAnimator != null) {
    this.pause();
    this.display.setSkipMode(true);
    this.algorithmAnimator.calibrateStateIndex();
    if (this.algorithmAnimator.isLastInstruction()) {
      this.display.setReverse();
    }
    
    var display = this.display;
    setTimeout(function() { display.prevStep(); }, 25);    
  }
}

// Go to beginning of animation
SmoothAnimationController.prototype.beginning = function() {
  if (this.algorithmAnimator != null) {
    this.pause();
    this.display.setSkipMode(true);
    this.algorithmAnimator.calibrateStateIndex(); 
    
    var display = this.display;
    setTimeout(function() { display.goToBeginning(); }, 35);
  }
}

// Go to end of animation
SmoothAnimationController.prototype.end = function() {
  if (this.algorithmAnimator != null) {
    this.pause();
    this.display.setSkipMode(true);
    this.algorithmAnimator.calibrateStateIndex();
    
    var display = this.display;
    setTimeout(function() { display.goToEnd(); }, 35);
  }
}