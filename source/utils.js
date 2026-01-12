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
