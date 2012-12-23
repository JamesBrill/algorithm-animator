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
}

SmoothAnimationController.prototype.init = function (animationData, algorithm, display) { 
  this.display = display;
  this.display.setAnimationController(this); 
  this.display.setInput(animationData.getSortingInput());   
  this.algorithmAnimator = AnimatorFactory.getAnimator(animationData, algorithm);  
  this.algorithmAnimator.buildAnimation();
  this.play();
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
  if (this.algorithmAnimator != null && this.paused == true) {
    this.paused = false;
    this.display.setAnimationMode(true);
    this.display.setSkipMode(false);
    if (!this.algorithmAnimator.isEnded()) {
      this.algorithmAnimator.calibrateStateIndex();
      this.display.animateStep(this.currentState(), "not reverse");
    }
  }
}

// Pause animation
SmoothAnimationController.prototype.pause = function() {
  this.display.setAnimationMode(false);
  this.paused = true;
}

// Go to beginning of animation
SmoothAnimationController.prototype.beginning = function() {
  if (this.algorithmAnimator != null) {
    this.pause();
    this.display.setSkipMode(true);
    this.algorithmAnimator.calibrateStateIndex();
    this.algorithmAnimator.moveToPrevState();
    
    var display = this.display;
    setTimeout(function() { display.goToBeginning(); }, 25);
  }
}

// Go to end of animation
SmoothAnimationController.prototype.end = function() {
  if (this.algorithmAnimator != null) {
    this.pause();
    this.display.setSkipMode(true);
    this.algorithmAnimator.calibrateStateIndex();
    var display = this.display;
    setTimeout(function() { display.goToEnd(); }, 25);
  }
}