/*
    Global variables storing replacement targets
*/
var trie = null;
var level = "off";
var dashing = "off";

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

    var output = "";
    
    var current = null;
    var atBoundary = true;
    var word = "";
    var letter = "";
    
    function flush(letter) {
        output += word + letter;
        word = "";
    }
    
    function atEnd(i) {
        
        if (i == text.length - 1) {
            return true;
        }
        
        var nextLetter = text.charAt(i+1);
        return isBoundary(nextLetter);
    }
    
    for (var i = 0; i < text.length; i++) {
    
        letter = text.charAt(i);
        var compLetter = text.charAt(i).toLowerCase();
        
        if (isBoundary(letter) && letter != "-" ) {
            flush(letter);
            atBoundary = isBoundary(letter);
            continue;
        }

        if (current == null) {
            
            if (atBoundary) {
                var node = trie[compLetter];
                if (node != null && can_access(node["levels"], level)) {
                    //alert("Starting new track with letter: " + letter);
                    current = node;
                }
            }
            
            if (current == null) {
                output += letter;
            }
            
        } else if (current["following"] != null) {
        
            var next = current["following"][compLetter];
            if (next == null) {
                current = null;
                //alert("Flushing (" + word + letter + ") at no-next");
                flush(letter);
                
            } else if (can_access(next["levels"], level)) {
            
                current = next;
                if (current["word"] != null && !(current["final"] == true && !atEnd(i)) ) {
                
                    output += matchCase(word + letter, current["word"]);
                    word = "";
                    current = null;
                } else if (letter == "-" && i < text.length - 1) {
                
                    current = null;
                    //alert("Flushing (" + word + letter + "at dashing");
                    flush("");
                    var nextLetter = text.charAt(i+1);
                    if (isVowel(nextLetter) && (dashing == "high" || (dashing == "low" && nextLetter == text.charAt(i-1))) ) {
                        output += diaeresizeVowel(nextLetter);
                        letter = nextLetter;
                        i += 1;
                    } else {
                        output += "-";
                    }
                } else {
                    
                }
            }
        } else {
            alert("!!!!!");
            current = null;
            flush(letter);
        }
        
        if (current != null) {
            word += letter;
        } 
        
        //alert(word + ", " + output);
        
        atBoundary = isBoundary(letter);
        
    }
    
    output += word;

    return output
}

// Replacement helpers ------------------------------------

/*function isLetter(character) {

    return character.length === 1 && /\w/.test(character);
}

function isBoundary(character) {

    return character.length === 1 && /\W/.test(character);
}*/

function isLetter(character) {

    return !isBoundary(character);
    //return ((character >= "a" && character <= "z") || (character >= "A" && character <= "Z"));
    //return character.length === 1 && /\w/.test(character);
}

function isBoundary(character) {

    if (character.charCodeAt(0) <= 47) {
        return true;
    }
    
    switch (character) {
        case "\0":
        case " ":
        case ".":
        case ",":
        case ";":
        case "-":
        case "~":
        case "\"":
        case "_":
        case "+":
        case "=":
        case "(":
        case ")":
        case "[":
        case "]":
        case "{":
        case "}":
        case "<":
        case ">":
        case "?":
        case "/":
        case "'":
        case "`":
        case "\\":
        case "\n":
        case "\r":
        case "\t":
            return true;
        default:
            return false;
    }
}

function can_access(arr, level) {

    var allowed = [];
    switch (level) {
        case "low":
            allowed = ["low"]; break;
        case "high":
            allowed = ["low", "high"]; break;
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

function isVowel(letter) {
    
    switch(letter) {
        case "a":
        case "e":
        case "i":
        case "o":
        case "u":
        case "A":
        case "E":
        case "I":
        case "O":
        case "U":
            return true;
        default:
            return false;
    }
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

    if (text.length > 0) {

        text = replace(text);
    }
    
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
    
    //var endTime = Date.now();
    //alert(endTime - startTime);
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
    
    dashing = level;

    drive();
});
