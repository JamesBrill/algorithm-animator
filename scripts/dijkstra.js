/* Creates a DijkstraAnimator, an object that alters the colour of a given
 * set of nodes to represent the execution of the Dijkstra shortest path 
 * algorithm. The object also produces an information feed to show the user
 * each step of the algorithm in various forms of pseudo-code. 
 */
DijkstraAnimator = function (nodes,edges,startingNode) {
  this.nodes = nodes; // Nodes in graph to be operated on
  this.edges = edges; // Edges in graph to be operated on
  this.startingNode = startingNode; // Node from which shortest distances are calculated
  this.dijkstraStates = new Array(); // Array of all states reached during the algorithm
  this.stateIndex = 0; // Index of current state
  this.ended = false; // Has algorithm finished its last step?
}

// Comparator function to pass to Buckets priority queue implementation. 
// a is 'greater' than b if its most recent d-value is lesser.
var compareDijkstraNodes = function (a,b) {
  if (a.getAlgorithmSpecificData(Infinity) > b.getAlgorithmSpecificData(Infinity)) {
    return -1;
  }
  if (b.getAlgorithmSpecificData(Infinity) > a.getAlgorithmSpecificData(Infinity)) {
    return 1;
  }
  return 0;
}

// Run Dijkstra's shortest path algorithm to build an array of states, each state
// representing each step of the algorithm.
DijkstraAnimator.prototype.buildAnimation = function () {
  // Priority queue to store nodes. Node at the front of the queue is always the 
  // one with the smallest d-value. All nodes in the priority queue have not had
  // their shortest distance from the starting node calculated yet.
  var queue = new buckets.PriorityQueue(compareDijkstraNodes);
  // Array of nodes that are in the cloud
  var cloud = new Array();
  // Array of node that are adjacent to the cloud
  var fringe = new Array();
  
  // Initialise the d-values of all nodes. Starting node initialised to 0, 
  // all other initialised to Infinity. Nodes than added to priority queue.
  for (var i = 0; i < this.nodes.length; i++) {
    if (this.nodes[i] == this.startingNode) {
      this.nodes[i].setAlgorithmSpecificData(this.stateIndex,0);
    }
    else {
      this.nodes[i].setAlgorithmSpecificData(this.stateIndex,Infinity);
    }
    queue.enqueue(this.nodes[i]);
  }
  
  this.addNewState(cloud,fringe,null,"BEGIN\n");
  
  var name = this.startingNode.getName();
  var feedString = "Your starting node is " + name + ".\nInitialising d[" + name +
                   "] to 0.\nInitialising d[u] to " + String.fromCharCode(8734) +
                   " for all other nodes u.\n";
  this.addNewState(cloud,fringe,null, feedString);               
                 
  
  // While the priority queue still contains nodes...
  while (!queue.isEmpty()) {
    // Remove node with smallest d-value and add it to the cloud
    var newCloudNode = queue.dequeue();
    cloud.push(newCloudNode);
    
    // Remove the new cloud node from the fringe. If it is the starting node, it
    // will never be in the fringe, so will not need to be removed from it.
    if (newCloudNode != this.startingNode) {
      var index = fringe.indexOf(newCloudNode);
      fringe.splice(index,1);
    }
    
    // Add a new state that represents the current step of the algorithm
    name = newCloudNode.getName();
    feedString = "  Remove " + name + " from Q.\n  " + name + " was the node outside " +
                 "the cloud with the lowest d-label.\n"
    this.addNewState(cloud,fringe,newCloudNode, feedString);
    
    // Build an array of all nodes that are adjacent to the new cloud node and 
    // outside the cloud. In this array, nodes are paired with the weight of the
    // edge that connects them to the new cloud node to save later computation.
    var adjacentUnvisitedNodes = new Array();
    // For each edge...
    for (i = 0; i < this.edges.length; i++) {
      // If edge connects the new cloud node to a node outside the cloud, 
      // collect the adjacent node and the weight of the connecting edge.
      if ((this.edges[i].getToNode() == newCloudNode && $.inArray(this.edges[i].getFromNode(), cloud) == -1)) {
        adjacentUnvisitedNodes.push({adjacentNode: this.edges[i].getFromNode(),
                                        weight: this.edges[i].getWeight()});
      }
      else if (this.edges[i].getFromNode() == newCloudNode && $.inArray(this.edges[i].getToNode(), cloud) == -1) {
        adjacentUnvisitedNodes.push({adjacentNode: this.edges[i].getToNode(),
                                        weight: this.edges[i].getWeight()});
      }
    }
    
    var noAdjacentNodes = true;
    
    // For each unvisited node adjacent to the new cloud node... 
    for (i = 0; i < adjacentUnvisitedNodes.length; i++) {
      // Adjacent node
      var adjacentNode = adjacentUnvisitedNodes[i].adjacentNode;
      // The d-value of the new cloud node
      var cloudNodeDValue = newCloudNode.getAlgorithmSpecificData(this.stateIndex);
      // The d-value of the adjacent node
      var adjacentNodeDValue = adjacentNode.getAlgorithmSpecificData(this.stateIndex);
      // Weight of the edge connecting them
      var weight = adjacentUnvisitedNodes[i].weight;
      
      noAdjacentNodes = false;
      
      var adjacentName = adjacentNode.getName();
      
      // If adjacent node is not yet in the fringe, add it to the fringe
      // before adding a new state to represent this step in the algorithm.
      if ($.inArray(adjacentNode, fringe) == -1) {
        fringe.push(adjacentNode);
      }
      
      feedString = "    " + adjacentName + " is adjacent to " + name + " and outside the cloud.\n"
      this.addNewState(cloud,fringe,newCloudNode, feedString);
      
      feedString = "    Is d[" + name + "] + weight(" + name + "," + adjacentName + ") < d[" +
                     adjacentName + "]?\n";             
      
      // Perform 'edge relaxation' to update d-value of adjacent node. The node is 
      // also repositioned in the priority queue to accommodate this adjustment.
      if (cloudNodeDValue + weight < adjacentNodeDValue) {
        adjacentNode.setAlgorithmSpecificData(this.stateIndex,cloudNodeDValue + weight);
        queue.updateItem(adjacentNode);
        feedString += "      Yes. Update the value of d[" + adjacentName + "] to equal " +
          "d[" + name + "] + weight(" + name + "," + adjacentName + ").\n      Change d[" +
          adjacentName + "] from " + adjacentNodeDValue + " to " + (cloudNodeDValue + weight) + ".\n";
      }
      else {
        feedString += "      No.\n";
      }
      this.addNewState(cloud,fringe,newCloudNode, feedString); 
    }
    
    if (noAdjacentNodes) {
      feedString = "  " + name + " has no adjacent nodes that are not in the cloud.\n";
      this.addNewState(cloud,fringe,newCloudNode, feedString); 
    }
  }
  
  this.addNewState(cloud,fringe,newCloudNode, "END"); 
  
  // Reset state index so that algorithm can be animated from the beginning
  this.stateIndex = -1;
}

