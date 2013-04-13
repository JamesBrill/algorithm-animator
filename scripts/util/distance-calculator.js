// Calculate distance between two points
function distance (x0, y0, x1, y1) {
  var distance = Math.sqrt((x0-x1)*(x0-x1)+(y0-y1)*(y0-y1));
  return distance;
}

// Calculate distance from point to line segment
function distanceFromPointToLineSegment(ax,ay,bx,by,cx,cy) {
  // r is the position that the point has along the line segment. If r is 0,
  // the point is at one end and if it is 1, it is at the other. Values less
  // than 0 or greater than 1 mean that the point does not have a 
  // perpendicular distance to the line segment.
  var r_numerator = (cx-ax)*(bx-ax) + (cy-ay)*(by-ay);
  var r_denominator = (bx-ax)*(bx-ax) + (by-ay)*(by-ay);
  var r = r_numerator / r_denominator;
  // Calculate distance from the point to the line that extends from the 
  // line segment
  var s = ((ay-cy)*(bx-ax)-(ax-cx)*(by-ay)) / r_denominator; 
  var distanceLine = Math.abs(s) * Math.sqrt(r_denominator);
  // Initialise distance between point and line segment
  var distanceSegment = 0;

  // If the point is within the line segment, return the distance to the 
  // extended line
  if ((r >= 0) && (r <= 1)) {
    distanceSegment = distanceLine;
  }
  // Otherwise, return the distance from the nearest endpoint to the point
  else {
    var dist1 = (cx-ax)*(cx-ax) + (cy-ay)*(cy-ay);
    var dist2 = (cx-bx)*(cx-bx) + (cy-by)*(cy-by);
    if (dist1 < dist2) {
      distanceSegment = Math.sqrt(dist1);
    }
    else {
      distanceSegment = Math.sqrt(dist2);
    }
  }        
  return distanceSegment;
}


