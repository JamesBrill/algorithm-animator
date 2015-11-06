// Initialise qtip2 tooltips
function initialiseTooltips(animationType) {
  // Graph animator tooltips
  if (animationType == "graph") {
    // Tooltip for Build Mode radio button
    $('#build').qtip({
      content: "Place nodes and edges.",
      position: {
        my: "top left",
        at: "bottom center"
      },
      style: {
        classes: 'ui-tooltip-tipsy'
      }   
    });

    // Tooltip for Run Mode radio button
    $('#run').qtip({
      content: "Animate the chosen algorithm on your data.",
      position: {
        my: "top left",
        at: "bottom center"
      },
      style: {
        classes: 'ui-tooltip-tipsy'
      }   
    });
    
    // Tooltip for pseudocode selection radio buttons
    $('.feed-tip').qtip( {
      content: {
        text: function() {
          if ($(this).attr('id') == "high-level") {
            return "Show high-level description of algorithm in text box.";
          }
          else {
            return "Show algorithm pseudocode in text box.";
          }
        }
      },
      position: {
        my: "bottom right",
        at: "top left"
      },
      style: {
        classes: 'ui-tooltip-tipsy'
      }
    });
    
    // Prompt for user to select starting node before animating Dijkstra's algorithm
    $('#graph-button-box').qtip( {
      content: "A starting node must be selected from your graph to start the animation.",
      position: {
        my: "bottom left",
        at: "top left",
        adjust: {
          x: $('#algorithm-feed-container').width() / 2
        }          
      },
      style: {
        classes: 'ui-tooltip-tipsy'
      } 
    });
    // Disable prompt initially
    $('#graph-button-box').qtip('disable');  
    
    // Tooltip for graph speed control slider
    $('#graph-slider-container').qtip( {
      content : "Slider position determines animation speed in steps per minute (spm). \n\
                 Leftmost position is 3spm. Rightmost position is 300spm.",
      position: {
        my: "bottom right",
        at: "top left"
      },
      style: {
        classes: 'ui-tooltip-tipsy'
      }        
    }); 
  }
  // Sorting animator tooltips
  else if (animationType == "sorting") {
    // Tooltip for sorting speed control slider
    $('#sorting-slider-container').qtip( {
      content : "Slider position determines animation speed in steps per minute (spm). \n\
                 Leftmost position is 30spm. Rightmost position is 1500spm.",
      position: {
        my: "bottom right",
        at: "top left"
      },
      style: {
        classes: 'ui-tooltip-tipsy'
      }        
    });   
    
    // Tooltip for algorithm view creation button
    $('#sorting-menu-button').qtip({
      content: "Create a new animation.",
      position: {
        my: "top left",
        at: "bottom center"
      },
      style: {
        classes: 'ui-tooltip-tipsy'
      }   
    });
  }
  // Trainer tooltips
  else {
    // Tooltip for training session creation button
    $('#training-menu-button').qtip({
      content: "Create a new training session.",
      position: {
        my: "top left",
        at: "bottom center"
      },
      style: {
        classes: 'ui-tooltip-tipsy'
      }   
    });  
   
    // Tooltip for comparison prediction button
    $('#compare-button').qtip({
      content: "Predict a compare step.",
      position: {
        my: "bottom left",
        at: "top center",
        adjust: {
          y: 2
        } 
      },
      style: {
        classes: 'ui-tooltip-tipsy'
      }   
    });   
    
    // Tooltip for swap prediction button
    $('#swap-button').qtip({
      content: "Predict a swap step.",
      position: {
        my: "bottom left",
        at: "top center",
        adjust: {
          y: 2
        } 
      },
      style: {
        classes: 'ui-tooltip-tipsy'
      }   
    });     
  
    // Tooltips for feedback text boxes
    $('.training-grid').qtip( {
      position: {
        my: "bottom left",
        at: "top center",
        adjust: {
          y: 2
        }
      },
      style: {
          classes: 'ui-tooltip-tipsy'
      }
    });   
  }

  // Tooltips for 'tape recorder' animation control buttons
  $('.control').qtip( {
    position: {
      my: "bottom right",
      at: "top center",
      adjust: {
        y: 2
      }
    },
    style: {
        classes: 'ui-tooltip-tipsy'
    }
  }); 
}