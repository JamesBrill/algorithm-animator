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
  this.skipMode = false;
  this.singleStepMode = false;
  this.lastInstruction = null;
  this.lastDirection = "not reverse";
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

BarGraph.prototype.isAnimationMode = function() {
  return this.animationMode;
}

BarGraph.prototype.isAnimating = function() {
  return this.animating;
}

BarGraph.prototype.setSkipMode = function(skipMode) {
  this.skipMode = skipMode;
}

BarGraph.prototype.nextStep = function() {
  this.skipMode = false;
  this.singleStepMode = true;
  if (this.lastDirection == "reverse") {
    this.animationController.moveToNextState();
  }
  this.instantlyAnimateStep(this.animationController.currentState(), "not reverse");
}

BarGraph.prototype.prevStep = function() {
  this.skipMode = false;
  this.singleStepMode = true;
  if (this.lastDirection == "not reverse") {
    this.animationController.moveToPrevState();
  }
  this.instantlyAnimateStep(this.animationController.currentState(), "reverse");
}

BarGraph.prototype.goToBeginning = function() {
  this.instantlyAnimateStep(this.animationController.currentState(), "reverse");
}

BarGraph.prototype.goToEnd = function() {
  this.instantlyAnimateStep(this.animationController.currentState(), "not reverse");
}

BarGraph.prototype.animateStep = function(instruction, reverseMode) {
  if (!this.animating) {
    this.animating = true;
    var operation = instruction.split(" ");
    if (operation[0] == "swap") {
      this.swap(operation, reverseMode);
    }
    else if (operation[0] == "compare") {
      this.compare(operation, reverseMode);
    }
    else if (operation[0] == "recolour") {
      this.recolour(operation, "not instant", reverseMode);
    } 
    else {
      this.begin(operation, "not instant", reverseMode);
    }
  }
}

BarGraph.prototype.instantlyAnimateStep = function(instruction, reverseMode) {
  var operation = instruction.split(" ");
  if (operation[0] == "swap") {
    if (this.singleStepMode) {
      this.animating = true;
      this.swap(operation, reverseMode);
    }
    else {
      this.instantlySwap(operation, reverseMode);
    }
  }
  else if (operation[0] == "compare") {
    this.instantlyCompare(operation, reverseMode);
  }
  else if (operation[0] == "recolour") {
    this.recolour(operation, "instant", reverseMode);
  } 
  else {
    this.begin(operation, "instant", reverseMode);
  }  
}

BarGraph.prototype.begin = function(operation, instantMode, reverseMode) {
  this.tidyUpLastStep(operation, reverseMode);
  if (reverseMode == "reverse") {
    for (var i = 0; i < this.input.length; i++) {
      this.input[i].setStatus("unsorted");
    }
  }
  var nextInstruction = this.animationController.currentState();
  this.animating = false;
  if (instantMode == "instant") {
    this.instantlyAnimateStep(nextInstruction, reverseMode);  
  }
  else {
    this.animateStep(nextInstruction, reverseMode); 
  }
  this.singleStepMode = false;
}

BarGraph.prototype.recolour = function(operation, instantMode, reverseMode) {
  var lastInstruction = this.lastInstruction;
  if (reverseMode == "reverse") {
    this.input[operation[1]].setStatus(operation[2]);
    this.animationController.moveToPrevState();
  }
  else {
    this.input[operation[1]].setStatus(operation[3]);
    this.animationController.moveToNextState();
  }  

  if (lastInstruction != null && lastInstruction.split(" ")[0] != "recolour") {
    if (lastInstruction.split(" ")[1] != operation[1]) {
      this.input[lastInstruction.split(" ")[1]].setStatus("unsorted");
    }
    if (lastInstruction.split(" ")[2] != operation[1]) {
      this.input[lastInstruction.split(" ")[2]].setStatus("unsorted");
    }
  }
  
  this.lastInstruction = operation.join(" ");
  
  var nextInstruction = this.animationController.currentState(); 
  if (nextInstruction == null) {
    return;
  }
  this.animating = false;
  if (instantMode == "instant") {
    this.instantlyAnimateStep(nextInstruction, reverseMode); 
  }
  else {
    this.animateStep(nextInstruction, reverseMode);
  }
  this.singleStepMode = false;
}

