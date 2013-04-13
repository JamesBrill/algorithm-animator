// This is the code to be run when the Main Menu page is initialised. 
$(document).delegate('#home','pageinit',function () {
  var width = $(window).width(); // Window width
    
  // Set CSS for banner      
  resizeDivs();
  
  // Set CSS for banner  
  function resizeDivs() {
    $('#banner').css('width', 0.8 * width);
    $('#banner').css('height', (1/6) * $('#banner').width());
    $('#banner-container').css('height', $('#banner').height());    
  }
  
  // When the window is resized, resize all elements
  $(window).resize(function() {
    // Update window size
    width = $(window).width();
    resizeDivs();
  })  
});

