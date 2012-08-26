function Edge (initFromNode, initToNode) {
  var fromNode = initFromNode;
  var toNode = initToNode;
  var highlighted = false;
  var value = 0;
    
  this.highlight = function () {
    highlighted = !highlighted;
  }

  this.isHighlighted = function () {
    return highlighted; 
  }
  this.getValue = function () {
    return value;
  }
  
  this.setValue = function (newValue) {
    value = newValue;
  }

  this.getFromNode = function () {
    return fromNode;
  }

  this.getToNode = function () {
    return toNode;
  }   
}

