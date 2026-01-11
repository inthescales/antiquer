// =======================================================
// GLOBAL VARIABLES
// =======================================================

var trie = null;
var diaeresisLevel = "off";
var ligatureLevel = "off";
var dashing = "off";

// =======================================================
// TEXT MANIPULATION
// =======================================================

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
    var isProper = true;

    for (var i = 0; i < template.length; i++) {
        if (template[i] == "-") {
            skipped += 1;
            continue;
        }
        
        if (template[i] == template[i].toUpperCase()) {
            profile[i-skipped] = 1;
            needsChange = true;
            if (i > 0 && i < template.length - 1) {
                isProper = false;
            }
        } else {
            profile[i-skipped] = 0;
            if (i == 0) {
                isProper = false;
            }
        }
        
        if (i < template.length-1
        && ((input[i-skipped].toLowerCase() == "æ" && template[i].toLowerCase() == "a" && template[i+1].toLowerCase() == "e")
          || (input[i-skipped].toLowerCase() == "œ" && template[i].toLowerCase() == "o" && template[i+1].toLowerCase() == "e"))) {
            
            if (profile[i-skipped] == 1) {
                i += 1;
            }
            skipped += 1;
        }
    }

    if (isProper && skipped > 0) {
        profile[profile.length-1] = 0;
    }
    
    if (needsChange && profile.length == input.length) {
        var output = ""
        for (var i = 0; i < input.length; i++) {
        
            if (profile[i] == 0) {
                output += input[i].toLowerCase();
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
    var output = "";
    
    var match_buffer = "";
    var matched_word = "";
    var letter = "";
    var trieWalker = null;
    
    var atBoundary = true;
    
    function flush(letter) {
        if (matched_word != "") {
            output += matched_word;
            matched_word = "";
        }
        
        trieWalker = null;
        output += match_buffer + letter;
        match_buffer = "";
    }
    
    // Returns true if process has reached end of text or if next character is a boundary
    function atEnd(i) {
        if (i == text.length - 1) {
            return true;
        }
        
        var nextLetter = text.charAt(i+1);
        return isBoundary(nextLetter);
    }
    
    for (var i = 0; i < text.length; i++) {
        letter = text.charAt(i);
        var compLetter = letter.toLowerCase();
        
        if (isBoundary(letter) && letter != "-" ) {
            flush(letter);
            atBoundary = true
            continue;
        }

        // Advance the trie node, flushing if no node is available for this letter
        if (trieWalker == null && atBoundary) {
            trieWalker = new TrieWalker(trie);
            trieWalker.walkLetter(compLetter);
        } else if (trieWalker != null && !trieWalker.final) {
            if (!trieWalker.walkLetter(compLetter)) {
                flush("");
            }
        } else {
            flush("");
        }

        if (trieWalker != null) {
            if (trieWalker.word != null && !(trieWalker.final && !atEnd(i))) {
                // If we have a useable match, apply case matching and store it

                matched_word = matchCase(match_buffer + letter, trieWalker.word);
                match_buffer = "";
            
            } else if (letter == "-" && i < text.length - 1) {
                // If the following character is a dash, and dash-diaeresization rules apply, use diaeresis and skip ahead
                var nextLetter = text.charAt(i+1);
                
                if (isVowel(nextLetter) && (dashing == "high" || (dashing == "low" && nextLetter == text.charAt(i-1))) ) {
                    output += matchCase(match_buffer + "-" + nextLetter, match_buffer + diaeresizeVowel(nextLetter));
                    trieWalker = null;
                    match_buffer = "";
                    letter = nextLetter;
                    i += 1;
                } else {
                    flush("-");
                }
            } else {
                // Add letter to buffer
                match_buffer += letter;
            }
        } else {
            // Add letter straight to output
            output += letter;
        }
        
        atBoundary = isBoundary(letter);
    }
    
    output += matched_word + match_buffer;

    return output
}

/*
    For a trie node's access level array, return true if the current settings match any of its levels
*/
function can_access(arr) {
    var allowed = [];
    switch (diaeresisLevel) {
        case "low":
            allowed = ["diaeresis_low"];
            break;
        case "high":
            allowed = ["diaeresis_low", "diaeresis_high"];
            break;
        default:
            break;
    }
    switch (ligatureLevel) {
        case "low":
            allowed = allowed.concat("ligature_low");
            break;
        case "high":
            allowed = allowed.concat("ligature_low");
            allowed = allowed.concat("ligature_high");
            break;
            
        default:
            break;
    }

    for (var i = 0; i < arr.length; i++) {
        for (var j = 0; j < allowed.length; j++) {
            if (arr[i] == allowed[j]) {
                return true;
            }
        }
    }
    
    return false;
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
    
        var newText = replace(text);
		
		if (newText !== text) {
			textNode.nodeValue = newText;
		}
    }
}

/*
    Run replacement on the page title.
*/
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
    Observe changes to the page title
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
    // var startTime = Date.now();

    var url = chrome.runtime.getURL("trie.json")
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.send(null);
    request.onreadystatechange = function () {
        if (request.readyState === XMLHttpRequest.DONE && request.status === 200) {
        
            var response = request.responseText;
            trie = JSON.parse(response);

            if (trie != null) {
                walk(document.body)
                updateTitle();
            }

        }
    }
    
    // var endTime = Date.now();
    // alert(endTime - startTime);
}

// =======================================================
// START POINT
// =======================================================

/*
    Get stored data and drive the script with the value recovered, or "low" on failure.
*/
getData(function(dLevel, lLevel) {
    
    diaeresisLevel = dLevel
    ligatureLevel = lLevel

    if (diaeresisLevel == "off" && ligatureLevel == "off") {
        return;
    }
    
    console.log("Antiquer running with diareses: " + diaeresisLevel + ", ligatures: " + ligatureLevel);
    dashing = diaeresisLevel;

    drive();
});