BarGraph.prototype.compare = function(operation, reverseMode) {
  var firstBar = this.input[operation[1]];
  var secondBar = this.input[operation[2]];
  firstBar.setStatus("compared");
  secondBar.setStatus("compared");

  this.tidyUpLastStep(operation, reverseMode);
  
  var stepDelay = this.animationController.getStepDelay();
  setTimeout(function() {
    this.animating = false;
    var nextInstruction = this.animationController.currentState();
    
    if (this.animationMode) {
      this.animateStep(nextInstruction, reverseMode);    
    }  
    
  }.bind(this), stepDelay);
}

BarGraph.prototype.instantlyCompare = function(operation, reverseMode) {
  var firstBar = this.input[operation[1]];
  var secondBar = this.input[operation[2]];
  firstBar.setStatus("compared");
  secondBar.setStatus("compared");
  
  this.tidyUpLastStep(operation, reverseMode);
  
  var nextInstruction = this.animationController.currentState(); 
  if (nextInstruction == null) {
    return;
  }

  if (!this.singleStepMode) {
    this.instantlyAnimateStep(nextInstruction, reverseMode); 
  }
  this.singleStepMode = false;
}

BarGraph.prototype.swap = function(operation, reverseMode) {  
  var firstBar, secondBar;
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
  var numberOfMoves = this.animationController.getStepDelay() / 25;
  var moveDistance = distanceBetweenBars / numberOfMoves;  
    
  this.tidyUpLastStep(operation, reverseMode); 
    
  var swapTimer = setInterval(function() {  
    if (this.skipMode) {
      clearInterval(swapTimer);
      this.singleStepMode = false;
      firstBar.setXCoordinate(startingX_SecondBar);
      secondBar.setXCoordinate(startingX_FirstBar);
      buckets.arrays.swap(this.input,operation[1],operation[2]);
      this.animating = false;
      this.skipMode = false;
      return;
    }
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
      buckets.arrays.swap(this.input,operation[1],operation[2]);
      this.animating = false;
      var nextInstruction = this.animationController.currentState();
      if (nextInstruction == null) {
        firstBar.setStatus("unsorted");
        secondBar.setStatus("unsorted");
        return;
      }
      if (this.animationMode && !this.singleStepMode) { 
        this.animateStep(nextInstruction, reverseMode);    
      }
      this.singleStepMode = false;
    }
  }.bind(this),25);
}

BarGraph.prototype.instantlySwap = function(operation, reverseMode) { 
  var firstBar = this.input[operation[1]];
  var secondBar = this.input[operation[2]];    
  var startingX_FirstBar = firstBar.getXCoordinate();
  var startingX_SecondBar = secondBar.getXCoordinate();
  firstBar.setXCoordinate(startingX_SecondBar);
  secondBar.setXCoordinate(startingX_FirstBar);
  
  this.tidyUpLastStep(operation, reverseMode);
  
  this.input[operation[1]].setStatus("compared");
  this.input[operation[2]].setStatus("compared");
  buckets.arrays.swap(this.input,operation[1],operation[2]);
  var nextInstruction = this.animationController.currentState(); 
  this.instantlyAnimateStep(nextInstruction, reverseMode);
}

BarGraph.prototype.tidyUpLastStep = function(operation, reverseMode) {
  var lastInstruction = this.lastInstruction;
  if (reverseMode == "reverse") {
    this.animationController.moveToPrevState();
  }
  else {
    this.animationController.moveToNextState();
  }  
    
  if (lastInstruction != null && lastInstruction.split(" ")[0] != "recolour"
    && operation[0] != "begin" && lastInstruction.split(" ")[0] != "begin") {
    if (lastInstruction.split(" ")[1] != operation[1] && lastInstruction.split(" ")[1] != operation[2]) {
      this.input[lastInstruction.split(" ")[1]].setStatus("unsorted");
    }
    if (lastInstruction.split(" ")[2] != operation[1] && lastInstruction.split(" ")[2] != operation[2]) {
      this.input[lastInstruction.split(" ")[2]].setStatus("unsorted");
    }
  }   
  
  this.lastInstruction = operation.join(" ");
  this.lastDirection = reverseMode;
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