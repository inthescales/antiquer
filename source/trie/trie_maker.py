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
		self.word = None
		self.final = False
		self.prefix = False
		
	def add_level(self, level):
		if level not in self.levels:
			self.levels.append(level)

	@property
	def dict(self):
		ret = {
			"letter": self.letter,
			"levels": self.levels,
			"following": {},
			"final": self.final
		}

		if self.word is not None:
			ret["word"] = self.word

		if self.prefix == True:
			ret["prefix"] = True

		for (key, node) in self.following.items():
			ret["following"][key] = node.dict

		return ret

class Trie:
	def __init__(self):
		self.initials = {}

	def add_word(self, word, level):
		if len(word) == 0:
			return

		current = None

		for (i, c) in list(enumerate(word)):
			if c == ".":
				current.final = True
				return current

			if c == "-":
				current.prefix = True
				return current

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
		
		return current

	@property
	def dict(self):
		ret = {}
		for (key, val) in self.initials.items():
			ret[key] = val.dict

		return ret

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
replacement = json_data["replacement"]

for (key, word_set) in replacement.items():
	level = key

	for (word, forms) in word_set.items():
		for form in forms:
			final_node = trie.add_word(form, level)
			final_node.word = word

out_dict = {
	"prefixes": prefixes,
	"trie": trie.dict
}

# Write data

with open(output_filename, "w") as trie_file:
	trie_file.write(json.dumps(out_dict))
