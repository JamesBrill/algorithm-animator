function Edge (initFromNode, initToNode) {
  var fromNode = initFromNode;
  var toNode = initToNode;
  var highlighted = false;
  var weight = 0;
    
  this.highlight = function () {
    highlighted = !highlighted;
  }

  this.isHighlighted = function () {
    return highlighted; 
  }
  
  this.getWeight = function () {
    return weight;
  }
  
  this.setWeight = function (newWeight) {
    weight = newWeight;
  }

  this.getFromNode = function () {
    return fromNode;
  }

  this.getToNode = function () {
    return toNode;
  }   
}

