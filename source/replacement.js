// =======================================================
// GLOBAL VARIABLES
// =======================================================

var prefixes = []
var trie = null;
var diaeresisLevel = "off";
var ligatureLevel = "off";
var dashing = "off";

// =======================================================
// TEXT REPLACEMENT
// =======================================================

/*
    Returns true if the given string is in the prefix list.
*/
function is_valid_prefix(prefix) {
    for (var i = 0; i < prefixes.length; i++) {
        if (prefix.toLowerCase() == prefixes[i]) {
            return true;
        }
    }

    return false;
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
    
    /*
        Flush any matched word or unmatched characters to output, and reset buffers and trie walker.
    */
    function flush(letter = "") {
        if (matched_word != "") {
            output += matched_word;
            matched_word = "";
        }
        output += match_buffer + letter;
        match_buffer = "";

        trieWalker = null;
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
        
        // If this is a non-dash boundary character, flush, mark it, and continue
        if (isBoundary(letter) && letter != "-" ) {
            flush(letter);
            atBoundary = true;
            continue;
        }

        // If this is a dash, convert to a diaeresis if appropriate
        if (letter == "-" && i < text.length - 1) {
            var nextLetter = text.charAt(i+1);
            if (isVowel(nextLetter) && (dashing == "high" || (dashing == "low" && nextLetter == text.charAt(i-1)))) {
                flush();
                // Convert case
                var prefix = "";
                for (var p = output.length - 1; p >= 0; p--) {
                    if (!isBoundary(output[p])) {
                        prefix = output[p] + prefix;
                    } else {
                        break
                    }
                }

                console.log("OUTPUT: " + output)
                console.log("PREFIX: " + prefix)
                if (is_valid_prefix(prefix)){
                    console.log("VALID")
                    output = output.substring(0, output.length - prefix.length)
                    output += matchCase(prefix + "-" + nextLetter, prefix + diaeresizeVowel(nextLetter));
                    trieWalker = null;
                    match_buffer = "";
                    matched_word = "";
                    i += 1;
                } else {
                    console.log("INVALID")
                    // Skip case
                    flush("-")
                }
            } else {
                // Skip case
                flush("-");
            }

            continue;
        }

        // Advance the trie node, flushing if no node is available for this letter or if node levels are insufficient
        if (trieWalker == null && atBoundary) {
            trieWalker = new TrieWalker(trie);
        }

        // Trie to walk the trie, flushing if we wall out
        if (trieWalker != null) {
            if (!trieWalker.walkLetter(compLetter, diaeresisLevel, ligatureLevel)) {
                flush()
            }
        }

        if (trieWalker != null) {
            if (trieWalker.word != null) {
                if (
                    !(trieWalker.final && !atEnd(i))
                    && !(trieWalker.prefix && !(atEnd(i) && text.charAt(i+1) == "-"))
                ) {
                    // If we have a useable match, apply case matching and store it

                    matched_word = matchCase(match_buffer + letter, trieWalker.word);
                    match_buffer = "";
                    flush();
                } 
                else {
                    // Failed some environment requirements - cancel the match
                    // flush(letter)
                    match_buffer += letter
                }
            } else {
                // We haven't reached a word-bearing node yet
                match_buffer += letter
            }
        } else {
            // Add letter straight to output
            output += letter;
        }
        
        atBoundary = isBoundary(letter);
    }
    
    flush();

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

    diaeresisLevel = dLevel
    ligatureLevel = lLevel
    dashing = diaeresisLevel;
    
    console.log("Antiquer running with diareses: " + diaeresisLevel + ", ligatures: " + ligatureLevel);

    drive();
});
