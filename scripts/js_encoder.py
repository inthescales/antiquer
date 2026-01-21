import json

from alphabetizer import Alphabetizer

class PatternsEncoder(json.JSONEncoder):
    """Custom JSON encoder for formatting the patterns file"""

    dict_sort_threshold = 4
    """The minimum number of elements in a dict for it to be sorted"""

    list_break_threshold = 8
    """The minimum number of elements in a list for it to be broken onto multiple lines"""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.alphabetizer = Alphabetizer()
        self.indentation_level = 0

    def encode(self, o):
        if isinstance(o, list):
        	return self._encode_list(o)
        elif isinstance(o, dict):
            return self._encode_object(o)

        return json.dumps(
            o,
            skipkeys=self.skipkeys,
            ensure_ascii=self.ensure_ascii,
            check_circular=self.check_circular,
            allow_nan=self.allow_nan,
            sort_keys=self.sort_keys,
            indent=self.indent,
            separators=(self.item_separator, self.key_separator),
            default=self.default if hasattr(self, "default") else None,
        )

    def _encode_list(self, o):
        if len(o) < self.list_break_threshold:
            return "[" + ", ".join(self.encode(el) for el in o) + "]"
        else:
            sorted_o = self.alphabetizer.sorted(o)
            self.indentation_level += 1
            output = [self.indent_str + self.encode(el) for el in sorted_o]
            self.indentation_level -= 1
            return "[\n" + ",\n".join(output) + "\n" + self.indent_str + "]"

    def _encode_object(self, o):
        if not o:
            return "{}"

        # Sort keys for word lists only
        if len(o.keys()) > self.dict_sort_threshold:
            o = dict(self.alphabetizer.sorted(o.items(), key=lambda x: x[0]))

        self.indentation_level += 1
        output = [
            f"{self.indent_str}{self.encode(k)}: {self.encode(v)}" for k, v in o.items()
        ]
        self.indentation_level -= 1

        return "{\n" + ",\n".join(output) + "\n" + self.indent_str + "}"

    @property
    def indent_str(self) -> str:
        if isinstance(self.indent, int):
            return " " * (self.indentation_level * self.indent)
        elif isinstance(self.indent, str):
            return self.indentation_level * self.indent
        else:
            raise ValueError(
                f"indent must either be of type int or str (is: {type(self.indent)})"
            )
