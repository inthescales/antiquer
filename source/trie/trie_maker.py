import json
import sys

# ==============================================
# CONFIGURATION
# ==============================================

pattern_filename = sys.argv[1]
output_filename = sys.argv[2]

# ==============================================
# TYPE DEFINITIONS
# ==============================================

class Node:
	def __init__(self, letter, level):
		self.letter = letter
		self.levels = [level]
		self.following = {}
		self.transforms = None
		
	def add_level(self, level):
		if level not in self.levels:
			self.levels.append(level)

	@property
	def dict(self):
		ret = {
			"letter": self.letter,
			"levels": self.levels,
			"following": {}
		}

		if self.transforms is not None:
			ret["transforms"] = self.transforms

		for (key, node) in self.following.items():
			ret["following"][key] = node.dict

		return ret

class Trie:
	def __init__(self):
		self.initials = {}

	def add_word(self, word, replace, level):
		if len(word) == 0:
			return

		current = None

		final_only = False
		prefix_only = False

		for (i, c) in list(enumerate(word)):
			if c == ".":
				final_only = True
				continue

			elif c == "-":
				prefix_only = True
				continue

			if current is None:
				if c not in self.initials:
					current = Node(c, level)
					self.initials[c] = current
				else:
					current = self.initials[c]
					current.add_level(level)
			else:
				if c not in current.following:
					current.following[c] = Node(c, level)
					current = current.following[c]
				else:
					current = current.following[c]
					current.add_level(level)
		
		# Create transform dict

		transform_dict = { "form": replace }
		if final_only:
			transform_dict["final"] = True
		if prefix_only:
			transform_dict["prefix"] = True

		if current.transforms == None:
			current.transforms = {}

		current.transforms[level] = transform_dict

	@property
	def dict(self):
		ret = {}
		for (key, val) in self.initials.items():
			ret[key] = val.dict

		return ret

# ==============================================
# HELPERS
# ==============================================

def expand_compact(form):
	"""
	Expand a single word string from the data into a set of forms that should be converted.

	Returns a tuple containing:
	- The input form to be accepted
	- A list of the variant choices made to arrive at that form
	"""
	buffer = ""
	results = []

	def flush():
		nonlocal buffer, results

		if len(results) == 0:
			results.append([buffer, []])
		else:
			results = [[r + buffer, c] for (r, c) in results]
		buffer = ""

	for char in form:
		if char == "[":
			flush()
		elif char == "]":
			variants = buffer.split(",")
			results = [[r + v, c + [v]] for v in variants for (r, c) in results]
			buffer = ""
		else:
			buffer += char

	flush()

	return results

def substitute_word(word, choices):
	"""Apply substitutions to a replacement form, based on the list of choices."""

	result = word

	# Remove behavior indicators from choices
	choices = [c.replace(".", "") for c in choices]

	for i in range(0, len(choices)):
		result = result.replace(f"[{i}]", choices[i])

	return result

# ==============================================
# EXECUTION
# ==============================================

# Read data

json_data = None
with open(pattern_filename, "r", encoding="utf-8-sig") as pattern_data:
	text = pattern_data.read()
	json_data = json.loads(text)

# Build trie

trie = Trie()

prefixes = json_data["prefixes"]
levels = json_data["levels"]
categories = json_data["categories"]

for (level, level_categories) in levels.items():
	for category in level_categories:
		for (word, forms) in categories[category].items():
			for unpacked in [f for form in forms for f in expand_compact(form)]:
				input_form = unpacked[0]
				choices = unpacked[1]
				result_form = substitute_word(word, choices)
				trie.add_word(input_form, result_form, level)

out_dict = {
	"prefixes": prefixes,
	"trie": trie.dict
}

# Write data

with open(output_filename, "w") as trie_file:
	trie_file.write(json.dumps(out_dict))
