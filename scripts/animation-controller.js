AnimationController = function() {
  this.animationTimer = null;
  this.algorithmAnimator = null;
  this.animationReady = false;
}
  
AnimationController.prototype.init = function (nodes, edges, startingNode) {  
  this.algorithmAnimator = new DijkstraAnimator(nodes,edges,startingNode);
  this.algorithmAnimator.buildAnimation();
  var objectRef = this; // "this" would refer to the window otherwise
  setTimeout(function() { objectRef.update(objectRef) } , 1);
  this.animationTimer = setInterval(function() { objectRef.update(objectRef) }, 5000);
}

AnimationController.prototype.update = function(objectRef) {
  objectRef.algorithmAnimator.nextState();
  objectRef.updateFeed(objectRef);
}

AnimationController.prototype.updateFeed = function(objectRef) {
  if (!objectRef.algorithmAnimator.atEnd()) {
    var nextFeedLine = objectRef.algorithmAnimator.getCurrentState().getFeedData();
    $('#currentStep').html(nextFeedLine);
    $('#feed').val($('#feed').val() + nextFeedLine);
    $('#feed').scrollTop($('#feed')[0].scrollHeight);
  }
}

AnimationController.prototype.play = function() {
  if (this.algorithmAnimator != null) {
    this.clearTimer();
    var objectRef = this;
    this.animationTimer = setInterval(function() { objectRef.update(objectRef) }, 5000);
  }
}

AnimationController.prototype.pause = function() {
  this.clearTimer();
}

AnimationController.prototype.next = function() {
  if (this.algorithmAnimator != null) {
    this.update(this);
  }
}

AnimationController.prototype.prev = function() {
  if (this.algorithmAnimator != null) {
    this.algorithmAnimator.prevState();
    this.updateFeed(this);
  }
}

AnimationController.prototype.beginning = function() {
  if (this.algorithmAnimator != null) {
    this.algorithmAnimator.goToBeginning();
    this.updateFeed(this);
  }
}

AnimationController.prototype.end = function() {
  if (this.algorithmAnimator != null) {
    this.algorithmAnimator.goToEnd();
    this.updateFeed(this);
  }
}

AnimationController.prototype.reset = function() {
  this.algorithmAnimator = null;
  this.animationTimer = null;
}

AnimationController.prototype.clearTimer = function() {
  clearInterval(this.animationTimer);
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


