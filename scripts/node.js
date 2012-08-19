function Node (x, y, radius, nodeNumber) {
  this.x = x;
  this.y = y;
  this.highlighted = false;
  this.radius = radius;
  this.label = "Node " + nodeNumber;
  
  this.getLabel = function () {
    return this.label;
  }
  
  this.setLabel = function (newLabel) {
    this.label = newLabel;  
  }
  
  this.getRadius = function () {
    return this.radius;
  }
  
  this.setRadius = function (newRadius) {
    this.radius = newRadius;
  }

  this.getX = function () {
    return this.x;
  }

  this.setX = function (newX) {
    this.x = newX;
  }

  this.getY = function () {
    return this.y;
  }

  this.setY = function (newY) {
    this.y = newY; 
  }

  this.highlight = function () {
    this.highlighted = !this.highlighted;
  }

  this.isHighlighted = function () {
    return this.highlighted; 
  }
}  


