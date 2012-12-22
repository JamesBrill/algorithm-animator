SortingInputGenerator = function() {}

SortingInputGenerator.generateRandomSortingInput = function(size, range) {
  size = (size < 2) ? 2 : (size > 15) ? 15 : size;
  var randomArray = new Array();
  for (var i = 0; i < size; i++) {
    var randomNumber = Math.ceil(Math.random()*range);
    randomArray.push(new SortingInput(randomNumber));
  }
  return randomArray;
}


