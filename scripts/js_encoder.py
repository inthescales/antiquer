import json

from alphabetizer import Alphabetizer

class PatternsEncoder(json.JSONEncoder):
    """Custom JSON encoder for formatting the patterns file"""

    dict_sort_threshold = 4
    """The minimum number of elements in a dict for it to be sorted"""

    list_break_threshold = 8
    """The minimum number of elements in a list for it to be broken onto multiple lines and sorted"""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.alphabetizer = Alphabetizer()
        self.indentation_level = 0

    def encode(self, obj):
        if isinstance(obj, list):
        	return self._encode_list(obj)
        elif isinstance(obj, dict):
            return self._encode_dict(obj)

        return json.dumps(
            obj,
            skipkeys=self.skipkeys,
            ensure_ascii=self.ensure_ascii,
            check_circular=self.check_circular,
            allow_nan=self.allow_nan,
            sort_keys=self.sort_keys,
            indent=self.indent,
            separators=(self.item_separator, self.key_separator),
            default=self.default if hasattr(self, "default") else None,
        )

    def _encode_list(self, list_in):
        """Encode a list, keeping it on one line if its element count is below the threshold."""

        if len(list_in) < self.list_break_threshold:
            return "[" + ", ".join([self.encode(element) for element in list_in]) + "]"
        else:
            # Sort the list only if it's broken on multiple lines (heuristic)
            list_sorted = self.alphabetizer.sorted(list_in)

            self.indentation_level += 1
            output = [self.indent_str + self.encode(element) for element in list_sorted]
            self.indentation_level -= 1

            return "[\n" + ",\n".join(output) + "\n" + self.indent_str + "]"

    def _encode_dict(self, dict_in):
        """Encode a dict, sorting it if its element count is above the threshold."""

        # Sort keys for word lists only
        if len(dict_in.keys()) > self.dict_sort_threshold:
            dict_in = dict(self.alphabetizer.sorted(dict_in.items(), key=lambda x: x[0]))

        self.indentation_level += 1
        output = [self.indent_str + self.encode(key) + ": " + self.encode(val) for (key, val) in dict_in.items()]
        self.indentation_level -= 1

        return "{\n" + ",\n".join(output) + "\n" + self.indent_str + "}"

    @property
    def indent_str(self) -> str:
        """Whitespace string to be used for indentation"""

        if isinstance(self.indent, int):
            return " " * (self.indentation_level * self.indent)
        elif isinstance(self.indent, str):
            return self.indentation_level * self.indent
        else:
            raise ValueError(
                "indent must either be of type int or str (is " + str(type(self.indent)) + ")"
            )
