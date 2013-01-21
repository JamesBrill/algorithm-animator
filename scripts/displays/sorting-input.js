// Object representing an input number in a sorting algorithm
SortingInput = function(value) {
  this.value = value; // Numerical value
  this.status = "unsorted"; // Status - affects the way the input is drawn
  this.marker = "unmarked"; // Marker - denotes special property when drawn
  this.xCoordinate = 0; // X-coordinate on display
  this.size = 0; // Size on display
}

// Get numerical value
SortingInput.prototype.getValue = function() {
  return this.value;
}

// Set numerical value
SortingInput.prototype.setValue = function(value) {
  this.value = value;
}

// Get status
SortingInput.prototype.getStatus = function() {
  return this.status;
}

// Set status
SortingInput.prototype.setStatus = function(status) {
  this.status = status;
}

// Get marker
SortingInput.prototype.getMarker = function() {
  return this.marker;
}

// Set marker
SortingInput.prototype.setMarker = function(marker) {
  this.marker = marker;
}

// Get display size
SortingInput.prototype.getSize = function() {
  return this.size;
}

// Set display size
SortingInput.prototype.setSize = function(size) {
  this.size = size;
}

// Get x-coordinate
SortingInput.prototype.getXCoordinate = function() {
  return this.xCoordinate;
}

// Set x-coordinate
SortingInput.prototype.setXCoordinate = function(xCoordinate) {
  this.xCoordinate = xCoordinate;
}

