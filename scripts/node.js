function Node (initX, initY, initRadius, nodeNumber) {
  var x = initX;
  var y = initY;
  var highlighted = false;
  var radius = initRadius;
  var name = "N" + nodeNumber;
  var label = name;
  var algorithmSpecificData = new Array();
  
  this.resetAlgorithmSpecificData = function () {
    algorithmSpecificData = new Array();
  }
  
  this.getAlgorithmSpecificData = function (index) {
    if (index < 0)  {
      alert ("Index out of bounds.");
      return null;
    }    
    else if (index > algorithmSpecificData.length - 1) {
      return algorithmSpecificData[algorithmSpecificData.length - 1];
    }
    return algorithmSpecificData[index];
  }
  
  this.setAlgorithmSpecificData = function (index,newAlgorithmSpecificData) {    
    if (index > algorithmSpecificData.length - 1) {
      var lastValue = algorithmSpecificData[algorithmSpecificData.length - 1];
      var numberOfPushes = index - (algorithmSpecificData.length - 1);
      for (var i = 0; i < numberOfPushes - 1; i++) {
        algorithmSpecificData.push(lastValue);
      }
      algorithmSpecificData.push(newAlgorithmSpecificData);
    }  
    else {
      algorithmSpecificData[index] = newAlgorithmSpecificData;
    }
  }
  
  this.getLabel = function () {
    return label;
  }
  
  this.setLabel = function (newLabel) {
    label = newLabel;  
  }
  
  this.getName = function () {
    return name;
  }
  
  this.setName = function (newName) {
    name = newName;
    label = newName;
  }
  
  this.getRadius = function () {
    return radius;
  }
  
  this.setRadius = function (newRadius) {
    radius = newRadius;
  }

  this.getX = function () {
    return x;
  }

  this.setX = function (newX) {
    x = newX;
  }

  this.getY = function () {
    return y;
  }

  this.setY = function (newY) {
    y = newY; 
  }
  
  this.highlight = function () {
    highlighted = !highlighted;
  }

  this.isHighlighted = function () {
    return highlighted; 
  }
}  


