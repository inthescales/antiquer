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
            newNode = trie[letter];
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
    canAccess(node, diaeresisLevel, ligatureLevel) {
        var allowed = [];
        switch (diaeresisLevel) {
            case "low":
                allowed = allowed.concat("diaeresis_low");
                break;
            case "high":
                allowed = allowed.concat("diaeresis_low");
                allowed = allowed.concat("diaeresis_high");
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

        let levels = node.levels;
        for (var i = 0; i < allowed.length; i++) {
            if (levels.includes(allowed[i])) {
                return true;
            }
        }

        return false;
    }

    /*
        True if this node contains a word that must occur directly before a boundary.
    */
    get final() {
        if (this.node == null) {
            return false;
        }

        return this.node["final"] == true;
    }

    get prefix() {
        if (this.node == null) {
            return false;
        }

        return this.node["prefix"] == true;
    }

    /*
        The word match at the current node, if any.
    */
    get word() {
        if (this.node == null) {
            return null
        }

        return this.node["word"];
    }
}
