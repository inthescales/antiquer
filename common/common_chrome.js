// Imported from common_chrome.js ************************

// =======================================================
// DATA MANAGEMENT
// =======================================================

function getData(block) {
    
    chrome.storage.local.get({"diaeresisLevel" : "low", "ligatureLevel" : "low"}, function(result) {
        block(result["diaeresisLevel"], result["ligatureLevel"]);
    });
}

function saveData(data, block) {
    
    chrome.storage.local.set(data, block);
}

function reloadTab() {
    chrome.tabs.reload();
}

function setIcon(obj) {
    chrome.browserAction.setIcon(obj);
}

// End of import *****************************************

