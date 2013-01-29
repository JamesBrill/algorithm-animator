Canvas = function(canvasName) {
  this.originalCanvas = $(canvasName);
  this.usableCanvas = this.originalCanvas[0];
  this.name = canvasName;
  this.index = parseInt(canvasName.substring(canvasName.length-1)) - 1;
}

Canvas.prototype.show = function() {
  this.originalCanvas.show();
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

Canvas.prototype.getUsableCanvas = function() {
  return this.usableCanvas;
}

Canvas.prototype.resize = function(numberOfCanvases, documentWidth, documentHeight) {
  switch (numberOfCanvases) {
    case 1: 
      this.setHeight(0.72 * documentHeight - 4);
      this.setWidth(documentWidth - 4);
      break;
    case 2:
      this.setHeight(0.72 * documentHeight - 4);
      this.setWidth(0.5 * documentWidth - 4);
      if (this.index == 0) {
        this.css('float', 'right');
      }
      break;
    case 3:
      this.setHeight(0.36 * documentHeight - 4);
      if (this.index == 2) {
        this.setWidth(documentWidth - 4);
      }
      else {
        this.setWidth(0.5 * documentWidth - 4);
      }
      if (this.index == 0) {
        this.css('float', 'right');
      }
      break; 
    case 4:
      this.setHeight(0.36 * documentHeight - 4);
      this.setWidth(0.5 * documentWidth - 4);
      if (this.index == 0 || this.index == 2) {
        this.css('float', 'right');
      }
  }
}


