
// Maybe make self-tidying when interrupted/finished?
// IMPLEMENT INSTANT VERSION
BarGraph.prototype.insert = function(operation, instantMode, reverseMode) {
  // Move to following step, which is dependent on current direction
  this.moveToFollowingStep(reverseMode);   

  var smaller = Math.min(operation[1], operation[2]);
  var larger = Math.max(operation[1], operation[2]);
  var difference = larger - smaller;
  var stepDelay = this.animationController.getStepDelay() / difference;
  if (instantMode == "instant") {
    stepDelay = 0;
  }
    
  if ((operation[1] == smaller && reverseMode == "not reverse") ||
      (operation[1] == larger && reverseMode == "reverse")) {    
    var i = smaller;
    var swapOperation = ["insertionSwap", i,(i+1)];
    this.insertionSwap(swapOperation, stepDelay);      
    this.lastInstruction = swapOperation;
    i++;
    
    var insertTimer = setInterval(function() {
      if (i >= larger) {
        this.skipMode = false;
        this.singleStepMode = false;
        this.lastInstruction = operation.join(" ");
        clearInterval(insertTimer);
        // The next instruction that will be dealt with by the next call to animateStep
        var nextInstruction = this.animationController.currentInstruction();
        // If at the end of the algorithm, ensure singleStepMode is not left on and return
        if (nextInstruction == null) {
          this.singleStepMode = false;
          return;
        }
        // If the overall animation is playing automatically and singleStepMode is
        // not on, animate the next step, waiting a moment for the current 
        // insertion step to finish
        if (this.playMode && !this.singleStepMode) { 
          var waitTimer = setInterval(function() {
            if (!this.animating) {
              this.animateStep(nextInstruction, "not instant", reverseMode);  
              clearInterval(waitTimer);
            }
          }.bind(this), 25);
        }
        return;
      }
      if (this.skipMode) {
        setTimeout(function() {
          stepDelay = 0;
          for (var j = i; j < larger; j++) {
            var swapOperation = ["insertionSwap", j,(j+1)];
            this.insertionSwap(swapOperation, stepDelay);      
            this.lastInstruction = swapOperation;  
          }
          this.lastInstruction = operation.join(" ");          
        }.bind(this), 25);
        clearInterval(insertTimer);
        return;
      }
      
      if (!this.animating) {
        this.animating = true;
        swapOperation = ["insertionSwap", i,(i+1)];
        this.insertionSwap(swapOperation, stepDelay);      
        this.lastInstruction = swapOperation; 
        i++;
      }
    }.bind(this), 25);
  }
  else if ((operation[1] == larger && reverseMode == "not reverse") ||
            (operation[1] == smaller && reverseMode == "reverse")) {    
    i = larger;
    swapOperation = ["insertionSwap", i,(ii1)];
    this.insertionSwap(swapOperation, stepDelay);      
    this.lastInstruction = swapOperation;
    i--;
    
    insertTimer = setInterval(function() {
      if (i <= smaller) {
        this.skipMode = false;
        this.singleStepMode = false;
        this.lastInstruction = operation.join(" ");
        clearInterval(insertTimer);
        // The next instruction that will be dealt with by the next call to animateStep
        var nextInstruction = this.animationController.currentInstruction();
        // If at the end of the algorithm, ensure singleStepMode is not left on and return
        if (nextInstruction == null) {
          this.singleStepMode = false;
          return;
        }
        // If the overall animation is playing automatically and singleStepMode is
        // not on, animate the next step, waiting a moment for the current 
        // insertion step to finish
        if (this.playMode && !this.singleStepMode) { 
          var waitTimer = setInterval(function() {
            if (!this.animating) {
              this.animateStep(nextInstruction, "not instant", reverseMode);  
              clearInterval(waitTimer);
            }
          }.bind(this), 25);
        }
        return;
      }
      if (this.skipMode) {
        setTimeout(function() {
          stepDelay = 0;
          for (var j = i; j > smaller; j--) {
            var swapOperation = ["insertionSwap", j,(j-1)];
            this.insertionSwap(swapOperation, stepDelay);      
            this.lastInstruction = swapOperation;  
          }
          this.lastInstruction = operation.join(" ");          
        }.bind(this), 25);
        clearInterval(insertTimer);
        return;
      }
      
      if (!this.animating) {
        this.animating = true;
        swapOperation = ["insertionSwap", i,(i-1)];
        this.insertionSwap(swapOperation, stepDelay);      
        this.lastInstruction = swapOperation; 
        i--;
      }
    }.bind(this), 25);
  }
}

BarGraph.prototype.insertionSwap = function(operation, stepDelay) {
  // Create BarSwapper object to handle positioning of bars during the animation
  var barSwapper = new BarSwapper(this.input, operation, stepDelay);  
  
  if (stepDelay <= 0) {
    // Swap the two bars instantly both on the canvas and in the virtual representation
    barSwapper.instantSwap();
    buckets.arrays.swap(this.input,operation[1],operation[2]);
    this.animating = false;
    // Set the bar statuses back to "unsorted"
    barSwapper.setBarStatuses("unsorted");
    return;
  }
  
  var swapTimer = setInterval(function() {  
    // If skipMode has been turned on, swap the two bars immediately and return
    if (this.skipMode) {     
      // Swap the two bars instantly both on the canvas and in the virtual representation
      barSwapper.instantSwap();
      buckets.arrays.swap(this.input,operation[1],operation[2]);
      this.animating = false;
      // Set the bar statuses back to "unsorted"
      barSwapper.setBarStatuses("unsorted");
      // Clear interval and ensure singleStepMode is not left on
      clearInterval(swapTimer);
      return;
    }
    // Ensure bar statuses are set to "swapping" so draw method can highlight them
    barSwapper.setBarStatuses("swapping");
    // If the bars could not be moved any further without going beyond their index
    // positions, clear the timer, perform a virtual swap and animate the next step
    if (!barSwapper.moveBarsTowardsEachOther()) { 
      clearInterval(swapTimer); 
      // Perform virtual swap
      buckets.arrays.swap(this.input,operation[1],operation[2]);
      // Set the bar statuses back to "unsorted"
      barSwapper.setBarStatuses("unsorted");
      // The animation has ended
      this.animating = false;
    }
  }.bind(this),25);
}
