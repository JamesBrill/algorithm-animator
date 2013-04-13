// Animator class for selection sort
SelectionSortAnimator = function(animationData) {
  this.sortingInput = animationData.getSortingInput(); // Input to be sorted
  this.selectionInstructions = new Array(); // Array of algorithm instructions
  this.instructionIndex = 0; // Index of current instruction
  this.name = "Selection Sort"; // Name of algorithm
}

// Get algorithm name
SelectionSortAnimator.prototype.getName = function() {
  return this.name;
}

// Build an array of instructions
SelectionSortAnimator.prototype.buildAnimation = function() {
  var input = this.sortingInput;
  
  this.addNewInstruction("begin"); // Add a "begin" instruction
  
  // Perform one pass for each element of the array, meaning selection sort
  // always runs in O(n^2) time.
  for (var i = 0; i < input.length; i++) {
    // Add a "mark" instruction. This comes in the form "mark index fromMarkedState toMarkedState"
    // This means that the first element on this pass at index i is initially deemed to be
    // the smallest element found so far on this pass.
    this.addNewInstruction("mark " + i + " unmarked nextSmallest");     
    // Index of smallest element found on this pass
    var smallestValueIndex = i;

    // For each element after the current element, compare with the smallest
    // element so far. When a new smallest element is found, mark it and update
    // the index variable for the smallest element.
    for (var k = i+1; k < input.length; k++) {
      this.addNewInstruction("compare " + k + " " + smallestValueIndex);
      if (input[k].getValue() < input[smallestValueIndex].getValue()) {
        this.addNewInstruction("mark " + k + " unmarked nextSmallest"); 
        this.addNewInstruction("mark " + smallestValueIndex + " nextSmallest unmarked"); 
        smallestValueIndex = k;
      }
    }

    // Unmark the smallest element for this pass
    this.addNewInstruction("mark " + smallestValueIndex + " nextSmallest unmarked"); 
    
    // If the first element on this pass is not the smallest element, swap it with 
    // the smallest element. Afterwards, in either case, recolour the smallest
    // element as sorted.
    if (smallestValueIndex != i) {
      buckets.arrays.swap(input,i,smallestValueIndex);
      this.addNewInstruction("swap " + i + " " + smallestValueIndex);
      this.addNewInstruction("recolour " + i + " unsorted sorted");
    }
    else {
      this.addNewInstruction("recolour " + smallestValueIndex + " unsorted sorted");
    }
    
    // If there is one more unsorted element left, it is implicitly sorted as
    // all previous elements are sorted. Recolour it as sorted and break out of 
    // the loop.
    if (i == (input.length - 2)) {
      this.addNewInstruction("recolour " + (i+1) + " unsorted sorted");
      break;
    }
  }
}

// Add new instruction
SelectionSortAnimator.prototype.addNewInstruction = function(instruction) {
  this.selectionInstructions.push(instruction);
}

// Return current instruction
SelectionSortAnimator.prototype.currentInstruction = function() {
  return this.selectionInstructions[this.instructionIndex];
}

// Return previous instruction
SelectionSortAnimator.prototype.prevInstruction = function() {
  if (this.instructionIndex - 1 >= 0) {
    return this.selectionInstructions[this.instructionIndex - 1];
  }
  return null;
}

// Return next instruction
SelectionSortAnimator.prototype.nextInstruction = function() {
  if (this.instructionIndex + 1 <= this.selectionInstructions.length - 1) {
    return this.selectionInstructions[this.instructionIndex + 1];
  }
  return null;
}

// Move to next instruction
SelectionSortAnimator.prototype.moveToNextInstruction = function() {  
  this.instructionIndex++;
}

// Move to previous instruction
SelectionSortAnimator.prototype.moveToPrevInstruction = function() {
  this.instructionIndex--;
}

// Get the next instruction that is animated
SelectionSortAnimator.prototype.getNextAnimatedInstruction = function() {  
  var tempIndex = this.instructionIndex;  
  var instruction = this.selectionInstructions[tempIndex].split(" ");
  while (instruction[0] != "compare" && instruction[0] != "swap") {    
    tempIndex++;
    if (tempIndex >= this.selectionInstructions.length) {
      return null;
    } 
    instruction = this.selectionInstructions[tempIndex].split(" ");
  }
  
  return this.selectionInstructions[tempIndex];
}

// Has animation ended?
SelectionSortAnimator.prototype.isEnded = function() {
  return (this.instructionIndex >= this.selectionInstructions.length);
}

// Is the instruction index currently pointing to the last instruction?
SelectionSortAnimator.prototype.isLastInstruction = function() {
  return (this.instructionIndex == this.selectionInstructions.length - 1);
}

// Ensure instruction index points to something in the input array
SelectionSortAnimator.prototype.calibrateInstructionIndex = function() {
  if (this.instructionIndex < 0) {
    this.instructionIndex = 0;
  }
  if (this.instructionIndex >= this.selectionInstructions.length) {
    this.instructionIndex = this.selectionInstructions.length - 1;
  }
}