// These objects act as collections of canvases containing the same dataset so
// algorithm views can be labelled correctly.
CanvasGroup = function(data, ID) {
  this.data = data; // Input data
  this.canvasArray = new Array(); // Array of canvases
  this.groupID = ID; // ID of group
}

// Get group ID
CanvasGroup.prototype.getID = function() {
  return this.groupID;
}

// Set group ID (apply this to individual canvases also)
CanvasGroup.prototype.setID = function(ID) {
  this.groupID = ID;
  for (var i = 0; i < this.canvasArray.length; i++) {
    this.canvasArray[i].setGroupID(ID);
  }
}

// Add new canvas to the group
CanvasGroup.prototype.addCanvas = function(canvas) {
  this.canvasArray.push(canvas);
  canvas.setGroupID(this.groupID);
}

// Remvoe canvas from the group
CanvasGroup.prototype.removeCanvas = function(canvas) {
  var newCanvasArray = new Array();
  for (var i = 0; i < this.canvasArray.length; i++) {
    if (canvas.getName() != this.canvasArray[i].getName()) {
      newCanvasArray.push(this.canvasArray[i]);
    }
  }
  this.canvasArray = newCanvasArray;
}

// Get the group's shared input data
CanvasGroup.prototype.getData = function() {
  return this.data;
}

// Does this given dataset match the group's input data?
CanvasGroup.prototype.matchData = function(data) {
  if (this.data.length != data.length) {
    return false;
  }
  for (var i = 0; i < this.data.length; i++) {
    if (data[i].getValue() != this.data[i].getValue()) {
      return false;
    }
  }
  return true;
}

// Get array of all canvases in group
CanvasGroup.prototype.getCanvasArray = function() {
  return this.canvasArray;
}

// Does the group contain this particular canvas?
CanvasGroup.prototype.contains = function(canvas) {
  for (var i = 0; i < this.canvasArray.length; i++) {
    if (canvas.getName() == this.canvasArray[i].getName()) {
      return true;
    }
  }
  return false;
}