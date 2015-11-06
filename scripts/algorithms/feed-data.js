// Object containing both high-level and pseudocode descriptions of a particular
// step of an algorithm. This first constructor initialises both descriptions
// as empty strings.
FeedData = function() {
  this.highlevel = "";
  this.pseudocode = "";
}

// This constructor uses parameters to determine the initial descriptions
FeedData = function (highlevel, pseudocode) {
  this.highlevel = highlevel;
  this.pseudocode = pseudocode;  
}

// Set content of high-level description
FeedData.prototype.setHighLevel = function (newHighLevel) {
  this.highlevel = newHighLevel;
}

// Concatenate new content to existing high-level description
FeedData.prototype.concatHighLevel = function (additionalHighLevel) {
  this.highlevel += additionalHighLevel;
}

// Get high-level description
FeedData.prototype.getHighLevel = function () {
  return this.highlevel;
}

// Set content of pseudocode description
FeedData.prototype.setPseudoCode = function (newPseudoCode) {
  this.pseudocode = newPseudoCode;
}

// Concatenate new content to existing pseudocode description
FeedData.prototype.concatPseudoCode = function (additionalPseudoCode) {
  this.pseudocode += additionalPseudoCode;
}

// Get pseudocode description
FeedData.prototype.getPseudoCode = function () {
  return this.pseudocode;
}