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
    walkLetter(letter) {
        var newNode = null;
        if (this.node == null) {
            newNode = trie[letter];
        } else {
            newNode = this.node.following[letter];
        }

        if (newNode != null && can_access(newNode["levels"])) {
            this.node = newNode;
            return true;
        } else {
            return false;
        }
    }

    /*
        True if the current node has no following nodes.
    */
    get final() {
        if (this.node == null) {
            return true
        }

        return this.node["following"] == null;
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
