SortingInput = function(value) {
  this.value = value;
  this.status = "unsorted";
  this.xCoordinate = 0;
}

SortingInput.prototype.getValue = function() {
  return this.value;
}

SortingInput.prototype.setValue = function(value) {
  this.value = value;
}

SortingInput.prototype.getStatus = function() {
  return this.status;
}

SortingInput.prototype.setStatus = function(status) {
  this.status = status;
}

SortingInput.prototype.getXCoordinate = function() {
  return this.xCoordinate;
}

SortingInput.prototype.setXCoordinate = function(xCoordinate) {
  this.xCoordinate = xCoordinate;
}

