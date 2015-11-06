// Object that can generate desired sorting input data
SortingInputGenerator = function() {}

// Generate an array of random numbers of a given size in a given range with a given ordering
SortingInputGenerator.generateRandomSortingInput = function(size, range, order) {
  // If size not in correct format, default to size of 15
  if (isNaN(size-0) || size == null || size == undefined || size == "") {
    size = 15;
  }
  
  // Ensure size is within [2, 15] range
  size = (size < 2) ? 2 : (size > 15) ? 15 : size;
  
  // Create the random array
  var randomArray = new Array();
  for (var i = 0; i < size; i++) {
    var randomNumber = Math.ceil(Math.random()*range);
    randomArray.push(new SortingInput(randomNumber));
  }
  
  // If ordering was supposed to be random, this has already been achieved, so
  // output random array 
  if (order == "random") {
    return randomArray;
  }
  
  // Apply ordering to the array and return it
  return SortingInputGenerator.orderArray(randomArray, order);
}

// Take string of numbers separated by whitespace and output array containing those numbers
SortingInputGenerator.parseInputList = function(input, order) {
  // If input empty, default to random array of size 15
  if (input == null || input == undefined || input == "") {
    return SortingInputGenerator.generateRandomSortingInput(15, 100, "random");
  }
  
  // Condense whitespace
  input = input.trim().replace(/\s+/g,' ');
  
  // Current number token being parsed (as a string literal)
  var currentNumberString = "";  
  // Array of input numbers being collected
  var inputArray = new Array();
  
  // For each input character, build number token
  for (var i = 0; i < input.length; i++) {
    var character = input.charAt(i);
    // If character is not a number, input format is illegal, so output default array
    if (isNaN(character-0)) {
      return SortingInputGenerator.generateRandomSortingInput(15, 100);
    }
    // If a space is encountered, add collected number token to input array and
    // start collecting new token
    if (character == " ") {
      inputArray.push(new SortingInput(currentNumberString-0));
      // Output first 15 numbers if 15 or more numbers are provided
      if (inputArray.length == 15) {
        return SortingInputGenerator.orderArray(inputArray, order);
      }
      currentNumberString = "";
    }
    // Add current character to current number token
    currentNumberString += character;
  }  
  
  // If last token (which would not have been collected in main loop) is
  // a number, add it to input array
  if (!isNaN(currentNumberString - 0)) {
    inputArray.push(new SortingInput(currentNumberString-0));
  }
  
  // If fewer than 2 numbers collected, output default array
  if (inputArray.length < 2) {
    return SortingInputGenerator.generateRandomSortingInput(15, 100);
  }
  
  // Apply ordering to the array and return it
  return SortingInputGenerator.orderArray(inputArray, order);
}

// Apply desired ordering to an array
SortingInputGenerator.orderArray = function(array, order) {
  // If random ordering, shuffle array
  if (order == "random") {
    SortingInputGenerator.shuffle(array);
  }
  // If reverse ordering, sort array and reverse it
  else if (order == "reverse") {
    array.sort(SortingInput.getCompareFunction()).reverse();
  }
  // If in-order ordering, sort array
  else if (order == "in-order") {
    array.sort(SortingInput.getCompareFunction());
  }
  // Return ordered array
  return array; 
}

// Shuffle array randomly
SortingInputGenerator.shuffle = function(array) {
  var j, x, i = array.length;
  // For each element in the array, swap it with an element at a random index before it
  while (i > 0) {
    // Swap element i with element at random index j that is less than or equal to i
    j = parseInt(Math.random() * i);
    x = array[--i];
    array[i] = array[j];
    array[j] = x;
  }
}

// Return copy of input array
SortingInputGenerator.copyInput = function(sortingInput) {
  return buckets.arrays.copy(sortingInput);
}


