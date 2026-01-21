// =======================================================
// TEXT INTERPRETATION
// =======================================================

/*
    True if the character is an alphabetic letter.
*/
function isLetter(character) {
    return !isBoundary(character);
}

/*
    True if the character is a boundary between words or word-elements.
*/
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
        case "\\":
        case "'":
        case "\"":
        case "`":
        case "“":
        case "”":
        case "‘":
        case "’":
        case "\n":
        case "\r":
        case "\t":
            return true;
        default:
            return false;
    }
}

/*
    True if the letter is a vowel.
*/
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
// PREPARING NEW TEXTS
// =======================================================

/*
    Adds a diaeresis to the given vowel.
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
    var profile = Array(template.length).fill(0)
    var skipped = 0;
    var needsChange = false;

    for (var i = 0; i < template.length; i++) {
        // Skip dashes
        if (template[i] == "-") {
            skipped += 1;
            continue;
        }

        // Mark the current character's case in the profile
        if (template[i] == template[i].toUpperCase()) {
            if (i > 0 && template[i-1] == "-") {
                // If following a dash, copy the case of the previous character
                profile[i-skipped] = profile[i-skipped-1];
            } else {
                profile[i-skipped] = 1;
                needsChange = true;
            }
        } else {
            profile[i-skipped] = 0;
        }

        // If the the original text used a digraph that we are replacing with a ligature, skip the next letter
        if (
            i < template.length-1
            && (
                (input[i-skipped].toLowerCase() == "æ" && template[i].toLowerCase() == "a" && template[i+1].toLowerCase() == "e")
                || (input[i-skipped].toLowerCase() == "œ" && template[i].toLowerCase() == "o" && (template[i+1].toLowerCase() == "e" || template[i+1].toLowerCase() == "i"))
            )
        ) {
            i += 1;
            skipped += 1;
        }
    }
    
    if (needsChange) {
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
