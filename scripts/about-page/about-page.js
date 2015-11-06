// This is the code to be run when the User Guide page is initialised. As the page
// only contains text, no resizing code is yet required, though the functions are
// in place in case this functionality needs to be developed in the future.
$(document).delegate('#about-page','pageinit',function () {
  // Window dimensions
  var width = $(window).width();
  var height = $(window).height();
  
  init();
  
  // Initialise page
  function init() {    
    resizeDivs();
  }
  
  // Resize elements on page
  function resizeDivs() {}
  
  // When the window is resized, resize all elements
  $(window).resize(function() {
    // Update window size
    width = $(window).width();
    height = $(window).height();
    resizeDivs();
  })  
});


