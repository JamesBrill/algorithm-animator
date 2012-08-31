function Node (initX, initY, initRadius, nodeNumber) {
  var x = initX;
  var y = initY;
  var highlighted = false;
  var radius = initRadius;
  var label = "N" + nodeNumber;
  var algorithmSpecificData = 0;
  
  this.getAlgorithmSpecificData = function () {
    return algorithmSpecificData;
  }
  
  this.setAlgorithmSpecificData = function (newAlgorithmSpecificData) {
    algorithmSpecificData = newAlgorithmSpecificData;  
  }
  
  this.getLabel = function () {
    return label;
  }
  
  this.setLabel = function (newLabel) {
    label = newLabel;  
  }
  
  this.getRadius = function () {
    return radius;
  }
  
  this.setRadius = function (newRadius) {
    radius = newRadius;
  }

  this.getX = function () {
    return x;
  }

  this.setX = function (newX) {
    x = newX;
  }

  this.getY = function () {
    return y;
  }

  this.setY = function (newY) {
    y = newY; 
  }
  
  this.highlight = function () {
    highlighted = !highlighted;
  }

  this.isHighlighted = function () {
    return highlighted; 
  }
}  


