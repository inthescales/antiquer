// =======================================================
// TEXT REPLACEMENT
// =======================================================

/*
    Returns true if the given string is in the prefix list.
*/
function is_valid_prefix(prefix, prefixes) {
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
function replace(text, dLevel, lLevel, trie, prefixes) {
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
            if (isVowel(nextLetter) && (dLevel == "high" || (dLevel == "low" && nextLetter == text.charAt(i-1)))) {
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

                if (is_valid_prefix(prefix, prefixes)){
                    output = output.substring(0, output.length - prefix.length)
                    output += matchCase(prefix + "-" + nextLetter, prefix + diaeresizeVowel(nextLetter));
                    trieWalker = null;
                    match_buffer = "";
                    matched_word = "";
                    i += 1;
                } else {
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
            if (!trieWalker.walkLetter(compLetter, dLevel, lLevel)) {
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
