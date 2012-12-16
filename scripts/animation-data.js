// Constructor for graph animation data, including the nodes, edges and
// starting node in the graph
AnimationData = function(nodes, edges, startingNode) {
  this.nodes = nodes;
  this.edges = edges;
  this.startingNode = startingNode;
}

// Get nodes of graph
AnimationData.prototype.getNodes = function () {
  return this.nodes;
}

// Get edges of graph
AnimationData.prototype.getEdges = function () {
  return this.edges;
}

// Get starting node of graph
AnimationData.prototype.getStartingNode = function () {
  return this.startingNode;
}

