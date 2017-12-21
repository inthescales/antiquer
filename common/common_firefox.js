// Imported from common_firefox.js ***********************

// =======================================================
// DATA MANAGEMENT
// =======================================================

function getData(block) {
    
    let promise = browser.storage.local.get({
        diaeresisLevel: "low",
        ligatureLevel: "low"
    });
    
    promise.then(function(args) {
        block(args["diaeresisLevel"], args["ligatureLevel"]);
    });
}

function saveData(data, block) {
    
    browser.storage.local.set(data);
    block();
}

function reloadTab() {
    browser.tabs.reload();
}

function setIcon(obj) {
    browser.browserAction.setIcon(obj);
}

// End of import *****************************************

