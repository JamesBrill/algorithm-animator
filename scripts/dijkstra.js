DijkstraAnimator = function (nodes,edges,startingNode) {
  this.nodes = nodes;
  this.edges = edges;
  this.startingNode = startingNode;
  this.dijkstraStates = new Array();
  this.stateIndex = 0;
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

DijkstraAnimator.prototype.numberOfStates = function () {
  return this.dijkstraStates.length;
}

DijkstraAnimator.prototype.buildAnimation = function () {
  var Q = new buckets.PriorityQueue(compareDijkstraNodes);
  var C = new Array();
  
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
    C.push(u);
    var newDijkstraState = new DijkstraState(C.slice(0));
    this.dijkstraStates.push(newDijkstraState);
    
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

DijkstraAnimator.prototype.getCurrentState = function () {
  if (this.dijkstraStates.length == 0) {
    alert("No animation has been built.");
    return null;
  }
  return this.dijkstraStates[this.stateIndex];
}

DijkstraAnimator.prototype.nextState = function () {
  if (this.stateIndex < this.dijkstraStates.length - 1) {
    this.stateIndex++;
  }
  else {
    this.stateIndex = 0;
  }  
}

DijkstraState = function (cloudNodes) {
  this.cloudNodes = cloudNodes;  
}

DijkstraState.prototype.getCloudNodes = function () {
  return this.cloudNodes;
}




