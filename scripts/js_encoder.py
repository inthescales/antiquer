import json

from alphabetizer import Alphabetizer

class PatternsEncoder(json.JSONEncoder):
    """Custom JSON encoder for formatting the patterns file."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.alphabetizer = Alphabetizer()
        self.indentation_level = 0

    def encode(self, obj):
        if isinstance(obj, list):
        	return self._encode_list(obj)
        elif isinstance(obj, dict):
            return self._encode_dict(obj)

        return self.default_encode(obj)

    def default_encode(self, obj):
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

    def _encode_list(self, list_in, one_line=False, sort=False):
        """Encode a list with the given styling parameters."""

        list_elements = list_in
        if sort:
            list_elements = self.alphabetizer.sorted(list_in)

        if one_line:
            return "[" + ", ".join([self.encode(element) for element in list_elements]) + "]"
        else:
            self.indentation_level += 1
            output = [self.indent_str + self.encode(element) for element in list_elements]
            self.indentation_level -= 1

            return "[\n" + ",\n".join(output) + "\n" + self.indent_str + "]"

    def _encode_dict(self, dict_in, chain=[]):
        """Encode a dict, determining style for any contained lists based on its parentage chain."""

        is_word_list = "categories" in chain

        if is_word_list:
            dict_in = dict(self.alphabetizer.sorted(dict_in.items(), key=lambda x: x[0]))

        self.indentation_level += 1
        output = []
        for (key, val) in dict_in.items():
            if type(val) == dict:
                output.append(self.indent_str + self.encode(key) + ": " + self._encode_dict(val, chain + [key]))
            elif type(val) == list:
                output.append(self.indent_str + self.encode(key) + ": " + self._encode_list(val, one_line=is_word_list, sort=is_word_list))
            else:
                output.append(self.indent_str + self.encode(key) + ": " + self.default_encode(val))
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
