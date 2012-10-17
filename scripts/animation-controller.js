AnimationController = function() {
  this.reset();  
}
  
AnimationController.prototype.init = function (nodes, edges, startingNode) {  
  this.algorithmAnimator = new DijkstraAnimator(nodes,edges,startingNode);
  this.algorithmAnimator.buildAnimation();
  this.feedLines = this.algorithmAnimator.getFeedLines();
  this.update(this);
  this.play();
}

AnimationController.prototype.update = function(objectRef) {
  if (!objectRef.algorithmAnimator.atEnd()) {
    objectRef.algorithmAnimator.nextState();
    if (this.currentFeedLine < this.feedLines.length - 1) {
      this.currentFeedLine++;
    }
    objectRef.updateFeed(objectRef);
  }
}

AnimationController.prototype.updateFeed = function(objectRef) {
  var nextFeedLine = this.feedLines[this.currentFeedLine];
  $('#currentStep').html(nextFeedLine);
  objectRef.buildFeed();
  $('#feed').scrollTop($('#feed')[0].scrollHeight);
}

AnimationController.prototype.buildFeed = function() {
  $('#feed').val('');
  for (var i = 0; i <= this.currentFeedLine; i++) {
    var nextFeedLine = this.feedLines[i];
    $('#feed').val($('#feed').val() + nextFeedLine);
  }
}

AnimationController.prototype.play = function() {
  if (this.algorithmAnimator != null) {
    this.paused = false;
    this.clearTimer();
    var objectRef = this;
    this.animationTimer = setInterval(function() { objectRef.update(objectRef) }, this.speed);
  }
}

AnimationController.prototype.pause = function() {
  this.clearTimer();
  this.paused = true;
}

AnimationController.prototype.next = function() {
  if (this.algorithmAnimator != null) {
    this.update(this);
  }
}

AnimationController.prototype.prev = function() {
  if (this.algorithmAnimator != null) {
    this.algorithmAnimator.prevState();
    if (this.currentFeedLine > 0) {
      this.currentFeedLine--;
    }
    this.updateFeed(this);
  }
}

AnimationController.prototype.beginning = function() {
  if (this.algorithmAnimator != null) {
    this.algorithmAnimator.goToBeginning();
    this.currentFeedLine = 0;
    this.updateFeed(this);
  }
}

AnimationController.prototype.end = function() {
  if (this.algorithmAnimator != null) {
    this.algorithmAnimator.goToEnd();
    this.currentFeedLine = this.feedLines.length - 1;
    this.updateFeed(this);
  }
}

AnimationController.prototype.reset = function() {
  this.algorithmAnimator = null;
  this.animationTimer = null;
  this.animationReady = false;
  this.currentFeedLine = -1;
  this.feedLines = new Array();
  this.speed = 5000;
  this.paused = false;
}

AnimationController.prototype.clearTimer = function() {
  clearInterval(this.animationTimer);
}

AnimationController.prototype.changeSpeed = function(newSpeed) {
  this.speed = newSpeed;
  if (!this.paused) {
    this.play();
  }
}

AnimationController.prototype.isActive = function() {
  return this.algorithmAnimator == null;
}

AnimationController.prototype.draw = function(node, context) {
  this.algorithmAnimator.drawNode(node, context);
}

AnimationController.prototype.isReady = function() {
  return this.animationReady;
}

AnimationController.prototype.setReady = function() {
  this.animationReady = true;
}

AnimationController.prototype.setNotReady = function() {
  this.animationReady = false;
}


