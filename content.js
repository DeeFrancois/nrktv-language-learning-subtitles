
//console.log("New page!.. Waiting for captions");

function waitForElement(selector) { //Using this to wait for the player to appear
    return new Promise(function(resolve, reject) {
      var element = document.querySelector(selector);
  
      if(element) {
        resolve(element);
        return;
      }

      var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          var nodes = Array.from(mutation.addedNodes);
          for(var node of nodes) {
            if(node.matches && node.matches(selector)) {
              observer.disconnect();
              resolve(node);
              return;
            }
          };
        });
      });
  
      observer.observe(document.documentElement, { childList: true, subtree: true });
    });
}
function getSetting(setting){ //Pulling Settings from storage into global variables
    var value;
    chrome.storage.sync.get(setting,function(data){
        
        if (setting ==="on_off"){
            window.on_off = data[setting];
            if(!window.on_off){
             
                document.getElementsByName("llsubsb2")[0].style.display='none';
                document.getElementsByName("llsubsb1")[0].style.display='none';

            }
            else{

                document.getElementsByName("llsubsb2")[0].style.display='block';
                document.getElementsByName("llsubsb1")[0].style.display='block';

            }
        }
        
        else if (setting === "font_multiplier"){

            window.current_multiplier = parseFloat(data[setting]);
            window.current_size = window.baseFont*window.current_multiplier+'px';

        }
        else if (setting === "left_or_right"){

            window.left_or_right = data[setting];

        }
        else if (setting === "text_color"){

            window.text_color = data[setting];
            document.getElementsByName("llsubsb2")[0].firstElementChild.firstElementChild.setAttribute('stroke',window.text_color); //Changes Button Colors
            document.getElementsByName("llsubsb1")[0].firstElementChild.firstElementChild.setAttribute('stroke',window.text_color);

        }
        else if (setting === "opacity"){

            window.opacity = data[setting];

        }
        else{
            //console.log("Setting: ", setting, " Does Not Exist");
        }

    });
}
waitForElement("div.ludo-captions").then(function(element) {
    //console.log("NRKTV Player Detected! Activating Google Translate..", element);

    var fs = $("div.ludo-captions").css('font-size');
    window.baseFont = parseFloat(fs.replace('px','')); //Font change is relatively so we need a base side before applying multiplier

    //Pull stored settings into variables 
    getSetting('font_multiplier');
    getSetting('left_or_right');
    getSetting('text_color');
    getSetting('opacity');
    getSetting('on_off');

    llsubs(); //Run Main Script

    // BUTTON CREATION //

    //NRK Button Example
    //<button data-ludo-overflow="11" type="button" name="ffw15" class="ludo-bar__button ludo--desktop--delay-hide-after-click" 
    //aria-label="Fram 15 sek"><svg viewBox="0 0 24 24" class="nrk-media-ffw-15sec" width="1.500em" height="1.500em" aria-hidden="true" 
    //focusable="false"><path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" 
    //d="m 20 50 l 60 0 M 50 20 l 0 60 M 10 50 a 1 1 0 0 0 80 0 M 10 50 a 1 1 0 0 1 80 0"></path></svg></button>

    const button_row = document.getElementsByClassName("ludo-bar__col")[0];
    
    //Decrease Font Size Button 
    $("<button data-ludo-overflow='11' type='button' name='llsubsb1' class='ludo-bar__button ludo--desktop--delay-hide-after-click' \
    aria-label='Increase font size'><svg viewBox='0 0 24 24' class='llsubsb2' width='1.500em' height='1.500em' aria-hidden='true' focusable='false'>\
    <path fill='none' d='m 6.8 12 l 10.4 0 M 2.4 12 a 1 1 0 0 1 19.2 0 a 1 1 1 0 1 -19.2 0' stroke='white' stroke-width='2'></path></svg></button>").appendTo(button_row);
    
    //Increase Font Size Button
    $("<button data-ludo-overflow='11' type='button' name='llsubsb2' class='ludo-bar__button ludo--desktop--delay-hide-after-click' \
    aria-label='Increase font size'><svg viewBox='0 0 24 24' class='llsubsb1' width='1.500em' height='1.500em' aria-hidden='true' focusable='false'>\
    <path fill='none' d='m 6.8 12 l 10.2 0 M 12 6.8 l 0 10.2 M 2.4 12 a 1 1 0 0 1 19.2 0 a 1 1 1 0 1 -19.2 0' stroke='white' stroke-width='2'></path></svg></button>").appendTo(button_row);
    
    //Listeners for button clicks
    var increase_font_size_button = document.getElementsByName("llsubsb2")[0];
    increase_font_size_button.addEventListener("click", function() {
        
        window.current_multiplier+=.05;
        //Save Setting here
        chrome.storage.sync.set({"font_multiplier":window.current_multiplier.toFixed(2)}); //Save setting into storage on Change
        window.current_size=window.baseFont*window.current_multiplier+'px';
        update_style('font_size'); //Live Update the setting change

    });

    var decrease_font_size_button = document.getElementsByName("llsubsb1")[0];
    decrease_font_size_button.addEventListener("click", function(){

        window.current_multiplier-=.05;
        chrome.storage.sync.set({"font_multiplier":window.current_multiplier.toFixed(2)});
        window.current_size=window.baseFont*window.current_multiplier+'px';
        update_style('font_size');

    });
    
});