// Add a new state to represent the current step of the algorithm
DijkstraAnimator.prototype.addNewState = function (cloud, fringe, newCloudNode, feedData) {
  var newDijkstraState = new DijkstraState(cloud.slice(0),fringe.slice(0),newCloudNode,feedData);
  this.dijkstraStates.push(newDijkstraState);
  this.stateIndex++;
}

// Get the current state of the algorithm
DijkstraAnimator.prototype.getCurrentState = function () {
  if (this.dijkstraStates.length == 0) {
    alert("No animation has been built.");
    return null;
  }
  return this.dijkstraStates[Math.max(this.stateIndex,0)];
}

// Move to the next state of the algorithm and update nodes where appropriate
DijkstraAnimator.prototype.nextState = function () {
  if (this.stateIndex == this.dijkstraStates.length - 1) {
    this.ended = true;
  }

  // Increment current state index
  if (this.stateIndex < this.dijkstraStates.length - 1) {
    this.stateIndex++;
    // Update nodes to represent the next state of Djkstra's algorithm
    if (this.stateIndex != -1) {
      this.updateNodes();
    }
  }
}

// Move to the previous state of the algorithm and update nodes where appropriate
DijkstraAnimator.prototype.prevState = function () {
  // Decrement current state index
  if (this.stateIndex > 0) {
    this.stateIndex--;
    // Update nodes to represent the next state of Djkstra's algorithm
    if (this.stateIndex != -1) {
      this.updateNodes();
    }
  }
  
  this.ended = false;
}

