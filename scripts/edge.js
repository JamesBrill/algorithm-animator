function Edge (x, y) {
  this.fromNode = x;
  this.toNode = y;
  this.highlighted = false;
  this.value = 0;

  this.getValue = function () {
    return this.value;
  }
  
  this.setValue = function (newValue) {
    this.value = newValue;
  }

  this.getFromNode = function () {
    return this.fromNode;
  }

  this.getToNode = function () {
    return this.toNode;
  }   
}

