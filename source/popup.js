// =======================================================
// UI INTERACTION
// =======================================================

function setDiaeresisLevel(level) {  
    
    if (browserIs("Chrome")) {
        
        chrome.storage.local.set({"diaeresisLevel" : level}, function() {
            
            chrome.tabs.reload();
            updateView();
            updateDiaeresisButtons(diaeresisLevel);
            updateIcon(diaeresisLevel, ligatureLevel);
        });
        
    } else if (browserIs("Firefox")) {
        
        browser.storage.local.set({
            diaeresisLevel: level
        });

        browser.tabs.reload();
        updateView();
        updateDiaeresisButtons(diaeresisLevel);
    }
}

function setLigatureLevel(level) {  
    
    
    if (browserIs("Chrome")) {
        
        chrome.storage.local.set({"ligatureLevel" : level}, function() {
            
            chrome.tabs.reload();
            updateView();
            updateLigatureButtons(ligatureLevel);
            updateIcon(diaeresisLevel, ligatureLevel);
        });
        
    } else if (browserIs("Firefox")) {
        
        console.log("THERE");
        browser.storage.local.set({
            ligatureLevel: level
        });

        browser.tabs.reload();
        updateView();
        updateDiaeresisButtons(diaeresisLevel);
    }
}

// =======================================================
// UI PRESENTATION
// =======================================================

function updateScreen(diaeresisLevel, ligatureLevel) {
    
    updateDiaeresisButtons(diaeresisLevel);
    updateLigatureButtons(ligatureLevel);
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

function updateIcon(diaeresisLevel, ligatureLevel) {

    var resourcesDir = "resources";
    
    var iconPath16 = resourcesDir + "/" + ((diaeresisLevel != "off") ? "icon_16x.png" : "icon_16x_bw.png");
    var iconPath48 = resourcesDir + "/" + ((diaeresisLevel != "off") ? "icon_48x.png" : "icon_48x_bw.png");
    
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
    
    getData( function(diaeresisLevel, ligatureLevel) {
        updateScreen(diaeresisLevel, ligatureLevel);
        updateIcon(diaeresisLevel, ligatureLevel);
    });
}

// =======================================================
// DRIVER CODE
// =======================================================

updateView();
