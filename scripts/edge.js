// Object representing an edge in a graph. Is initialised using two parameters,
// a 'from node' and a 'to node'. Also keeps track of edge weight and whether
// the edge is highlighted or not.
Edge = function (fromNode, toNode) {
  this.fromNode = fromNode;
  this.toNode = toNode;
  this.highlighted = false;
  this.weight = 0;
}
    
// Change highlight status of edge
Edge.prototype.highlight = function () {
  this.highlighted = !this.highlighted;
}

// Is edge highlighted?
Edge.prototype.isHighlighted = function () {
  return this.highlighted; 
}
  
// Get edge's weight
Edge.prototype.getWeight = function () {
  return this.weight;
}
  
// Set edge's weight  
Edge.prototype.setWeight = function (newWeight) {
  this.weight = newWeight;
}

// Get 'from node'
Edge.prototype.getFromNode = function () {
  return this.fromNode;
}

// Get 'to node'
Edge.prototype.getToNode = function () {
  return this.toNode;
}  

