// Object that can generate desired sorting input data
SortingInputGenerator = function() {}

// Generate an array of random numbers of a given size in a given range
SortingInputGenerator.generateRandomSortingInput = function(size, range) {
  size = (size < 2) ? 2 : (size > 15) ? 15 : size;
  var randomArray = new Array();
  for (var i = 0; i < size; i++) {
    var randomNumber = Math.ceil(Math.random()*range);
    randomArray.push(new SortingInput(randomNumber));
  }
  return randomArray;
}

// Return copy of input array
SortingInputGenerator.copyInput = function(sortingInput) {
  return buckets.arrays.copy(sortingInput);
}


