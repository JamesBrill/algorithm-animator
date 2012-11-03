// Object representing a node. Takes five parameters, it's initial x/y coordinates,
// its unique number and its relative position on the canvas. Also records whether
// the node is highlighted or not, its name and label as well as any algorithm-
// specific data related to the node.
Node = function (initX, initY, nodeNumber, xDepth, yDepth) {
  this.x = initX;
  this.y = initY;
  this.highlighted = false;
  this.name = "N" + nodeNumber; // Node name
  this.label = this.name; // Label next to node - name + node data
  this.algorithmSpecificData = new Array(); // Algorithm-specific value at each step
  this.verticalDepth = yDepth; // Relative vertical position on canvas (%)
  this.horizontalDepth = xDepth; // Relative horizontal position on canvas (%)
}

// Reset algorithm-specific data
Node.prototype.resetAlgorithmSpecificData = function () {
  this.algorithmSpecificData = new Array();
}

// Get the node's algorithm-specific value at a given step
Node.prototype.getAlgorithmSpecificData = function (index) {
  if (index < 0)  {
    alert ("Index out of bounds.");
    return null;
  }    
  else if (index > this.algorithmSpecificData.length - 1) {
    return this.algorithmSpecificData[this.algorithmSpecificData.length - 1];
  }
  return this.algorithmSpecificData[index];
}

// Set new algorithm-specific value at given step
Node.prototype.setAlgorithmSpecificData = function (index,newAlgorithmSpecificData) {    
  // If given step is outside of node's known range of steps, add the last 
  // known value to all the steps from the last step up until the new one
  if (index > this.algorithmSpecificData.length - 1) {
    var lastValue = this.algorithmSpecificData[this.algorithmSpecificData.length - 1];
    var numberOfPushes = index - (this.algorithmSpecificData.length - 1);
    for (var i = 0; i < numberOfPushes - 1; i++) {
      this.algorithmSpecificData.push(lastValue);
    }
    this.algorithmSpecificData.push(newAlgorithmSpecificData);
  }  
  else {
    this.algorithmSpecificData[index] = newAlgorithmSpecificData;
  }
}

// Get node's label
Node.prototype.getLabel = function () {
  return this.label;
}

// Set node's label
Node.prototype.setLabel = function (newLabel) {
  this.label = newLabel;  
}

// Get node's name
Node.prototype.getName = function () {
  return this.name;
}

// Set node's name
Node.prototype.setName = function (newName) {
  this.name = newName;
  this.label = newName;
}

// Get node's current x-coordinate
Node.prototype.getX = function () {
  return this.x;
}

// Set node's current x-coordinate
Node.prototype.setX = function (newX) {
  this.x = newX;
}

// Get node's current y-coordinate
Node.prototype.getY = function () {
  return this.y;
}

// Set node's current y-coordinate
Node.prototype.setY = function (newY) {
  this.y = newY; 
}

// Get node's current x-coordinate
Node.prototype.highlight = function () {
  this.highlighted = !this.highlighted;
}

// Change highlight status of node
Node.prototype.isHighlighted = function () {
  return this.highlighted; 
}

// Get node's relative horizontal position on canvas
Node.prototype.getXDepth = function () {
  return this.horizontalDepth;
}

// Get node's relative vertical position on canvas
Node.prototype.getYDepth = function () {
  return this.verticalDepth;
}

// Set node's relative position on canvas
Node.prototype.setDepth = function (newXDepth, newYDepth) {
  this.verticalDepth = newYDepth;
  this.horizontalDepth = newXDepth;
}