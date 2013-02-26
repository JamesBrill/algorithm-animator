// Animator object for bubble sort
BubbleSortAnimator = function(animationData) {
  this.sortingInput = animationData.getSortingInput(); // Input to be sorted
  this.bubbleInstructions = new Array(); // Array of algorithm instructions
  this.pseudocodeInstructions = new Array(); // Array of instructions for pseudocode view
  this.instructionIndex = 0; // Index of current instruction
  this.name = "Bubble Sort"; // Name of algorithm
  this.pseudocode = 
    "sortedIndex = array.length - 1\n\
swapped = false\n\
do\n\
    swapped = false\n\
    for i = 0 to sortedIndex\n\
        if array[i] > array[i+1]\n\
            swap array[i] and array[i+1]\n\
            swapped = true\n\
    sortedIndex--\n\
while (swapped)";
  this.numberOfPseudocodeLines = 10;
}

// Get algorithm name
BubbleSortAnimator.prototype.getName = function() {
  return this.name;
}

// Build an array of instructions
BubbleSortAnimator.prototype.buildAnimation = function() {
  var input = this.sortingInput;
  var swapped; // Were any numbers swapped in that last iteration?
  var sortedIndex = input.length-1; // Index where sorted numbers begin
  var pseudocodeRange = new Array();
    
  this.addNewInstruction("begin"); // Add a "begin" instruction
  this.addNewPseudocodeInstruction([1,2,3,4,5,6,7]);
  
  // Make bubble sort iterations while the array is still unsorted
  do {
    swapped = false;
    // For each unsorted number in the array...
    for (var i = 0; i < sortedIndex; i++) {
      // Add a "compare" instruction. This comes in the form "compare index1 index2"
      this.addNewInstruction("compare " + i + " " + (i+1));
      this.addNewPseudocodeInstruction([8]);
      // If current number is greater than the next number, swap them
      if (input[i].getValue() > input[i+1].getValue()) {        
        buckets.arrays.swap(input,i,i+1);
        // Add a "swap" instruction. This comes in the form "swap index1 index2"
        this.addNewInstruction("swap " + i + " " + (i+1));
        swapped = true;
        pseudocodeRange = (i == sortedIndex) ? [9,10,11] : [9,10,17];
      }
      else {
        pseudocodeRange = (i == sortedIndex) ? ((!swapped) ? [11,12] : [11]) : [7];        
      }
      this.addNewPseudocodeInstruction(pseudocodeRange);
    }
    // Add a "recolour" instruction. This comes in the form 
    // "recolour index fromColour toColour"
    this.addNewInstruction("recolour " + sortedIndex + " unsorted sorted");
    sortedIndex--;
  } while (swapped); 
  
  // Add "recolour" instructions for remaining sorted numbers
  if (sortedIndex > -1) {
    for (i = sortedIndex; i > -1; i--) {
      this.addNewInstruction("recolour " + i + " unsorted sorted");
    }
  }
}

// Add new instruction
BubbleSortAnimator.prototype.addNewInstruction = function(instruction) {
  this.bubbleInstructions.push(instruction);
}

// Return current instruction
BubbleSortAnimator.prototype.currentInstruction = function() {
  return this.bubbleInstructions[this.instructionIndex];
}

// Return previous instruction
BubbleSortAnimator.prototype.prevInstruction = function() {
  if (this.instructionIndex - 1 >= 0) {
    return this.bubbleInstructions[this.instructionIndex - 1];
  }
  return null;
}

// Return next instruction
BubbleSortAnimator.prototype.nextInstruction = function() {
  if (this.instructionIndex + 1 <= this.bubbleInstructions.length - 1) {
    return this.bubbleInstructions[this.instructionIndex + 1];
  }
  return null;
}

// Add new pseudocode instruction
BubbleSortAnimator.prototype.addNewPseudocodeInstruction = function(instruction) {
  this.pseudocodeInstructions.push(instruction);
}

// Return current pseudocode instruction
BubbleSortAnimator.prototype.currentPseudocodeInstruction = function() {
  return this.pseudocodeInstructions[this.instructionIndex];
}

// Return previous pseudocode instruction
BubbleSortAnimator.prototype.prevPseudocodeInstruction = function() {
  if (this.instructionIndex - 1 >= 0) {
    return this.pseudocodeInstructions[this.instructionIndex - 1];
  }
  return null;
}

// Return next pseudocode instruction
BubbleSortAnimator.prototype.nextPseudocodeInstruction = function() {
  if (this.instructionIndex + 1 <= this.pseudocodeInstructions.length - 1) {
    return this.pseudocodeInstructions[this.instructionIndex + 1];
  }
  return null;
}

// Move to next instruction
BubbleSortAnimator.prototype.moveToNextInstruction = function() {  
  this.instructionIndex++;
}

// Move to previous instruction
BubbleSortAnimator.prototype.moveToPrevInstruction = function() {
  this.instructionIndex--;
}

// Get the next instruction that is animated
BubbleSortAnimator.prototype.getNextAnimatedInstruction = function() {  
  var tempIndex = this.instructionIndex;  
  var instruction = this.bubbleInstructions[tempIndex].split(" ");
  while (!this.isEnded() && instruction[0] != "compare" && instruction[0] != "swap") {
    tempIndex++;
    instruction = this.bubbleInstructions[tempIndex].split(" ");
  }
  
  if (this.isEnded()) {
    return null;
  }
  return this.bubbleInstructions[tempIndex];
}

// Has animation ended?
BubbleSortAnimator.prototype.isEnded = function() {
  return (this.instructionIndex >= this.bubbleInstructions.length);
}

// Is the instruction index currently pointing to the last instruction
BubbleSortAnimator.prototype.isLastInstruction = function() {
  return (this.instructionIndex == this.bubbleInstructions.length - 1);
}

// Ensure instruction index points to something in the input array
BubbleSortAnimator.prototype.calibrateInstructionIndex = function() {
  if (this.instructionIndex < 0) {
    this.instructionIndex = 0;
  }
  if (this.instructionIndex >= this.bubbleInstructions.length) {
    this.instructionIndex = this.bubbleInstructions.length - 1;
  }
}

// Get the algorithm's pseudocode in the form of a string
BubbleSortAnimator.prototype.getPseudocode = function() {
  return this.pseudocode;
}

// Get number of lines in algorithm's pseudocode
BubbleSortAnimator.prototype.getNumberOfPseudocodeLines = function() {
  return this.numberOfPseudocodeLines;
}