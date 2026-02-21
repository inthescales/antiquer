/*
    Wrapper for trie, exposing methods for walking through its nodes and finding words.
*/
class TrieWalker {
    constructor(trie) {
        this.trie = trie;
        this.node = null;
    }

    /*
        Advance through the node along the given letter. Returns true if a node matching that letter exists,
        otherwise false.
    */
    walkLetter(letter, diaeresisLevel, ligatureLevel) {
        var newNode = null;
        if (this.node == null) {
            newNode = this.trie[letter];
        } else if (this.node.following != null) {
            newNode = this.node.following[letter];
        }

        if (newNode != null && this.canAccess(newNode, diaeresisLevel, ligatureLevel)) {
            this.node = newNode;
            return true;
        } else {
            return false;
        }
    }

    /*
        Returns true if the given diaeresis and ligature levels meet the requirements of the given node.
    */
    canAccess(node, dLevel, lLevel) {
        let levels = node.levels;
        for (var i = 0; i < levels.length; i++) {
            if (this.check_req(levels[i], dLevel, lLevel)) {
                return true;
            }
        }

        return false;
    }

    /*
        The word match at the current node, if any.
    */
    form(dLevel, lLevel, isFinal, isPrefix) {
        if (this.node == null) {
            return null
        }

        if (this.node["transforms_simple"] == null) {
            return null;
        }

        let levels = ["dhigh", "lhigh", "dlow", "llow"];
        for (var i = 0; i < levels.length; i++) {
            let level = levels[i];
            if (
                this.node["transforms_simple"][level] != null
                && this.check_req(level, dLevel, lLevel)
            ) {
                if (this.check_env(this.node["transforms_simple"][level], isFinal, isPrefix)) {
                    return this.node["transforms_simple"][level]["form"];
                }
            }
        }

        return null;
    }

    // Helpers --------------------------------------------

    /*
        Whether the given settings satisfy the required level.
    */
    check_req(requirement, dLevel, lLevel) {
        switch (requirement) {
            case "dlow":
                return dLevel == "low" || dLevel == "high";
            case "dhigh":
                return dLevel == "high";
            case "llow":
                return lLevel == "low" || lLevel == "high";
            case "lhigh":
                return lLevel == "high";
            default:
                return false;
        }
    }

    /*
        Whether the given environment parameters satisfy the transform's requirements.
    */
    check_env(transformDict, isFinal, isPrefix) {
        if (transformDict["final"] == true && isFinal == false) {
            return false;
        } else if (transformDict["prefix"] == true && isPrefix == false) {
            return false;
        }

        return true;
    }
}
