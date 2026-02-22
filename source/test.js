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
		errors = errors.concat([[word, expected, result, dLevel, lLevel]]);
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
test("larvae", "larvæ", "off", "low");

// Extra ligature replacement
test("egypt", "egypt", "off", "low");
test("aegypt", "aegypt", "off", "low");
test("aegypt", "ægypt", "off", "high");
test("egypt", "ægypt", "off", "high");

// Entries with dots only match at word end
test("dais", "daïs", "high", "off")
test("daisy", "daisy", "high", "off")
test("\"daisy\"", "\"daisy\"", "high", "off")

// Entries with dashes only match in prefixes
test("eco-friendly", "œco-friendly", "off", "high")
test("ecoute", "ecoute", "off", "high")
test("eco", "eco", "off", "high")

// Conversions go correctly with extra text on either side
test("deescalate, please", "deëscalate, please", "low", "low")
test("half-demon", "half-dæmon", "low", "low")
test("a \"caique\"", "a \"caïque\"", "low", "low")
test("But, cooperation is key", "But, coöperation is key", "low", "low")
test("eco-naifs", "œco-naïfs", "high", "high")

// Case is preserved
test("chloe", "chloë", "low", "low")
test("Chloe", "Chloë", "low", "low")
test("ChLoE", "ChLoË", "low", "low")
test("CHLOE", "CHLOË", "low", "low")
test("re-earn", "reëarn", "low", "low")
test("Re-Earn", "Reëarn", "low", "low")
test("RE-EARN", "REËARN", "low", "low")
test("Economy", "Œconomy", "low", "low")
test("Moirae", "Mœræ", "off", "high")
test("MOIRAE", "MŒRÆ", "off", "high")

// Special tests for 'manœuvre'
test("manoeuvre", "manœuvre", "off", "low")
test("maneuver", "manœuvre", "off", "low")
test("maneuvering", "manœuvring", "off", "low")
test("maneuvers", "manœuvres", "off", "low")
test("maneuverer", "manœuvrer", "off", "low")

test("phoebe", "phoebë", "high", "off")
test("phoebe", "phœbe", "off", "low")
test("phoebe", "phœbë", "high", "low")

if (errors.length > 0) {
	console.log(errors.length + " ERRORS:");
	for (var i = 0; i < errors.length; i++) {
		const error = errors[i];
		console.log(" - " + error[0] + " -/-> " + error[1] + "\t\t(got '" + error[2] + "')\t\t(" + error[3] + ", " + error[4] + ")")
	}
} else {
	console.log("All tests passed");
}
