/*
    Global variables storing replacement targets
*/
var words = null;
var prefixes = null;
var level = "off";

var startTime = Date.now();

// =======================================================
// TEXT MANIPULATION
// =======================================================

/*
    Adds a diaeresis to an input vowel.
*/
function diaeresizeVowel(vowel) {

    switch(vowel) {
        case "a":
            return "ä";
        case "e":
            return "ë";
        case "i":
            return "ï";
        case "o":
            return "ö";
        case "u":
            return "ü";
        case "A":
            return "Ä";
        case "E":
            return "Ë";
        case "I":
            return "Ï";
        case "O":
            return "Ö";
        case "U":
            return "Ü";
    }
    
    return vowel;
}

/*
    Takes in a template word and an input word, and returns that input word with the same
    case pattern as the template, ignoring dashes.
    
    Returns the input word with the case pattern of the template. If the words are of unequal
    lengths, returns the input unaltered.
    
*/
function matchCase(template, input) {

    var profile = [];
    var skipped = 0;
    var needsChange = false;
    
    for (var i = 0; i < template.length; i++) {
        
        if (template[i] == "-") {
            skipped += 1;
            continue;
        }
        
        if (template[i] == template[i].toUpperCase()) {
            profile[i-skipped] = 1;
            needsChange = true;
        } else {
            profile[i-skipped] = 0;
        }
    }

    if (needsChange && profile.length == input.length) {
        var output = ""
        for (var i = 0; i < input.length; i++) {
            if (profile[i] == 0) {
                output += input[i];
            } else {
                output += input[i].toUpperCase();
            }
        }
        return output;
    }
    
    return input;
}

/*
    Find and replace instances of words that can take diaereses according to the JSON file.
*/
function replace(text) {
return;
    var output = text;
    // Replace prefixes
    if (prefixes != null && prefixes.length > 0) {
        for (var n = 0; n < prefixes.length; n++) {
            
            var prefix = prefixes[n];
            var regex = null;
            if (level == "low") {
                regex = new RegExp("\\b" + prefix + "\\-" + prefix[prefix.length-1], "gi");
            }
            else if (level == "high") {
                regex = new RegExp("\\b" + prefix + "\\-[aeiouAEIOU]", "gi");
            }
            output = output.replace(regex, function(match) {
                return match.substring(0, prefix.length) + diaeresizeVowel(match[match.length-1]);
            });
        }
    }
    
    // Replace full words
    if (words != null && words.length > 0) {

        for (var n = 0; n < words.length; n++) {

            var word = words[n][0]
            var regex = new RegExp("\\b" + word, "gi");
            output = output.replace(regex, function(match) {
                return matchCase(match, words[n][1]);
            });
            
        }
    }

    return output
}

// =======================================================
// DOM TRAVERSAL
// =======================================================

/*
    Walk all nodes from the input node down, replacing the text for text nodes.
*/
function walk(node) {

	var child, next;

    child = node.firstChild;
    while ( child ) 
    {
        next = child.nextSibling;
        walk(child);
        child = next;
    }
    
    if (node.nodeType == 3) {
        handleNode(node);
    }
}

/*
    Handle a particular node, replacing its text.
*/
function handleNode(textNode) {

    var text = textNode.nodeValue;

	text = replace(text);
	
	textNode.nodeValue = text;
}

function updateTitle() {
    
    var newTitle = replace(document.title);
    if (document.title != newTitle) {
        document.title = newTitle;
    }
}

/*
    Observe changes to the DOM to handle additional changes
*/
var observer = new MutationObserver(onMutation);
observer.observe(document, {
    childList: true, // report added/removed nodes
    subtree: true   // observe any descendant elements
});

function onMutation(mutations) {

    for (var i = 0, len = mutations.length; i < len; i++) {
    
        var added = mutations[i].addedNodes;
        for (var j = 0, lenAdded = added.length; j < lenAdded; j++) {            
            walk(added[j]);
        }
    }
}

/*
    Observe changes to the page title
*/
var observer = new MutationObserver(onTitleMutation);
observer.observe(document.querySelector('title'), {
    subtree: true,
    characterData: true,
    childList: true
});

function onTitleMutation(mutations) {

    updateTitle();
}

// =======================================================
// DRIVER
// =======================================================

/*
    Read in JSON file specifying words to replace, then call replace to alter the words.
*/
function drive() {
    var url = chrome.runtime.getURL("diaereses.json")
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.send(null);
    request.onreadystatechange = function () {
        if (request.readyState === XMLHttpRequest.DONE && request.status === 200) {
        
            var response = request.responseText;
            var parsed = JSON.parse(response);
            
            words = parsed["low"]["words"];
            prefixes = parsed["low"]["prefixes"];

            if (level == "high") {
                words = words.concat(parsed["high"]["words"]);
                prefixes = prefixes.concat(parsed["high"]["prefixes"]);
            }
            
            if (words != null || prefixes != null && words.length > 0) {
                walk(document.body)
                updateTitle();
            }

        }
    }
    
    var endTime = Date.now();
    alert(endTime - startTime);
}

// =======================================================
// START POINT
// =======================================================

/*
    Get stored data and drive the script with the value recovered, or "low" on failure.
*/
chrome.storage.local.get({"level" : "low"}, function(result) {
   
    level = result["level"]

    
    if (level == "off") {
        return;
    }

    drive();
});
