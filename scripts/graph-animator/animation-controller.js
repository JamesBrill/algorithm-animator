// Object that controls animation by storing an information feed and custom
// animator that controls the algorithm views
AnimationController = function() {
  // Initialise object properties
  this.reset();  
}

// Reset object properties
AnimationController.prototype.reset = function() {
  this.algorithmAnimator = null; // Custom animator object
  this.animationTimer = null; // Timer that dictates speed of algorithm
  this.animationReady = false; // Is animation ready to begin?
  this.currentFeedLine = -1; // Current line of algorithm
  this.feedLines = new Array(); // All lines of algorithm
  this.speed = 5000; // Delay between steps (ms)
  this.paused = false; // Is animation paused?
  this.feedMode = "high-level"; // High-level description or pseudocode?
  
  // Select 'high-level' option
  $('#high-level').addClass('ui-btn-active'); 
  $('#pseudocode').removeClass('ui-btn-active');
}
  
// Initialise animator and feed information  
AnimationController.prototype.init = function (animationData, algorithm) { 
  this.algorithmAnimator = AnimatorFactory.getAnimator(animationData, algorithm);  
  this.algorithmAnimator.buildAnimation();
  this.feedLines = this.algorithmAnimator.getFeedLines();
  this.update(this);
  this.play();
}

// Move animation to next step, unless it is already at the end
AnimationController.prototype.update = function(objectRef) {
  if (!objectRef.algorithmAnimator.atEnd()) {
    objectRef.algorithmAnimator.nextState();
    if (this.currentFeedLine < this.feedLines.length - 1) {
      this.currentFeedLine++;
    }
    // Update contents of feed
    objectRef.updateFeed(objectRef);
  }
}

// Update contents of feed
AnimationController.prototype.updateFeed = function(objectRef) {  
  var nextFeedLine = this.feedLines[this.currentFeedLine].getHighLevel();
  if (this.feedMode == "pseudocode") {
    nextFeedLine = this.feedLines[this.currentFeedLine].getPseudoCode();
  }
  $('#currentStep').val(nextFeedLine);
  objectRef.buildFeed();  
}

// Put all lines of algorithm run so far into the 'feed' box
AnimationController.prototype.buildFeed = function() {
  if (this.feedMode == "high-level") {
    $('#feed').val('');
    for (var i = 0; i <= this.currentFeedLine; i++) {
      var nextFeedLine = this.feedLines[i].getHighLevel();
      $('#feed').val($('#feed').val() + nextFeedLine);
    }
    $('#feed').scrollTop($('#feed')[0].scrollHeight);
  }
  else if (this.feedMode == "pseudocode") {
    $('#feed').val(this.algorithmAnimator.getPseudoCode());
    $('#feed').scrollTop(0);
  }
}

// Set the feed mode to either high-level or pseudocode
AnimationController.prototype.setFeedMode = function(newFeedMode) {  
  this.feedMode = newFeedMode;
}

// Play animation
AnimationController.prototype.play = function() {
  if (this.algorithmAnimator != null) {
    this.paused = false;
    this.clearTimer();
    var objectRef = this;
    // Update algorithm at rate dictated by speed property
    this.animationTimer = setInterval(function() { objectRef.update(objectRef) }, this.speed);
  }
}

// Pause animation
AnimationController.prototype.pause = function() {
  this.clearTimer();
  this.paused = true;
}

// Stop animation
AnimationController.prototype.stop = function() {
  this.clearTimer();
}

// Go to next step of animation
AnimationController.prototype.next = function() {
  if (this.algorithmAnimator != null) {
    this.update(this);
  }
}

// Go to previous step of animation
AnimationController.prototype.prev = function() {
  if (this.algorithmAnimator != null) {
    this.algorithmAnimator.prevState();
    if (this.currentFeedLine > 0) {
      this.currentFeedLine--;
    }
    // Update contents of feed
    this.updateFeed(this);
  }
}

// Go to beginning of animation
AnimationController.prototype.beginning = function() {
  if (this.algorithmAnimator != null) {
    this.algorithmAnimator.goToBeginning();
    this.currentFeedLine = 0;
    this.updateFeed(this);
  }
}

// Go to end of animation
AnimationController.prototype.end = function() {
  if (this.algorithmAnimator != null) {
    this.algorithmAnimator.goToEnd();
    this.currentFeedLine = this.feedLines.length - 1;
    this.updateFeed(this);
  }
}

// Stop running animation
AnimationController.prototype.clearTimer = function() {
  clearInterval(this.animationTimer);
}

// Change speed of animation
AnimationController.prototype.changeSpeed = function(newSpeed) {
  this.speed = newSpeed;
  // If not currently paused, call the play method so the animation runs in the new speed
  if (!this.paused) {
    this.play();
  }
}

// Has an animation been built?
AnimationController.prototype.isActive = function() {
  return this.algorithmAnimator != null;
}

// Draw a given node according to the custom animator
AnimationController.prototype.draw = function(node, context, nodeRadius) {
  this.algorithmAnimator.drawNode(node, context, nodeRadius);
}

// Is animation paused?
AnimationController.prototype.isPaused = function() {
  return this.paused;
}

// Is animation ready to play?
AnimationController.prototype.isReady = function() {
  return this.animationReady;
}

// Set animation to being ready
AnimationController.prototype.setReady = function() {
  this.animationReady = true;
}