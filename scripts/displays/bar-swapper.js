// Object that handles the swapping of bars from a given input array of bars.
// Speed of bar movement is dictated by the animation's step delay
BarSwapper = function(input, swapOperation, stepDelay) {
  this.input = input; // Input array
  this.firstBar = null; // First bar being swapped
  this.secondBar = null; // Second bar being swapped
  this.stepDelay = stepDelay; // Step delay
  
  // Ensure first bar is one with lowest x-coordinate
  if (this.input[swapOperation[1]].getXCoordinate() < this.input[swapOperation[2]].getXCoordinate()) {
    this.firstBar = this.input[swapOperation[1]];
    this.secondBar = this.input[swapOperation[2]];
  }
  else {
    this.firstBar = this.input[swapOperation[2]];
    this.secondBar = this.input[swapOperation[1]];
  }
    
  // Record initial coordinates of both bars  
  this.startingX_FirstBar = this.firstBar.getXCoordinate();
  this.startingX_SecondBar = this.secondBar.getXCoordinate();  
  
  // Calculate the distance the bars can move on each interval iteration -
  // determined by step delay
  var distanceBetweenBars = this.startingX_SecondBar - this.startingX_FirstBar;
  var numberOfMoves = this.stepDelay / 25;
  this.moveDistance = distanceBetweenBars / numberOfMoves;  
}

// Attempt to move bars towards each other. If successful, return true. 
// Otherwise, return false; this indicates that the swap is complete
BarSwapper.prototype.moveBarsTowardsEachOther = function() {
  // If swap has not been completed, move bars towards each other's original
  // position. If they go too far, set them to their partner's position
  if (this.firstBar.getXCoordinate() != this.startingX_SecondBar &&
      this.secondBar.getXCoordinate() != this.startingX_FirstBar) {
    this.firstBar.setXCoordinate(this.firstBar.getXCoordinate() + this.moveDistance);
    if (this.firstBar.getXCoordinate() > this.startingX_SecondBar) {
      this.firstBar.setXCoordinate(this.startingX_SecondBar);
    }
    this.secondBar.setXCoordinate(this.secondBar.getXCoordinate() - this.moveDistance);
    if (this.secondBar.getXCoordinate() < this.startingX_FirstBar) {
      this.secondBar.setXCoordinate(this.startingX_FirstBar);
    }
    return true;
  }  
  return false;
}

// Swap bars instantly
BarSwapper.prototype.instantSwap = function() {
  this.firstBar.setXCoordinate(this.startingX_SecondBar);
  this.secondBar.setXCoordinate(this.startingX_FirstBar);
}

// Set statuses of both bars
BarSwapper.prototype.setBarStatuses = function(status) {
  this.firstBar.setStatus(status);
  this.secondBar.setStatus(status);
}

