const fs = require("fs");
const a = require("../test/antiquer.js")

const trie = JSON.parse(fs.readFileSync("test/trie.json", 'utf8'));

function replace(word, dLevel, lLevel) {
	return a.replace(word, dLevel, lLevel, trie["trie"], trie["prefixes"]);
}

var errors = [];

function test(word, expected, dLevel, lLevel) {
	const result = replace(word, dLevel, lLevel);
	if (result != expected) {
		errors = errors.concat([[word, expected, dLevel, lLevel]]);
	}
}

// Off
test("cooperate", "cooperate", "off", "off");
test("co-operate", "co-operate", "off", "off");
test("co-ogle", "co-ogle", "off", "off");
test("fetus", "fetus", "off", "off");

// Standard diaeresis replacement
test("cooperate", "coöperate", "low", "off");
test("co-operate", "coöperate", "low", "off");
test("re-elect", "reëlect", "low", "low");

// Extra diaeresis replacement
test("coauthor", "coauthor", "low", "off");
test("coauthor", "coäuthor", "high", "off");

// Prefixes
test("co-oomfie", "coöomfie", "low", "off");
test("co-auntie", "co-auntie", "low", "high");
test("co-okapi", "coökapi", "high", "off");
test("co-auger", "coäuger", "high", "off");
test("foo-organize", "foo-organize", "low", "high");
test("mondo-orthodox", "mondo-orthodox", "high", "low");
test("parti-influence", "parti-influence", "high", "high");

// Combined prefix replacement and diaeresization
test("eco-organizer", "eco-organizer", "off, off")
test("eco-organizer", "ecoörganizer", "low", "off")
test("eco-organizer", "œco-organizer", "off", "high")
test("eco-organizer", "œcoörganizer", "low", "high")

// Standard ligature replacement
test("demon", "dæmon", "off", "low");
test("daemon", "dæmon", "low", "low");

// Extra ligature replacement
test("egypt", "egypt", "off", "low");
test("aegypt", "aegypt", "off", "low");
test("aegypt", "ægypt", "off", "high");
test("egypt", "ægypt", "off", "high");

if (errors.length > 0) {
	console.log(errors.length + " ERRORS:");
	for (var i = 0; i < errors.length; i++) {
		const error = errors[i];
		console.log(" - " + error[0] + " != " + error[1] + "\t(" + error[2] + ", " + error[3] + ")")
	}
} else {
	console.log("All tests passed");
}
