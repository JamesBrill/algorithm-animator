$(document).delegate('#home','pageinit',function () {
  var width = $(window).width();
  var height = $(window).height();
  
  init();
  
  function init() {    
    resizeDivs();
  }
  
  function resizeDivs() {
    $('#banner').css('width', 0.8 * width);
    $('#banner').css('height', (1/6) * $('#banner').width());
    $('#banner-container').css('height', $('#banner').height());    
  }
  
  // When the window is resized, resize all elements
  $(window).resize(function() {
    // Update window size
    width = $(window).width();
    height = $(window).height();
    resizeDivs();
  })  
});

