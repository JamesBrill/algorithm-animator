SortingInputGenerator = function() {}

SortingInputGenerator.generateRandomSortingInput = function(size, range) {
  if (size < 2) {
    size = 2;
  }
  if (size > 15) {
    size = 15;
  }  
  var randomArray = new Array();
  for (var i = 0; i < size; i++) {
    var randomNumber = Math.ceil(Math.random()*range);
    randomArray.push(new SortingInput(randomNumber));
  }
  return randomArray;
}


