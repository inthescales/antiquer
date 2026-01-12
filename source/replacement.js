// =======================================================
// GLOBAL VARIABLES
// =======================================================

var trie = null;
var diaeresisLevel = "off";
var ligatureLevel = "off";
var dashing = "off";

// =======================================================
// TEXT REPLACEMENT
// =======================================================

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
    
    /*
        Flush any matched word or unmatched characters to output, and reset buffers and trie walker.
    */
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
        
        // If this is a boundary character, flush, mark it, and continue
        if (isBoundary(letter) && letter != "-" ) {
            flush(letter);
            atBoundary = true
            continue;
        }

        // Advance the trie node, flushing if no node is available for this letter or if node levels are insufficient
        if (trieWalker == null && atBoundary) {
            trieWalker = new TrieWalker(trie);
        }

        if (trieWalker != null) {
            if (!trieWalker.walkLetter(compLetter, diaeresisLevel, ligatureLevel)) {
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
                console.log("STORING: " + matched_word)
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
            } else if (matched_word == "") {
                // Add letter to buffer if we haven't made a match yet
                match_buffer += letter;
            } else {
                // Add letter straight to output if we've already made a match during this word
                output += letter
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
            trie = JSON.parse(response);

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

    diaeresisLevel = dLevel
    ligatureLevel = lLevel
    dashing = diaeresisLevel;
    
    console.log("Antiquer running with diareses: " + diaeresisLevel + ", ligatures: " + ligatureLevel);

    drive();
});
