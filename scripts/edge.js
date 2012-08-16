function Edge (x, y) {
  this.fromNode = x;
  this.toNode = y;
  this.selected = false; 
  this.highlighted = false;

  this.getFromNode = function () {
    return this.fromNode;
  }

  this.getToNode = function () {
    return this.toNode;
  }   
}

