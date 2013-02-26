// Factory class for animator objects
AnimatorFactory = function() {}

// Given an AnimationData object that contains all data to be used by the
// animator and the type of animator, return a suitable animator object
AnimatorFactory.getAnimator = function (animationData, animatorType) {
  if (animatorType == "dijkstra") {
    return new DijkstraAnimator(animationData);
  }
  else if (animatorType == "bubble") {
    return new BubbleSortAnimator(animationData);
  }
  else if (animatorType == "selection") {
    return new SelectionSortAnimator(animationData);
  }
  else {
    return new InsertionSortAnimator(animationData);  
  }
  return null;
}

