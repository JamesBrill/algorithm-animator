BarSwapper = function(input, swapOperation, stepDelay) {
  this.input = input;
  this.firstBar = null;
  this.secondBar = null;
  this.stepDelay = stepDelay;
  if (this.input[swapOperation[1]].getXCoordinate() < this.input[swapOperation[2]].getXCoordinate()) {
    this.firstBar = this.input[swapOperation[1]];
    this.secondBar = this.input[swapOperation[2]];
  }
  else {
    this.firstBar = this.input[swapOperation[2]];
    this.secondBar = this.input[swapOperation[1]];
  }
    
  this.startingX_FirstBar = this.firstBar.getXCoordinate();
  this.startingX_SecondBar = this.secondBar.getXCoordinate();  
  var distanceBetweenBars = this.startingX_SecondBar - this.startingX_FirstBar;
  var numberOfMoves = this.stepDelay / 25;
  this.moveDistance = distanceBetweenBars / numberOfMoves;  
}

BarSwapper.prototype.moveBarsTowardsEachOther = function() {
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

BarSwapper.prototype.instantSwap = function() {
  this.firstBar.setXCoordinate(this.startingX_SecondBar);
  this.secondBar.setXCoordinate(this.startingX_FirstBar);
}

BarSwapper.prototype.setBarStatuses = function(status) {
  this.firstBar.setStatus(status);
  this.secondBar.setStatus(status);
}

