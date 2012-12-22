BarGraph = function(canvas) {
  this.canvas = canvas;
  this.context = this.canvas.getContext('2d');
  this.input = new Array();
  this.height = canvas.height;
  this.width = canvas.width;
  this.largestInput = 0;
  this.animationController = null;
  this.animating = false;
  this.animationMode = false;
}

BarGraph.prototype.getInput = function() {
  return this.input;
}

BarGraph.prototype.setInput = function(input) {
  for (var i = 0; i < input.length; i++) {
    this.addInputNumber(input[i].getValue());
  }
}

BarGraph.prototype.setAnimationController = function(animationController) {
  this.animationController = animationController;
}

BarGraph.prototype.setAnimationMode = function(isAnimating) {  
  this.animationMode = isAnimating;
}

BarGraph.prototype.getAnimationMode = function() {
  return this.animationMode;
}

BarGraph.prototype.animateStep = function(instruction) {
  if (!this.animating) {
    this.animating = true;
    var operation = instruction.split(" ");
    if (operation[0] == "swap") {
      this.swap(operation);
    }
    else if (operation[0] == "compare") {
      this.compare(operation);
    }
    else {
      this.recolour(operation);
    }
  }
}

BarGraph.prototype.recolour = function(operation) {
  this.input[operation[1]].setStatus(operation[3]);
  if (this.animationMode) {
    var nextInstruction = this.animationController.nextState();
    this.animationController.moveToNextState();
    this.animating = false;
    this.animateStep(nextInstruction);    
  }
}

BarGraph.prototype.compare = function(operation) {
  var firstBar = this.input[operation[1]];
  var secondBar = this.input[operation[2]];
  var newFirstBarIndex = operation[1];
  var newSecondBarIndex = operation[2];
  firstBar.setStatus("compared");
  secondBar.setStatus("compared");
  var objectRef = this;
  var stepDelay = this.animationController.getStepDelay();
  setTimeout(function() {
    objectRef.animating = false;
    var nextInstruction = objectRef.animationController.nextState();
    if (nextInstruction.split(" ")[1] != newFirstBarIndex && nextInstruction.split(" ")[2] != newFirstBarIndex) {
      firstBar.setStatus("unsorted");
    }
    if (nextInstruction.split(" ")[1] != newSecondBarIndex && nextInstruction.split(" ")[2] != newSecondBarIndex) {
      secondBar.setStatus("unsorted");
    }      
    if (objectRef.animationMode) {
      objectRef.animationController.moveToNextState();
      objectRef.animateStep(nextInstruction);    
    }  
  }, stepDelay);
}

BarGraph.prototype.swap = function(operation) {  
  var firstBar, secondBar;
  var newFirstBarIndex, newSecondBarIndex;
  if (this.input[operation[1]].getXCoordinate() < this.input[operation[2]].getXCoordinate()) {
    firstBar = this.input[operation[1]];
    secondBar = this.input[operation[2]];
    newFirstBarIndex = operation[2];
    newSecondBarIndex = operation[1];
  }
  else {
    firstBar = this.input[operation[2]];
    secondBar = this.input[operation[1]];
    newFirstBarIndex = operation[1];
    newSecondBarIndex = operation[2];
  }
    
  var startingX_FirstBar = firstBar.getXCoordinate();
  var startingX_SecondBar = secondBar.getXCoordinate();
  var distanceBetweenBars = startingX_SecondBar - startingX_FirstBar;
  var numberOfMoves = this.animationController.getStepDelay() / 25;
  var moveDistance = distanceBetweenBars / numberOfMoves;  
  var objectRef = this;  
    
  var swapTimer = setInterval(function() {     
    firstBar.setStatus("compared");
    secondBar.setStatus("compared");
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
      clearInterval(swapTimer); 
      buckets.arrays.swap(objectRef.input,operation[1],operation[2]);
      objectRef.animating = false;
      var nextInstruction = objectRef.animationController.nextState();
      if (nextInstruction == null) {
        firstBar.setStatus("unsorted");
        secondBar.setStatus("unsorted");
        return;
      }
      if (nextInstruction.split(" ")[1] != newFirstBarIndex && nextInstruction.split(" ")[2] != newFirstBarIndex) {
        firstBar.setStatus("unsorted");
      }
      if (nextInstruction.split(" ")[1] != newSecondBarIndex && nextInstruction.split(" ")[2] != newSecondBarIndex) {
        secondBar.setStatus("unsorted");
      }        
      if (objectRef.animationMode) {
        objectRef.animationController.moveToNextState();
        objectRef.animateStep(nextInstruction);    
      }
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
    this.drawBar(this.input[i], i);
  }
  this.drawArrayBoxes();
  this.drawIndexes();
}

BarGraph.prototype.drawBar = function(input) {
  var inputProportion = input.getValue() / this.largestInput;
  var barWidth = ((0.9 * this.width) / this.input.length) * (2/3);
  var barHeight = inputProportion * (0.8 * this.height);
  var topX = input.getXCoordinate();
  var topY = 0.85 * this.height - barHeight;
  if (input.getStatus() == "unsorted" || input.getStatus() == "compared") {
    this.context.fillStyle = "#ADFF2F";
  }
  else if (input.getStatus() == "sorted") {
    this.context.fillStyle = "#228B22";
  }
  this.context.fillRect(topX, topY, barWidth, barHeight);
  if (input.getStatus() == "compared") {
    this.context.strokeStyle = "#228B22";
    for (var i = 0; i < 5; i++) {
      this.context.strokeRect(topX + i, topY + i, barWidth - 2 * i, barHeight - 2 * i);
    }
  }
  
  this.context.fillStyle    = '#00f';
  this.context.font         = '30px sans-serif';
  this.context.textBaseline = 'top';
  this.context.textAlign    = 'center';
  this.context.fillText(input.getValue(), topX + 0.5 * barWidth, topY + barHeight, barWidth);
}

BarGraph.prototype.drawArrayBoxes = function() {
  this.context.strokeStyle = "black";
  var x = 0.05 * this.width - (((0.9 * this.width) / this.input.length) * (1/6));
  for (var i = 0; i < this.input.length; i++) {
    this.context.strokeRect(x, 0.85 * this.height, ((0.9 * this.width) / this.input.length), 30);
    x += (0.9 * this.width) / ((this.input.length * 3 - 1)/3);
  }
}

BarGraph.prototype.drawIndexes = function() {
  var x = 0.05 * this.width;
  for (var i = 0; i < this.input.length; i++) {
    var topX = x + ((0.9 * this.width) / this.input.length) * (1/3);
    var topY = 0.85 * this.height + 30;
    var maxWidth = ((0.9 * this.width) / this.input.length) * (2/3);
    this.context.fillStyle    = '#00f';
    this.context.font         = '20px sans-serif';
    this.context.textBaseline = 'top';
    this.context.textAlign    = 'center';
    this.context.fillText(i, topX, topY, maxWidth);
    x += (0.9 * this.width) / ((this.input.length * 3 - 1)/3);
  }
}