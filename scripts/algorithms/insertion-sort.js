// Animator object for insertion sort
InsertionSortAnimator = function(animationData) {
  this.sortingInput = animationData.getSortingInput(); // Input to be sorted
  this.insertionInstructions = new Array(); // Array of algorithm instructions
  this.instructionIndex = 0; // Index of current instruction
  this.name = "Insertion Sort"; // Name of algorithm
}

// Get algorithm name
InsertionSortAnimator.prototype.getName = function() {
  return this.name;
}

// Build an array of instructions
InsertionSortAnimator.prototype.buildAnimation = function() {
  var input = this.sortingInput;
  
  this.addNewInstruction("begin"); // Add a "begin" instruction
  for (var i = 0; i < input.length; i++) {
    var value = input[i].getValue();

    if (i > 0) {
      this.addNewInstruction("recolour " + (i-1) + " sorted unsorted");
      this.addNewInstruction("recolour " + (i-1) + " unsorted sorted");
      this.addNewInstruction("compare " + i + " " + (i-1));
      this.addNewInstruction("recolour " + i + " unsorted sorted");
      this.addNewInstruction("recolour " + (i-1) + " unsorted sorted");
    }
    
    for (var j = i - 1; j > -1 && input[j].getValue() > value; j--) {
      this.addNewInstruction("recolour " + j + " sorted unsorted");
      buckets.arrays.swap(input, j, j+1);
      this.addNewInstruction("swap " + j + " " + (j+1));
      if (j == 0) {
        this.addNewInstruction("recolour " + j + " unsorted sorted");
      }
      this.addNewInstruction("recolour " + (j+1) + " unsorted sorted");
      if (j > 0) {        
        this.addNewInstruction("recolour " + (j-1) + " sorted unsorted");
        this.addNewInstruction("recolour " + (j-1) + " unsorted sorted");
        this.addNewInstruction("compare " + j + " " + (j-1));
        this.addNewInstruction("recolour " + j + " unsorted sorted");
        this.addNewInstruction("recolour " + (j-1) + " sorted unsorted");
        this.addNewInstruction("recolour " + (j-1) + " unsorted sorted");
      }
    }
  } 
}

// Add new instruction
InsertionSortAnimator.prototype.addNewInstruction = function(instruction) {
  this.insertionInstructions.push(instruction);
}

// Return current instruction
InsertionSortAnimator.prototype.currentInstruction = function() {
  return this.insertionInstructions[this.instructionIndex];
}

// Return previous instruction
InsertionSortAnimator.prototype.prevInstruction = function() {
  if (this.instructionIndex - 1 >= 0) {
    return this.insertionInstructions[this.instructionIndex - 1];
  }
  return null;
}

// Return next instruction
InsertionSortAnimator.prototype.nextInstruction = function() {
  if (this.instructionIndex + 1 <= this.insertionInstructions.length - 1) {
    return this.insertionInstructions[this.instructionIndex + 1];
  }
  return null;
}

// Move to next instruction
InsertionSortAnimator.prototype.moveToNextInstruction = function() {  
  this.instructionIndex++;
}

// Move to previous instruction
InsertionSortAnimator.prototype.moveToPrevInstruction = function() {
  this.instructionIndex--;
}

// Get the next instruction that is animated
InsertionSortAnimator.prototype.getNextAnimatedInstruction = function() {  
  var tempIndex = this.instructionIndex;  
  var instruction = this.insertionInstructions[tempIndex].split(" ");
  while (instruction[0] != "compare" && instruction[0] != "swap") {    
    tempIndex++;
    if (tempIndex >= this.insertionInstructions.length) {
      return null;
    } 
    instruction = this.insertionInstructions[tempIndex].split(" ");
  }
  
  return this.insertionInstructions[tempIndex];
}

// Has animation ended?
InsertionSortAnimator.prototype.isEnded = function() {
  return (this.instructionIndex >= this.insertionInstructions.length);
}

// Is the instruction index currently pointing to the last instruction
InsertionSortAnimator.prototype.isLastInstruction = function() {
  return (this.instructionIndex == this.insertionInstructions.length - 1);
}

// Ensure instruction index points to something in the input array
InsertionSortAnimator.prototype.calibrateInstructionIndex = function() {
  if (this.instructionIndex < 0) {
    this.instructionIndex = 0;
  }
  if (this.instructionIndex >= this.insertionInstructions.length) {
    this.instructionIndex = this.insertionInstructions.length - 1;
  }
}