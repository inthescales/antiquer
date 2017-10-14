// var app = chrome.runtime.getBackgroundPage();

function selectOff() {
    
    setLevel("off");
}

function selectLow() {
    
    setLevel("low");
}

function selectHigh() {
    
    setLevel("high");
}

function setLevel(level) {  
    
    chrome.storage.local.set({"level" : level}, function() {
        
        chrome.tabs.reload();
        updateScreen(level);
        updateIcon(level);
    });
}

function updateScreen(level) {

    var offButton = document.getElementById('buttonOff');
    var lowButton = document.getElementById('buttonLow');
    var highButton = document.getElementById('buttonHigh');
    
    var onClass = "buttonOn";
    var offClass = "buttonOff";
    
    offButton.className = (level == "off") ? onClass : offClass;
    lowButton.className = (level == "low") ? onClass : offClass;
    highButton.className = (level == "high") ? onClass : offClass;    
}

function updateIcon(level) {

    var resourcesDir = "resources";
    
    var iconPath16 = resourcesDir + "/" + ((level != "off") ? "icon_16x.png" : "icon_16x_bw.png");
    var iconPath48 = resourcesDir + "/" + ((level != "off") ? "icon_48x.png" : "icon_48x_bw.png");
    
    chrome.browserAction.setIcon({
        path: {19: iconPath16, 38: iconPath48}
    });
}

document.getElementById('buttonOff').addEventListener('click', selectOff);
document.getElementById('buttonLow').addEventListener('click', selectLow);
document.getElementById('buttonHigh').addEventListener('click', selectHigh);

chrome.storage.local.get( {"level" : "low"}, function(result) {

    var level = result["level"];
    
    updateScreen(level);
    updateIcon(level);
});