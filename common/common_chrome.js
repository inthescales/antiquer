// Imported from common_chrome.js ************************

// =======================================================
// DATA MANAGEMENT
// =======================================================

function getData(block) {
    
    chrome.storage.local.get({"diaeresisLevel" : "low", "ligatureLevel" : "low"}, function(result) {
        block(result["diaeresisLevel"], result["ligatureLevel"]);
    });
}

// End of import *****************************************

