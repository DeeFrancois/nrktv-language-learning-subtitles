//Life Before Death, Strength Before Weakness, Journey Before Destination



// Pull existing Settings OR Set default values
chrome.storage.sync.get('font_multiplier',function(data){
  if(data.font_multiplier!=null){
    //console.log("Preferences: Font_multiplier found: "); //For debugging but gonna comment it out for now 
  }
  else{
    //console.log("No Font Multiplier stored");
    chrome.storage.sync.set({'font_multiplier':1});
    
  }
});

chrome.storage.sync.get('left_or_right', function(data){
  if(data.left_or_right!=null){
    //console.log("Preferences: English Side Found - : " + data.left_or_right);
  }
  else{
    //console.log("No Side Preference Found - Setting RIGHT");
    chrome.storage.sync.set({'left_or_right':0}); //Original Text on RIGHT Side
  }
  
});

chrome.storage.sync.get('text_color', function(data){
  if(data.text_color){
    //console.log("Preferences: Text Color : " + data.text_color);
  }
  else{
    //console.log("No Color Preference Found - Setting YELLOW");
    chrome.storage.sync.set({'text_color': '#FFFF00'});
  }
})

chrome.storage.sync.get('opacity', function(data){
  if(data.opacity){
    //console.log("Preferences: Opacity : " + data.text_color);
  }
  else{
    //console.log("No Opacity Preference Found - Setting to 1");
    chrome.storage.sync.set({'opacity': 1});
  }
})


// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
    // Send a message to the active tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      var activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_browser_action"});
    });
  });
  

//Handles Messages sent to Background.js, typically for changing User Preference variables
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {

      if( request.message === "update_font_multiplier" ) //Recieved message from SLIDER to update FONT MULTIPLIER to REQUEST.VALUE
      {

        chrome.storage.sync.set({'font_multiplier':parseFloat(request.value)});           //Store into local variables
        
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs){ //Pass message onto Content.js for live setting update
          chrome.tabs.sendMessage(tabs[0].id, {
            "message":"update_font_multiplier",
            "value":request.value});
        });


      }

      if(request.message === "update_text_color")
      {

        chrome.storage.sync.set({'text_color':request.value});
        
        chrome.tabs.query({active:true, currentWindow:true}, function(tabs){
          chrome.tabs.sendMessage(tabs[0].id, {
            "message":"update_text_color",
            "value":request.value}); 
        });
      }

      if(request.message === "update_text_side")
      {

        chrome.storage.sync.set({'left_or_right':request.value});

        chrome.tabs.query({active:true, currentWindow:true}, function(tabs){
          chrome.tabs.sendMessage(tabs[0].id, {
            "message": "update_text_side", 
            "value": request.value});
        });

      }

      if(request.message === "update_opacity")
      {

        chrome.storage.sync.set({'opacity': request.value});

        chrome.tabs.query({active:true, currentWindow:true}, function(tabs){
          chrome.tabs.sendMessage(tabs[0].id, {
            "message": "update_opacity",
            "value": request.value});
          });
        
      }

    });
