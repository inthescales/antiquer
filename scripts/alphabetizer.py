class Alphabetizer():
    _priority_list = [
        ["a", "ä"],
        "æ",
        "b",
        "c",
        "d",
        ["e", "ë"],
        "f",
        "g",
        "h",
        ["i", "ï"],
        "j",
        "k",
        "l",
        "m",
        "n",
        ["o", "ö"],
        "œ",
        "p",
        "q",
        "r",
        "s",
        "t",
        ["u", "ü"],
        "v",
        "w",
        "x",
        "y",
        "z"
    ]

    def __init__(self):
        self._priority_map = self._generate_mapping(self._priority_list)

    def _generate_mapping(self, array):
        """Turns the priority array into a dictionary that can be queried during sort."""
        mapping = {}

        priority = 0
        for item in array:
            if isinstance(item, list):
                for subitem in item:
                    mapping[subitem] = priority
            else:
                mapping[item] = priority

            priority += 1

        return mapping

    def _get_sort_key(self, char):
        """Returns a key for sorting the given character"""

        comp_char = char.lower()
        if comp_char in self._priority_map:
            return self._priority_map[comp_char]
        else:
            return len(self._priority_list)

    # Returns the given words in sorted order
    def sorted(self, words, key=lambda word: word):
        return sorted(words, key=lambda word: [self._get_sort_key(char) for char in key(word)])
