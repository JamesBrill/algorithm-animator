Canvas = function(canvasName) {
  this.originalCanvas = $(canvasName);
  this.usableCanvas = this.originalCanvas[0];
  this.name = canvasName;
  this.index = parseInt(canvasName.substring(canvasName.length-1)) - 1;
  this.animationController = new SmoothAnimationController();
  this.active = false;
}

Canvas.prototype.setAnimation = function(display, input, algorithm) {
  var data = new SortingAnimationData(input);
  this.animationController.init(data, algorithm, display);
  this.animationController.setPauseButtonID("#sorting-pause-button");
  this.active = true;
}

Canvas.prototype.makeTrainingCanvas = function() {
  this.animationController.makeTrainer();
}

Canvas.prototype.getAnimationController = function() {
  return this.animationController;
}

Canvas.prototype.eraseAnimation = function() {
  this.animationController = new SmoothAnimationController();  
}

Canvas.prototype.show = function() {
  this.originalCanvas.show();
}

Canvas.prototype.isActive = function() {
  return this.active;
}

Canvas.prototype.setHeight = function(height) {
  this.usableCanvas.height = height;
}

Canvas.prototype.setWidth = function(width) {
  this.usableCanvas.width = width;
}

Canvas.prototype.css = function(attribute, value) {
  $(this.name).css(attribute, value);
}

Canvas.prototype.updateIndex = function(newIndex) {
  this.index = newIndex;
}

Canvas.prototype.getUsableCanvas = function() {
  return this.usableCanvas;
}

Canvas.prototype.getName = function() {
  return this.name;
}

Canvas.prototype.shutdownDisplay = function(numberOfCanvases) {
  this.active = false;
  this.clear();
  this.eraseAnimation();
  this.css('float', 'none');
  if (numberOfCanvases > 1) {
    this.originalCanvas.hide();
  }
}

Canvas.prototype.clear = function() {
  this.usableCanvas.width = this.usableCanvas.width;
}