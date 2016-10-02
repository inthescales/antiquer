var elements = document.getElementsByTagName('*');

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
    Replaces the text of the page's elements based on the replacement scheme specified by
    the input array.
*/
function replace(words, prefixes) {

    for (var i = 0; i < elements.length; i++) {
        var element = elements[i];

        for (var j = 0; j < element.childNodes.length; j++) {
            var node = element.childNodes[j];

            if (node.nodeType === 3) {
                var text = node.nodeValue;
                var replacedText = text;
                
                // Replace prefixes
                if (prefixes != null && prefixes.length > 0) {
                    for (var n = 0; n < prefixes.length; n++) {
                        
                        var prefix = prefixes[n];
                        var regex = new RegExp("\\b" + prefix + "\\-[aeiouAEIOU]", "gi");
                        replacedText = replacedText.replace(regex, function(match) {

                            return match.substring(0, prefix.length) + diaeresizeVowel(match[match.length-1]);
                        });
                    }
                }
                
                // Replace full words
                if (words != null && words.length > 0) {
                    for (var n = 0; n < words.length; n++) {

                        var word = words[n][0]
                        var regex = new RegExp("\\b" + word, "gi");
                        replacedText = replacedText.replace(regex, function(match) {

                            return matchCase(match, words[n][1]);
                        });
                        
                    }
                }

                if (replacedText !== text) {
                    element.replaceChild(document.createTextNode(replacedText), node);
                }
            }
        }
    }

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
        var words = parsed["words"];
        var prefixes = parsed["prefixes"];
        
        if (words != null || prefixes != null && words.length > 0) {
            replace(words, prefixes);
        }

    }
}