# Antiquer

Antiquer is a browser extension, available for [Firefox](https://addons.mozilla.org/en-US/firefox/addon/antiquer/) and [Chrome](https://chromewebstore.google.com/detail/antiquer/aeohocibnlhpihlgjfbhdmbfljcjjajp?hl=en), that applies certain now-archaic elements of English writing style to web pages.

The two stylistic elements that are available with Antiquer are diaereses and ae- and oe- ligatures.

Examples of diaereses:
- "cooperate", "co-operate"	-> "coöperate"
- "reelect", "re-elect"		-> "reëlect"

Examples of ligatures:
- "demon", "daemon" 		-> "dæmon"
- "fetus", "foetus"			-> 'fœtus'

## How to Build

Use `bundle.sh` to prepare the extension for development or release.

```
Usage: bundle.sh [mode] [platform]
```

mode:
- `clean`:		Clean all temporary bundle files.
- `develop`:	Copy all needed files to a develop directory that can be loaded for testing.
- `release`:	Copy all release files to a zip file consumable by the Chrome store.
- `test`:		Used by test script.

platform (required after develop, release):
- `chrome`
- `firefox`

## Testing

Use `test.sh` to run unit tests.
