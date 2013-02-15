// Object that can generate desired sorting input data
SortingInputGenerator = function() {}

// Generate an array of random numbers of a given size in a given range
SortingInputGenerator.generateRandomSortingInput = function(size, range, order) {
  if (isNaN(size-0) || size == null || size == undefined || size == "") {
    size = 15;
  }
  size = (size < 2) ? 2 : (size > 15) ? 15 : size;
  var randomArray = new Array();
  for (var i = 0; i < size; i++) {
    var randomNumber = Math.ceil(Math.random()*range);
    randomArray.push(new SortingInput(randomNumber));
  }
  return SortingInputGenerator.orderArray(randomArray, order);
}

// Take string of numbers separated by whitespace and output array containing those numbers
SortingInputGenerator.parseInputList = function(input, order) {
  if (input == null || input == undefined || input == "") {
    return SortingInputGenerator.generateRandomSortingInput(15, 100);
  }
  
  input = input.trim().replace(/\s+/g,' ');
  
  var currentNumberString = "";
  var inputArray = new Array();
  for (var i = 0; i < input.length; i++) {
    var character = input.charAt(i);
    if (isNaN(character-0)) {
      return SortingInputGenerator.generateRandomSortingInput(15, 100);
    }
    if (character == " ") {
      inputArray.push(new SortingInput(currentNumberString-0));
      if (inputArray.length == 15) {
        return SortingInputGenerator.orderArray(inputArray, order);
      }
      currentNumberString = "";
    }
    currentNumberString += character;
  }  
  if (!isNaN(currentNumberString - 0)) {
    inputArray.push(new SortingInput(currentNumberString-0));
  }
  if (inputArray.length < 2) {
    return SortingInputGenerator.generateRandomSortingInput(15, 100);
  }
  return SortingInputGenerator.orderArray(inputArray, order);
}

SortingInputGenerator.orderArray = function(array, order) {
  if (order == "random") {
    SortingInputGenerator.shuffle(array);
  }
  else if (order == "reverse") {
    array.sort(SortingInput.getCompareFunction()).reverse();
  }
  else if (order == "in-order") {
    array.sort(SortingInput.getCompareFunction());
  }
  return array; 
}

SortingInputGenerator.shuffle = function(array) {
  var j, x, i = array.length;
  while (i) {
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


