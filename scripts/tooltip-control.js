/*
 * Common dialogue() function that creates our dialogue qTip.
 * We'll use this method to create both our prompt and confirm dialogues
 * as they share very similar styles, but with varying content and titles.
 */
function dialogue(content, title) {
  /* 
   * Since the dialogue isn't really a tooltip as such, we'll use a dummy
   * out-of-DOM element as our target instead of an actual element like document.body
   */
  $('<div />').qtip(
  {
    content: {
      text: content,
      title: title
    },
    position: {
      my: 'center', at: 'center', // Center it...
      target: $(window) // ... in the window
    },
    show: {
      ready: true, // Show it straight away
      modal: {
        on: true, // Make it modal (darken the rest of the page)...
        blur: false // ... but don't close the tooltip when clicked
      }
    },
    hide: false, // We'll hide it maunally so disable hide events
    style: 'ui-tooltip-dialogue ui-tooltip-light', // Add a few styles
    events: {
      // Hide the tooltip when any buttons in the dialogue are clicked
      render: function(event, api) {
        $('button', api.elements.content).click(api.hide);
      },
      // Destroy the tooltip once it's hidden as we no longer need it!
      hide: function(event, api) { api.destroy(); }
    }
  });
}

// Confirm method
function confirm(question, callback)
{
  // Content will consist of the question and ok/cancel buttons
  var message = $('<p />', { text: question }),
    ok = $('<button />', { 
      text: 'OK',
      style: 'height: 40px;',
      click: function() { callback(true); }
    }),
    cancel = $('<button />', { 
      text: 'Cancel',
      style: 'height: 40px;',
      click: function() { callback(false); }
    });

  dialogue( message.add(ok).add(cancel), 'Confirm' );
}

// Initialise tooltips
function initialiseTooltips(animationType) {
  if (animationType == "graph") {
    $('#build').qtip({
      content: "Place nodes and edges.",
      position: {
        my: "top left",
        at: "bottom left",
        adjust: {
          x: 50
        }
      },
      style: {
        classes: 'ui-tooltip-tipsy'
      }   
    });

    $('#modify').qtip({
      content: "Delete objects or change node labels/edge attributes.",
      position: {
        my: "top left",
        at: "bottom left",
        adjust: {
          x: 50
        }
      },
      style: {
        classes: 'ui-tooltip-tipsy'
      }   
    });

    $('#run').qtip({
      content: "Animate the chosen algorithm on your data.",
      position: {
        my: "top left",
        at: "bottom left",
        adjust: {
          x: 50
        }
      },
      style: {
        classes: 'ui-tooltip-tipsy'
      }   
    });
    
    $('#graph-select-container').qtip( {
      content: "Choose the graph algorithm you want to animate here.",
      position: {
        my: "top left",
        at: "bottom right",
        adjust: {
          x: -20
        }
      },
      style: {
        classes: 'ui-tooltip-tipsy'
      }
    });
    
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

    $('#graph-button-box').qtip('disable');  
  }
  
  $('#sorting-select-container').qtip( {
    content: "Choose the sorting algorithm you want to animate here.",
    position: {
      my: "top left",
      at: "bottom right",
      adjust: {
        x: -20
      }
    },
    style: {
      classes: 'ui-tooltip-tipsy'
    }
  });
  
  $('.main-menu').qtip({
    content: "Return to main menu.",
    position: {
      my: "top right",
      at: "bottom right",
      adjust: {
        x: -20
      }
    },
    style: {
      classes: 'ui-tooltip-tipsy'
    }   
  });

  $('.control').qtip( {
    position: {
      my: "bottom right",
      at: "top left",
      adjust: {
        x: $('.control').width() / 2
      }
    },
    style: {
        classes: 'ui-tooltip-tipsy'
    }
  }); 
  

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
}