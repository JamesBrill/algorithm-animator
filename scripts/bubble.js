BubbleSortAnimator = function(animationData) {
  this.sortingInput = animationData.getSortingInput();
  this.bubbleStates = new Array();
  this.stateIndex = 0;
  this.ended = false;
}

BubbleSortAnimator.prototype.buildAnimation = function() {
  var input = this.sortingInput;
  var swapped;
  do {
    swapped = false;
    for (var i=0; i < input.length-1; i++) {
      if (input[i].getValue() > input[i+1].getValue()) {        
        buckets.arrays.swap(input,i,i+1);
        this.addNewState("swap " + i + " " + (i+1));
        swapped = true;
      }
    }
  } while (swapped); 
}

BubbleSortAnimator.prototype.addNewState = function(state) {
  this.bubbleStates.push(state);
}

BubbleSortAnimator.prototype.nextState = function() {
  return this.bubbleStates[this.stateIndex++];
}


