var words = null;
var prefixes = null;

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
    Walk all nodes from the input node down, replacing the text for text nodes.
*/
function walk(node) {

	var child, next;

	switch ( node.nodeType )  
	{
		case 1:  // Element
		case 9:  // Document
		case 11: // Document fragment
			child = node.firstChild;
			while ( child ) 
			{
				next = child.nextSibling;
				walk(child);
				child = next;
			}
			break;

		case 3: // Text node
			handleNode(node);
			break;
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


/*
    Find and replace instances of words that can take diaereses according to the JSON file.
*/
function replace(text) {

    var output = text;
    // Replace prefixes
    if (prefixes != null && prefixes.length > 0) {
        for (var n = 0; n < prefixes.length; n++) {
            
            var prefix = prefixes[n];
            var regex = new RegExp("\\b" + prefix + "\\-[aeiouAEIOU]", "gi");
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

/*
    Read in JSON file specifying words to replace, then call replace to alter the words.
*/
var url = chrome.runtime.getURL("diaereses.json")
var request = new XMLHttpRequest();
request.open('GET', url, true);
request.send(null);
request.onreadystatechange = function () {
    if (request.readyState === XMLHttpRequest.DONE && request.status === 200) {
    
        var response = request.responseText;
        var parsed = JSON.parse(response);
        words = parsed["words"];
        prefixes = parsed["prefixes"];
        
        if (words != null || prefixes != null && words.length > 0) {
            walk(document.body)
        }

    }
}