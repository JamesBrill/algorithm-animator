DijkstraAnimator = function (nodes,edges,startingNode) {
  this.nodes = nodes;
  this.edges = edges;
  this.startingNode = startingNode;
  this.dijkstraStates = new Array();
  this.stateIndex = 0;
}

var compareDijkstraNodes = function (a,b) {
  if (a.getAlgorithmSpecificData(Infinity) > b.getAlgorithmSpecificData(Infinity)) {
    return -1;
  }
  if (b.getAlgorithmSpecificData(Infinity) > a.getAlgorithmSpecificData(Infinity)) {
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
  var stateCounter = 0;
  var tentativeNodes = new Array();
  
  for (var i = 0; i < this.nodes.length; i++) {
    if (this.nodes[i] == this.startingNode) {
      this.nodes[i].setAlgorithmSpecificData(stateCounter,0);
    }
    else {
      this.nodes[i].setAlgorithmSpecificData(stateCounter,Infinity);
    }
    Q.enqueue(this.nodes[i]);
  }
  
  while (!Q.isEmpty()) {
    var u = Q.dequeue();
    C.push(u);
    
    if (u != this.startingNode) {
      var index = tentativeNodes.indexOf(u);
      tentativeNodes.splice(index,1);
    }
    var newDijkstraState = new DijkstraState(C.slice(0),tentativeNodes.slice(0),u);
    this.dijkstraStates.push(newDijkstraState);
    stateCounter++;
    
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
      var dValueOfU = u.getAlgorithmSpecificData(stateCounter);
      var dValueOfZ = adjacentNodesOutsideCloud[i].adjacentNode.getAlgorithmSpecificData(stateCounter);
      var weight = adjacentNodesOutsideCloud[i].weight;
      if (dValueOfU + weight < dValueOfZ) {
        adjacentNodesOutsideCloud[i].adjacentNode.setAlgorithmSpecificData(stateCounter,dValueOfU + weight);
        Q.updateItem(adjacentNodesOutsideCloud[i].adjacentNode);
      }
      
      if ($.inArray(adjacentNodesOutsideCloud[i].adjacentNode, tentativeNodes) == -1 &&
          $.inArray(adjacentNodesOutsideCloud[i].adjacentNode, C) == -1) {
        tentativeNodes.push(adjacentNodesOutsideCloud[i].adjacentNode);
        newDijkstraState = new DijkstraState(C.slice(0),tentativeNodes.slice(0),u);
        this.dijkstraStates.push(newDijkstraState);
        stateCounter++;
      }
    }
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
  
  for (var i = 0; i < this.nodes.length; i++) {
    var nodeName = this.nodes[i].getName();
    var nodeAlgorithmData = this.nodes[i].getAlgorithmSpecificData(this.stateIndex);
    if (nodeAlgorithmData == Infinity) {
      nodeAlgorithmData = String.fromCharCode(8734);
    }
    this.nodes[i].setLabel(nodeName + " [" + nodeAlgorithmData + "]");
  }
}

DijkstraAnimator.prototype.drawNode = function (node, context) {
  var state = this.dijkstraStates[this.stateIndex];
  var radius = node.getRadius();
  var x = node.getX();
  var y = node.getY();
  
  context.fillStyle = "#000000";
  
  if (state.nodeType(node) == "cloud" || state.nodeType(node) == "current") {
    context.fillStyle = "#ADD8E6";
  }
  if (state.nodeType(node) == "tentative") {
    context.fillStyle = "#FFFF00";
  }
  
  context.arc(x,y,radius,0,Math.PI*2,false);
  context.fill();
  
  if (node == this.startingNode) {
    context.strokeStyle = "#00008B";
    for (var i = 0; i < 3; i++) {
      context.arc(x,y,radius-i,0,Math.PI*2,false);
    }
    context.stroke(); 
  }
  if (state.nodeType(node) == "current") {
    context.strokeStyle = "#008000";
    for (var i = 0; i < 3; i++) {
      context.arc(x,y,radius-i,0,Math.PI*2,false);
    }
    context.stroke();     
  }
}

DijkstraState = function (cloudNodes, tentativeNodes, currentNode) {
  this.cloudNodes = cloudNodes;  
  this.tentativeNodes = tentativeNodes;
  this.currentNode = currentNode;
}

DijkstraState.prototype.nodeType = function (node) {
  if (this.currentNode != null && node == this.currentNode) {
    return "current";
  }
  if (this.cloudNodes != null && $.inArray(node, this.cloudNodes) != -1) {
    return "cloud";
  }
  if (this.tentativeNodes != null && $.inArray(node, this.tentativeNodes) != -1) {
    return "tentative";
  }
  return "unvisited";  
}





