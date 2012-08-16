function Node (x, y, radius) {
  this.x = x;
  this.y = y;
  this.selected = false; 
  this.highlighted = false;
  this.radius = radius;
  
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

  this.select = function () {
    this.selected = !this.selected;
  }

  this.isSelected = function () {
    return this.selected;
  }

  this.highlight = function () {
    this.highlighted = !this.highlighted;
  }

  this.isHighlighted = function () {
    return this.highlighted; 
  }
}  


