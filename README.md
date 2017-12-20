# Antiquer
A browser extension that adds diaereses and ligatures to English text.

Examples:
- "cooperate" and "co-operate" both become "coöperate".
- "demon" and "daemon" both become "dæmon".

Inhabit an alternate universe where the conventions of English writing style developed differently!

Usable in Chrome and Firefox.

## How to Build

Use bundle.sh to prepare the extension for development or release.

Usage: bundle.sh [mode] [platform]

mode:
- clean:   Clean all temporary bundle files.
- develop: Copy all needed files to a develop directory that can be loaded for testing.
- release: Copy all release files to a zip file consumable by the Chrome store.

platform (required after develop, release):
- chrome
- firefox