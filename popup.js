//Oof this is super ugly but to be fair it was the first thing I wrote when I started this project (and therefore the first code I wrote in javascript). The issue is really just the naming so I'll fix it some other time..definitely

document.addEventListener('DOMContentLoaded',function(){ //Just adding buttons and their respective listeners. Button presses send messages to background.js

    window.addEventListener('click',function(e){
        if(e.target.href!==undefined){
            chrome.tabs.create({url:e.target.href});
        }
      });

    var slider = document.getElementById('mySlider');
    var slideValue = document.getElementById('mySliderValue');
    var sideSlider = document.getElementById('sideSlider');
    var sideSliderValue = document.getElementById('sideSliderValue');
    var opacitySlider = document.getElementById('opacitySlider');
    var opacitySliderValue = document.getElementById('opacitySliderValue');
    var colorPicker = document.getElementById('myColorPicker');
    var resetButton = document.getElementById('resetButton');
    var onSwitch = document.getElementById("switchValue");

    chrome.storage.sync.get('font_multiplier',function(data){ //Change slider positions to the stored values

        slideValue.innerHTML=data.font_multiplier;
        slider.value=data.font_multiplier;

    });

    chrome.storage.sync.get('left_or_right',function(data){

        sideSlider.value=data.left_or_right;
        sideSliderValue.innerHTML=data.left_or_right;

    });

    chrome.storage.sync.get('opacity',function(data){

        opacitySlider.value=data.opacity;
        opacitySliderValue.innerHTML=data.opacity;

    });

    chrome.storage.sync.get('text_color',function(data){

        colorPicker.value=data.text_color;

    });

    chrome.storage.sync.get('on_off',function(data){
        console.log("Stored value is: ",data.on_off);
        onSwitch.checked=data.on_off;

    });

    slider.addEventListener('change', function() {

        mySliderValue.innerHTML=this.value;
        slider.value=this.value;

        chrome.runtime.sendMessage({
            "message": "update_font_multiplier",
            "value": this.value
        });
        
    }, false);

    sideSlider.addEventListener('change',function() {

        sideSliderValue.innerHTML=this.value;
        sideSlider.value = this.value;

        chrome.runtime.sendMessage({
            "message": "update_text_side",
            "value": this.value
        });
    }, false);

    opacitySlider.addEventListener('change',function() {

        opacitySliderValue.innerHTML=this.value;
        opacitySlider.value = this.value;

        chrome.runtime.sendMessage({
            "message": "update_opacity",
            "value": this.value
        });
    }, false);

    colorPicker.addEventListener('input',function() {

        colorPicker.value = this.value;

        chrome.runtime.sendMessage({
            "message": "update_text_color",
            "value": this.value
        });
    }, false);

    onSwitch.addEventListener('change',function() {

        //chrome.storage.sync.set({"left_or_right":this.value});
       chrome.runtime.sendMessage({
           "message":"update_on_off",
           "value": this.checked
       });
        

    }, false);

    resetButton.addEventListener('click',function() {

        colorPicker.value='#FFF000';
        colorPicker.dispatchEvent(new Event('input'));
        opacitySlider.value=1;
        opacitySlider.dispatchEvent(new Event('change'));
        slider.value=1;
        slider.dispatchEvent(new Event('change'));
        sideSlider.value=0;
        sideSlider.dispatchEvent(new Event('change'));

    }, false);



}, false);