DijkstraAnimator.prototype.goToBeginning = function () {
  this.stateIndex = 0;
  this.ended = false;
  this.updateNodes();
}

DijkstraAnimator.prototype.goToEnd = function () {
  this.stateIndex = this.dijkstraStates.length - 1;
  this.updateNodes();
}

DijkstraAnimator.prototype.atEnd = function () {
  return this.ended;
}

// Updates the colour and label of all nodes to represent the next 
// state of Djkstra's algorithm.
DijkstraAnimator.prototype.updateNodes = function () {
  // For each node...
  for (var i = 0; i < this.nodes.length; i++) {
    // Node's name
    var nodeName = this.nodes[i].getName();
    // Node's d-value
    var nodeAlgorithmData = this.nodes[i].getAlgorithmSpecificData(this.stateIndex);
    // Use infinity symbol if d-value is Infinity
    if (nodeAlgorithmData == Infinity) {
      nodeAlgorithmData = String.fromCharCode(8734);
    }
    // Update node's label
    this.nodes[i].setLabel(nodeName + " [" + nodeAlgorithmData + "]");
  }  
}

// Draws a given node to the canvas
DijkstraAnimator.prototype.drawNode = function (node, context) {
  // Current state that the algorithm has reached
  var state = this.dijkstraStates[Math.max(this.stateIndex,0)];
  
  // Radius of node
  var radius = node.getRadius();
  // Coordinates of node
  var x = node.getX();
  var y = node.getY();
  
  // Colour node according to its type
  this.determineFillStyle(state, node, context);
  
  // Draw node
  context.arc(x,y,radius,0,Math.PI*2,false);
  context.fill();
  
  // If node is starting node, give it a dark blue ring
  if (node == this.startingNode) {
    context.strokeStyle = "#00008B"; 
    this.stroke(radius, context, x, y);
  }
  
  // If node is new cloud node, give it a green ring
  if (state.nodeType(node) == "current") {
    context.strokeStyle = "#008000"; 
    this.stroke(radius, context, x, y);
  }
}

// Set fill style of given canvas context according to current state/node
DijkstraAnimator.prototype.determineFillStyle = function (state, node, context) {
  // If node is in cloud or the current node, it is light blue
  if (state.nodeType(node) == "cloud" || state.nodeType(node) == "current") {
    context.fillStyle = "#ADD8E6";
  }
  
  // If node is in fringe, it is yellow
  if (state.nodeType(node) == "fringe") {
    context.fillStyle = "#FFFF00";
  }
}

// Draw ring around node
DijkstraAnimator.prototype.stroke = function (radius, context, x, y) {
  for (var i = 0; i < 3; i++) {
    context.arc(x,y,radius-i,0,Math.PI*2,false);
  }
  context.stroke();
}

/* Creates a DijkstraState, which represents a step of Dijkstra's shortest
 * path algorithm. Each one keeps track of which nodes are in the cloud,
 * which ones are in the fringe and which node has just been added to the
 * cloud. 
 */
DijkstraState = function (cloudNodes, fringeNodes, currentNode, feedData) {
  this.cloudNodes = cloudNodes;  
  this.fringeNodes = fringeNodes;
  this.currentNode = currentNode;
  this.feedData = feedData;
}

DijkstraState.prototype.getFeedData = function () {
  return this.feedData;
}

// Returns the type of a given node when this state was reached
DijkstraState.prototype.nodeType = function (node) {
  if (this.currentNode != null && node == this.currentNode) {
    return "current";
  }
  if (this.cloudNodes != null && $.inArray(node, this.cloudNodes) != -1) {
    return "cloud";
  }
  if (this.fringeNodes != null && $.inArray(node, this.fringeNodes) != -1) {
    return "fringe";
  }
  return "unvisited";  
}





