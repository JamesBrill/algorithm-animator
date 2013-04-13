// Objects that control animation by storing a pseudocode feed and custom
// animator that controls the algorithm views. Does not support smooth motion 
// and only works with DijkstraAnimator objects. Succeeded by more sophisticated
// SmoothAnimationController objects for the sorting animator.
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
  this.feedLines = new Array(); // All lines of pseudocode feed
  this.speed = 5000; // Delay between steps (ms)
  this.paused = false; // Is animation paused?
  this.feedMode = "high-level"; // High-level description or pseudocode?
  
  // Select 'high-level' option for pseudocode feed
  $('#high-level').addClass('ui-btn-active'); 
  $('#pseudocode').removeClass('ui-btn-active');
}
  
// Initialise animator and feed information  
AnimationController.prototype.init = function (animationData, algorithm) { 
  this.algorithmAnimator = AnimatorFactory.getAnimator(animationData, algorithm);  
  this.algorithmAnimator.buildAnimation();
  this.feedLines = this.algorithmAnimator.getFeedLines();
  this.update();
  this.play();
}

// Move animation to next step, unless it is already at the end
AnimationController.prototype.update = function() {
  if (!this.algorithmAnimator.atEnd()) {
    this.algorithmAnimator.nextState();
    if (this.currentFeedLine < this.feedLines.length - 1) {
      this.currentFeedLine++;
    }
    // Update contents of feed
    this.updateFeed();
  }
}

// Update contents of feed
AnimationController.prototype.updateFeed = function() {  
  var nextFeedLine = this.feedLines[this.currentFeedLine].getHighLevel();
  if (this.feedMode == "pseudocode") {
    nextFeedLine = this.feedLines[this.currentFeedLine].getPseudoCode();
  }
  $('#currentStep').val(nextFeedLine);
  this.buildFeed();  
}

// Put all lines of algorithm run so far into the pseudocode panel
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
    // Update algorithm at rate dictated by speed property
    this.animationTimer = setInterval(function() { this.update() }.bind(this), this.speed);
  }
}

// Pause animation
AnimationController.prototype.pause = function() {
  this.clearTimer();
  this.paused = true;
}

// Go to next step of animation
AnimationController.prototype.next = function() {
  if (this.algorithmAnimator != null) {
    this.update();
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
    this.updateFeed();
  }
}

// Go to beginning of animation
AnimationController.prototype.beginning = function() {
  if (this.algorithmAnimator != null) {
    this.algorithmAnimator.goToBeginning();
    this.currentFeedLine = 0;
    this.updateFeed();
  }
}

// Go to end of animation
AnimationController.prototype.end = function() {
  if (this.algorithmAnimator != null) {
    this.algorithmAnimator.goToEnd();
    this.currentFeedLine = this.feedLines.length - 1;
    this.updateFeed();
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