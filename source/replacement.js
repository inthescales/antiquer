// =======================================================
// GLOBAL VARIABLES
// =======================================================

var trie = null;
var diaeresisLevel = "off";
var ligatureLevel = "off";
var dashing = "off";

var startTime = Date.now();

// =======================================================
// DATA MANAGEMENT
// =======================================================

function browserIs(queryName) {
    
    var browserName = navigator.userAgent;
    if ((verOffset=browserName.indexOf(queryName))!=-1) {
        return true;
    }
    
    return false;
}

function getData(block) {
    
    if (browserIs("Chrome")) {
        
        chrome.storage.local.get({"diaeresisLevel" : "low", "ligatureLevel" : "low"}, function(result) {
            block(result["diaeresisLevel"], result["ligatureLevel"]);
        });
        
    } else if (browserIs("Firefox")) {
        
        let promise = browser.storage.local.get({
            diaeresisLevel: "low",
            ligatureLevel: "low"
        });
        
        promise.then(function(args) {
            block(args["diaeresisLevel"], args["ligatureLevel"]);
        });
    }
}

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
    var current_node = null;
    var matched_word = "";
    var letter = "";
    
    var atBoundary = true;
    
    function flush(letter) {

        if (matched_word != "") {
            output += matched_word;
            matched_word = "";
        }
        
        current_node = null;
        output += match_buffer + letter;
        match_buffer = "";
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

        if (current_node == null) {
            
            if (atBoundary) {
                var node = trie[compLetter];
                if (node != null && can_access(node["levels"])) {
                    current_node = node;
                }
            }
            
        } else if (current_node["following"] != null) {
        
            var next = current_node["following"][compLetter];
            
            if (next != null && can_access(next["levels"])) {
            
                current_node = next;
                
            } else {
                flush("");
            }
        } else {
            flush("");
        }
        
        if (current_node != null) {
            
            if (current_node["word"] != null && !(current_node["final"] == true && !atEnd(i))) {
               
                matched_word = matchCase(match_buffer + letter, current_node["word"]);
                match_buffer = "";
                    
            } else if (letter == "-" && i < text.length - 1) {
            
                var nextLetter = text.charAt(i+1);
                
                if (isVowel(nextLetter) && (dashing == "high" || (dashing == "low" && nextLetter == text.charAt(i-1))) ) {
                    output += matchCase(match_buffer + "-" + nextLetter, match_buffer + diaeresizeVowel(nextLetter));
                    current_node = null;
                    match_buffer = "";
                    letter = nextLetter;
                    i += 1;
                } else {
                    flush("-");
                }
            } else {
                match_buffer += letter;
            }
        } else {
            output += letter;
        }
        
        atBoundary = isBoundary(letter);
        
    }
    
    output += matched_word + match_buffer;

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
    
    if (character.charCodeAt(0) >= 128
     && character.charCodeAt(0) <= 160) {
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
    
getData( function(dLevel, lLevel) {
    
    diaeresisLevel = dLevel
    ligatureLevel = lLevel

    if (diaeresisLevel == "off" && ligatureLevel == "off") {
        return;
    }
    
    console.log(diaeresisLevel);
    dashing = diaeresisLevel;

    drive();
});
