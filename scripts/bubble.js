BubbleSortAnimator = function(animationData) {
  this.sortingInput = animationData.getSortingInput();
  this.bubbleStates = new Array();
  this.stateIndex = 0;
}

BubbleSortAnimator.prototype.buildAnimation = function() {
  var input = this.sortingInput;
  var swapped;
  var sortedIndex = input.length-1;
  this.addNewState("begin");
  do {
    swapped = false;
    for (var i=0; i < sortedIndex; i++) {
      this.addNewState("compare " + i + " " + (i+1));
      if (input[i].getValue() > input[i+1].getValue()) {        
        buckets.arrays.swap(input,i,i+1);
        this.addNewState("swap " + i + " " + (i+1));
        swapped = true;
      }
    }
    this.addNewState("recolour " + sortedIndex + " unsorted sorted");
    sortedIndex--;
  } while (swapped); 
  
  if (sortedIndex > -1) {
    for (i = sortedIndex; i > -1; i--) {
      this.addNewState("recolour " + i + " unsorted sorted");
    }
  }
}

BubbleSortAnimator.prototype.addNewState = function(state) {
  this.bubbleStates.push(state);
}

BubbleSortAnimator.prototype.currentState = function() {
  return this.bubbleStates[this.stateIndex];
}

BubbleSortAnimator.prototype.prevState = function() {
  if (this.stateIndex - 1 >= 0) {
    return this.bubbleStates[this.stateIndex - 1];
  }
  return null;
}

BubbleSortAnimator.prototype.nextState = function() {
  if (this.stateIndex + 1 <= this.bubbleStates.length - 1) {
    return this.bubbleStates[this.stateIndex + 1];
  }
  return null;
}

BubbleSortAnimator.prototype.moveToNextState = function() {  
  this.stateIndex++;
}

BubbleSortAnimator.prototype.moveToPrevState = function() {
  this.stateIndex--;
}

BubbleSortAnimator.prototype.isEnded = function() {
  return (this.stateIndex >= this.bubbleStates.length);
}

BubbleSortAnimator.prototype.isLastInstruction = function() {
  return (this.stateIndex == this.bubbleStates.length - 1);
}

BubbleSortAnimator.prototype.calibrateStateIndex = function() {
  if (this.stateIndex < 0) {
    this.stateIndex = 0;
  }
  if (this.stateIndex >= this.bubbleStates.length) {
    this.stateIndex = this.bubbleStates.length - 1;
  }
}