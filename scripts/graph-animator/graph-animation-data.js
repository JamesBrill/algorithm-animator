// Constructor for graph animation data, including the nodes, edges and
// starting node in the graph
GraphAnimationData = function(nodes, edges, startingNode) {
  this.nodes = nodes;
  this.edges = edges;
  this.startingNode = startingNode;
}

// Get nodes of graph
GraphAnimationData.prototype.getNodes = function() {
  return this.nodes;
}

// Get edges of graph
GraphAnimationData.prototype.getEdges = function() {
  return this.edges;
}

// Get starting node of graph
GraphAnimationData.prototype.getStartingNode = function() {
  return this.startingNode;
}

