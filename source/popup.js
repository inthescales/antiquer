// var app = chrome.runtime.getBackgroundPage();

function setDiaeresisLevel(level) {  
    
    chrome.storage.local.set({"diaeresis_level" : level}, function() {
        
        chrome.tabs.reload();
        updateView();
        updateDiaeresisButtons(diaeresis_level);
        updateIcon(diaeresis_level, ligature_level);
    });
}

function setLigatureLevel(level) {  
    
    chrome.storage.local.set({"ligature_level" : level}, function() {
        
        chrome.tabs.reload();
        updateView();
        updateLigatureButtons(ligature_level);
        updateIcon(diaeresis_level, ligature_level);
    });
}

function updateScreen(diaeresis_level, ligature_level) {
    
    updateDiaeresisButtons(diaeresis_level);
    updateLigatureButtons(ligature_level);
}

function updateDiaeresisButtons(level) {

    var diaeresisOffButton = document.getElementById('diaeresisOffButton');
    var diaeresisLowButton = document.getElementById('diaeresisLowButton');
    var diaeresisHighButton = document.getElementById('diaeresisHighButton');
    
    var onClass = "buttonOn";
    var offClass = "buttonOff";
    
    diaeresisOffButton.className = (level == "off") ? onClass : offClass;
    diaeresisLowButton.className = (level == "low") ? onClass : offClass;
    diaeresisHighButton.className = (level == "high") ? onClass : offClass;
}

function updateLigatureButtons(level) {
    
    var ligatureOffButton = document.getElementById('ligatureOffButton');
    var ligatureLowButton = document.getElementById('ligatureLowButton');
    var ligatureHighButton = document.getElementById('ligatureHighButton');
    
    var onClass = "buttonOn";
    var offClass = "buttonOff";
    
    ligatureOffButton.className = (level == "off") ? onClass : offClass;
    ligatureLowButton.className = (level == "low") ? onClass : offClass;
    ligatureHighButton.className = (level == "high") ? onClass : offClass;  
}

function updateIcon(diaeresis_level, ligature_level) {

    var resourcesDir = "resources";
    
    var iconPath16 = resourcesDir + "/" + ((diaeresis_level != "off") ? "icon_16x.png" : "icon_16x_bw.png");
    var iconPath48 = resourcesDir + "/" + ((diaeresis_level != "off") ? "icon_48x.png" : "icon_48x_bw.png");
    
    chrome.browserAction.setIcon({
        path: {19: iconPath16, 38: iconPath48}
    });
}

document.getElementById('diaeresisOffButton').addEventListener('click', function(){ setDiaeresisLevel("off"); });
document.getElementById('diaeresisLowButton').addEventListener('click', function(){ setDiaeresisLevel("low"); });
document.getElementById('diaeresisHighButton').addEventListener('click', function(){ setDiaeresisLevel("high"); });

document.getElementById('ligatureOffButton').addEventListener('click', function(){ setLigatureLevel("off"); });
document.getElementById('ligatureLowButton').addEventListener('click', function(){ setLigatureLevel("low"); });
document.getElementById('ligatureHighButton').addEventListener('click', function(){ setLigatureLevel("high"); });

function updateView() {
    chrome.storage.local.get( {"diaeresis_level" : "low", "ligature_level" : "low"}, function(result) {

        var diaeresis_level = result["diaeresis_level"];
        var ligature_level = result["ligature_level"];
        
        updateScreen(diaeresis_level, ligature_level);
        updateIcon(diaeresis_level, ligature_level);
    });
}

updateView();