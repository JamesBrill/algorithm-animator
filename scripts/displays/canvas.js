// Objects that each represent a HTML5 canvas element while 
// providing additional objects related to the animation being 
// drawn inside that canvas. Note that there are two versions
// of the canvas, each providing different functionality; this
// is due to a quirk of the HTML5 canvas element.
Canvas = function(canvasName) {
  this.originalCanvas = $(canvasName); // Reference to original canvas element
  this.usableCanvas = this.originalCanvas[0]; // Version of canvas that can be used
                                              // for setting canvas dimensions
  this.name = canvasName; // Name of canvas
  this.index = parseInt(canvasName.substring(canvasName.length-1)) - 1; // Canvas index
  this.animationController = new SmoothAnimationController(); // Animation controller for
                                                              // animation contained within canvas
  this.active = false; // Is the canvas active?
}

// Set the contents of the canvas, specifying its display type (algorithm view),
// input dataset and algorithm.
Canvas.prototype.setAnimation = function(display, input, algorithm) {
  var data = new SortingAnimationData(input);
  this.animationController.init(data, algorithm, display);
  this.animationController.setPauseButtonID("#sorting-pause-button");
  this.active = true;
}

// Set the canvas's group ID to register it as a member of a group
Canvas.prototype.setGroupID = function(ID) {
  this.animationController.setGroupID(ID);
}

// Activate training features within the canvas
Canvas.prototype.makeTrainingCanvas = function() {
  this.animationController.makeTrainer();
}

// Get the canvas's animation controller
Canvas.prototype.getAnimationController = function() {
  return this.animationController;
}

// Remove all details of its contents
Canvas.prototype.eraseAnimation = function() {
  this.animationController = new SmoothAnimationController();  
}

// Show the canvas on the web page so it is no longer hidden
Canvas.prototype.show = function() {
  this.originalCanvas.show();
}

// Is the canvas active?
Canvas.prototype.isActive = function() {
  return this.active;
}

// Set height of canvas
Canvas.prototype.setHeight = function(height) {
  this.usableCanvas.height = height;
}

// Set width of canvas
Canvas.prototype.setWidth = function(width) {
  this.usableCanvas.width = width;
}

// Set a CSS attribute of canvas
Canvas.prototype.css = function(attribute, value) {
  $(this.name).css(attribute, value);
}

// Change the index of canvas
Canvas.prototype.updateIndex = function(newIndex) {
  this.index = newIndex;
}

// Get version of canvas that can change its dimensions
Canvas.prototype.getUsableCanvas = function() {
  return this.usableCanvas;
}

// Get name of canvas
Canvas.prototype.getName = function() {
  return this.name;
}

// Shutdown canvas, hiding it if there are multiple canvases already
Canvas.prototype.shutdownDisplay = function(numberOfCanvases) {
  this.active = false;
  this.clear();
  this.eraseAnimation();
  this.css('float', 'none');
  if (numberOfCanvases > 1) {
    this.originalCanvas.hide();
  }
}

// Clear pixels inside canvas
Canvas.prototype.clear = function() {
  this.usableCanvas.width = this.usableCanvas.width;
}