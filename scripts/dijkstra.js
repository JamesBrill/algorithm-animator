DijkstraAnimator = function (nodes,edges,startingNode) {
  this.nodes = nodes;
  this.edges = edges;
  this.startingNode = startingNode;
}

var compareDijkstraNodes = function (a,b) {
  if (a.getAlgorithmSpecificData() > b.getAlgorithmSpecificData()) {
    return -1;
  }
  if (b.getAlgorithmSpecificData() > a.getAlgorithmSpecificData()) {
    return 1;
  }
  return 0;
}

DijkstraAnimator.prototype.showShortestDistances = function () {
  var Q = new buckets.PriorityQueue(compareDijkstraNodes);
  for (var i = 0; i < this.nodes.length; i++) {
    if (this.nodes[i] == this.startingNode) {
      this.nodes[i].setAlgorithmSpecificData(0);
    }
    else {
      this.nodes[i].setAlgorithmSpecificData(Infinity);
    }
    Q.enqueue(this.nodes[i]);
  }
  
  while (!Q.isEmpty()) {
    var u = Q.dequeue();
    var adjacentNodesOutsideCloud = new Array();
    for (i = 0; i < this.edges.length; i++) {
      if ((this.edges[i].getToNode() == u && Q.contains(this.edges[i].getFromNode()))) {
        adjacentNodesOutsideCloud.push({adjacentNode: this.edges[i].getFromNode(),
                                        weight: this.edges[i].getWeight()});
      }
      else if (this.edges[i].getFromNode() == u && Q.contains(this.edges[i].getToNode())) {
        adjacentNodesOutsideCloud.push({adjacentNode: this.edges[i].getToNode(),
                                        weight: this.edges[i].getWeight()});
      }
    }
    for (i = 0; i < adjacentNodesOutsideCloud.length; i++) {
      var dValueOfU = u.getAlgorithmSpecificData();
      var dValueOfZ = adjacentNodesOutsideCloud[i].adjacentNode.getAlgorithmSpecificData();
      var weight = adjacentNodesOutsideCloud[i].weight;
      if (dValueOfU + weight < dValueOfZ) {
        adjacentNodesOutsideCloud[i].adjacentNode.setAlgorithmSpecificData(dValueOfU + weight);
        Q.updateItem(adjacentNodesOutsideCloud[i].adjacentNode);
      }
    }
  }
  
  for (i = 0; i < this.nodes.length; i++) {
    this.nodes[i].setLabel(this.nodes[i].getAlgorithmSpecificData());
  }
}




