// =======================================================
// GLOBAL VARIABLES
// =======================================================

var prefixes = []
var trie = null;
var diaeresisLevel = "off";
var ligatureLevel = "off";

// =======================================================
// DOM TRAVERSAL
// =======================================================

/*
    Walk all nodes from the input node down, replacing the text for text nodes.
*/
function walk(node) {
	var child, next;
    
    child = node.firstChild;
    switch (node.nodeType) {
        case 1:
        case 9:
        case 11:
            while ( child ) {
                next = child.nextSibling;
                walk(child);
                child = next;
            }
            break;
            
        case 3:
            handleNode(node);
            break;
    }
}

/*
    Handle a particular node, replacing its text.
*/
function handleNode(textNode) {
    var text = textNode.nodeValue;

    if (text.length > 0) {
    
        var newText = replace(text, diaeresisLevel, ligatureLevel, trie, prefixes);
		
		if (newText !== text) {
			textNode.nodeValue = newText;
		}
    }
}

/*
    Run replacement on the page title.
*/
function updateTitle() {
    var newTitle = replace(document.title, diaeresisLevel, ligatureLevel, trie, prefixes);
    if (document.title != newTitle) {
        document.title = newTitle;
    }
}

// =======================================================
// OBSERVATION
// =======================================================

/*
    Observe changes to the DOM to handle additional changes.
*/
var observer = new MutationObserver(onMutation);
observer.observe(document, {
    childList: true, // report added/removed nodes
    subtree: true    // observe any descendant elements
});

function onMutation(mutations) {
    if (trie != null) {
        for (var i = 0, len = mutations.length; i < len; i++) {

            var added = mutations[i].addedNodes;
            for (var j = 0, lenAdded = added.length; j < lenAdded; j++) {
                walk(added[j]);
            }
        }
    }
}

/*
    Observe changes to the page title.
*/
var observer = new MutationObserver(onTitleMutation);
observer.observe(document.querySelector('title'), {
    subtree: true,
    characterData: true,
    childList: true
});

function onTitleMutation(mutations) {
    if (trie != null) {
        updateTitle();
    }
}

// =======================================================
// DRIVER
// =======================================================

/*
    Read in JSON file specifying words to replace, then call replace to alter the words.
*/
function drive() {
    var startTime = Date.now();

    var url = chrome.runtime.getURL("trie.json")
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.send(null);
    request.onreadystatechange = function () {
        if (request.readyState === XMLHttpRequest.DONE && request.status === 200) {
        
            var response = request.responseText;
            let parsed_data = JSON.parse(response);
            trie = parsed_data["trie"]
            prefixes = parsed_data["prefixes"]

            if (trie != null) {
                walk(document.body)
                updateTitle();
            }

        }
    }
    
    var endTime = Date.now();
    console.log("Antiquer time elapsed: " + (endTime - startTime).toString());
}

// =======================================================
// START POINT
// =======================================================

/*
    Get stored data and drive the script with the value recovered, or "low" on failure.
*/
getData(function(dLevel, lLevel) {
    if (dLevel == "off" && lLevel == "off") {
        console.log("Antiquer not running")
        return;
    }

    diaeresisLevel = dLevel;
    ligatureLevel = lLevel;
    
    console.log("Antiquer running with diareses: " + diaeresisLevel + ", ligatures: " + ligatureLevel);

    drive();
});
