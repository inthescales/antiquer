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

// End of import *****************************************

