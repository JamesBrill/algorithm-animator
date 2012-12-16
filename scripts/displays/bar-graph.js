BarGraph = function(canvas) {
  this.canvas = canvas;
  this.context = this.canvas.getContext('2d');
  this.input = new Array();
  this.height = canvas.height;
  this.width = canvas.width;
  this.largestInput = 0;
}

BarGraph.prototype.animateStep = function(instruction, timeLimit) {
  var operation = instruction.split(" ");
  if (operation[0] == "swap") {
    this.swap(operation, timeLimit);
  }
  else {
    this.recolour(operation, timeLimit);
  }
}

BarGraph.prototype.swap = function(operation, timeLimit) {  
  var firstBar,secondBar;
  if (this.input[operation[1]].getXCoordinate() < this.input[operation[2]].getXCoordinate()) {
    firstBar = this.input[operation[1]];
    secondBar = this.input[operation[2]];
  }
  else {
    firstBar = this.input[operation[2]];
    secondBar = this.input[operation[1]];
  }
  
  var startingX_FirstBar = firstBar.getXCoordinate();
  var startingX_SecondBar = secondBar.getXCoordinate();
  var distanceBetweenBars = startingX_SecondBar - startingX_FirstBar;
  var numberOfMoves = (timeLimit / 25) - 5;
  var moveDistance = distanceBetweenBars / numberOfMoves;  
    
  var swapTimer = setInterval(function() { 
    firstBar.setStatus("moving");
    secondBar.setStatus("moving");
    if (firstBar.getXCoordinate() != startingX_SecondBar &&
        secondBar.getXCoordinate() != startingX_FirstBar) {
      firstBar.setXCoordinate(firstBar.getXCoordinate() + moveDistance);
      if (firstBar.getXCoordinate() > startingX_SecondBar) {
        firstBar.setXCoordinate(startingX_SecondBar);
      }
      secondBar.setXCoordinate(secondBar.getXCoordinate() - moveDistance);
      if (secondBar.getXCoordinate() < startingX_FirstBar) {
        secondBar.setXCoordinate(startingX_FirstBar);
      }
    }
    else {
      firstBar.setStatus("unsorted");
      secondBar.setStatus("unsorted");
      clearInterval(swapTimer);  
    }
  },25);
}


BarGraph.prototype.addInputNumber = function(inputNumber) {
  if (inputNumber > this.largestInput) {
    this.largestInput = inputNumber;
  }
  this.input.push(new SortingInput(inputNumber));
  
  var xCoordinate = 0.05 * this.width;
  for (var i = 0; i < this.input.length; i++) {
    this.input[i].setXCoordinate(xCoordinate);
    xCoordinate += (0.9 * this.width) / ((this.input.length * 3 - 1)/3);
  }
}

BarGraph.prototype.draw = function() {
  this.height = this.canvas.height;
  this.width = this.canvas.width;
  for (var i = 0; i < this.input.length; i++) {
    this.drawBar(this.input[i]);
  }
}

BarGraph.prototype.drawBar = function(input) {
  var inputProportion = input.getValue() / this.largestInput;
  var barWidth = ((0.9 * this.width) / this.input.length) * (2/3);
  var barHeight = inputProportion * (0.85 * this.height);
  var topX = input.getXCoordinate();
  var topY = this.height - (0.1 * this.height + barHeight);
  if (input.getStatus() == "unsorted") {
    this.context.fillStyle = "#ADFF2F";
  }
  else {
    this.context.fillStyle = "red";
  }
  this.context.fillRect(topX, topY, barWidth, barHeight);
}

BarGraph.prototype.setAnimationController = function(animationController) {
  this.animationController = animationController;
}