function llsubs(){
    var id = "ludo-captions";
    var slider = document.getElementById("myFontSize");

    window.old_text = ["",""];
    const ludo_captions = document.getElementsByClassName(id)[0];
    //Press browser action to start observer
    window.config = { attributes: true, childList: true, subtree:true};

    const callback = function(mutationsList, observer){ //Observer detects every change in element
        for (const mutation of mutationsList){
            if (mutation.type === 'childList' && mutation.previousSibling === null && mutation.target.className && mutation.target.className==="ludo-captions") { //Found out I could do the mutation.target === stuff really late so some of the checks in add_subs could be redundant

                this.disconnect(); //Disconnect observer before making change myself otherwise it loops infinitely and breaks browser..
                addSubs(ludo_captions);
            }

        }
    };

    window.observer = new MutationObserver(callback);

    window.observer.observe(ludo_captions,window.config);
}

const addSubs = function(caption_row){

    if(caption_row.firstChild!=null && window.on_off){ // Ensures Subs were added rather than removed

        const child_count = caption_row.childElementCount; // Get row count
        var children = caption_row.childNodes; //Get the subtitle rows

        for (var i = 0; i < child_count; i++)
        {

        var insertion_point = children[i]; //Get insertion Point
        var current_span = children[i].firstChild;
        var current_text = current_span.innerHTML; //Getting actual text to make sure there aren't duplicates

        if(window.old_text[i]===current_text){ //Skip if duplicate
            if(child_count===1){ //having 1 row means the other one is removed which means we can clear part of old_text for the same reason as in 157
                window.old_text[1]="";
            }
            continue;
        }
        else{
            window.old_text[i]=current_text;
        }

        //Modifying Subtitle Row
        var new_span = current_span.cloneNode(true);
        current_span.setAttribute('style',`font-size: ${window.current_size};padding-left: 2%; color: ${window.text_color};opacity: ${window.opacity}; background: rgba(0,0,0,0.66);border-radius: 0.15em;line-height: 1.4;display: inline-block;padding: 0 0.3em;margin: 0.05em 0;`);
        new_span.setAttribute('class','notranslate');
        new_span.setAttribute('style',`font-size: ${window.current_size};padding-left: 2%; color: white;background: rgba(0,0,0,0.66);border-radius: 0.15em;line-height: 1.4;display: inline-block;padding: 0 0.3em;margin: 0.05em 0;`);
        caption_row.style.paddingLeft='2%';

            if(parseInt(window.left_or_right)===1){ //Place Text on RIGHT side
                insertion_point.append(new_span);
                
            }
            else{ //Otherwise Place text on LEFT side
                insertion_point.prepend(new_span);
            }

        }
        window.new_subs=0;
        //Finish Modifying Subtitle Row
        
    }
    else{
        window.old_text=["",""]; //clear old_text since subtitle row was removed, otherwise this would not work when someone repeats something
        
    }

    window.observer.observe(caption_row,window.config);
}

function update_style(setting){ //This just applies stored values to current onscreen subtitles
    //for reference: default style="font-size: 0.898472rem; bottom: 5%; padding-left: 2%;color:yellow"
    
    const lines = document.getElementsByClassName("ludo-captions__line");

    if (setting === "on_off"){
        for (var i = 0; i<lines.length;i++){
            if(!window.on_off){
                
                if(window.left_or_right==0){
                    lines[i].children[1].style["display"]='none'; 
                }
                else{
                    lines[i].children[0].style["display"]='none';
                }

            }
        }
    }
    if (setting === 'font_size'){

        for (var i = 0; i<lines.length;i++){

            lines[i].children[0].style["font-size"]=window.current_size; 
            lines[i].children[1].style["font-size"]=window.current_size;

        }
    }
    if (setting === "text_color"){ 

        for (var i = 0; i<lines.length;i++){
            if (window.left_or_right == 0){
                lines[i].children[1].style["color"]=window.text_color;
            }
            else{
                lines[i].children[0].style["color"]=window.text_color;
            }

        }

        document.getElementsByName("llsubsb2")[0].firstElementChild.firstElementChild.setAttribute('stroke',window.text_color); //Change color of buttons too because it looks cool 
        document.getElementsByName("llsubsb1")[0].firstElementChild.firstElementChild.setAttribute('stroke',window.text_color);


    }

    if (setting === "opacity"){ 

        for (var i = 0; i<lines.length;i++){

            if (window.left_or_right == 0){ //Original Text Side Left

                lines[i].children[1].style["opacity"]=window.opacity;

            }
            else{

                lines[i].children[0].style["opacity"]=window.opacity;

            }

        }


    }

    if (setting === "text_side"){

        for (var i = 0; i<lines.length;i++){

            lines[i].appendChild(lines[i].children[0]); //This is a bit hacky.. The issue is when you click the Reset Settings button it flips even when text_side is default value (but just for current onscreen subtitles).. i'll fix it soon enough

        }
    }

}


chrome.runtime.onMessage.addListener( //Listens for messages sent from background script (Settings Controller)
    function (request, sendRespone, sendResponse){
        if (request.message === "update_on_off"){
            window.on_off = request.value;
            if(!window.on_off){
                document.getElementsByName("llsubsb2")[0].style.display='none';
                document.getElementsByName("llsubsb1")[0].style.display='none';

            }
            else{
                document.getElementsByName("llsubsb2")[0].style.display='block';
                document.getElementsByName("llsubsb1")[0].style.display='block';
            }
            update_style('on_off');
        }

        if (request.message==='update_font_multiplier'){ //Recieved message from BACKGROUND.JS to change FONT MULTIPLIER to REQUEST.VALUE
            window.current_multiplier=parseFloat(request.value);
            window.current_size=window.baseFont*request.value+'px'
            update_style('font_size');
        }

        if (request.message ==='update_text_side'){
            if (window.left_or_right != parseInt(request.value)){
                window.left_or_right=parseInt(request.value);
                update_style('text_side');
            }
        }

        if (request.message ==='update_text_color'){
            window.text_color=request.value;
            update_style('text_color');
        }

        if (request.message ==='update_opacity'){
            window.opacity=parseFloat(request.value);
            update_style('opacity');
        }
});
