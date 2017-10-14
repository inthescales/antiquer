# diaeresizer
A Chrome extension that uses diaereses in place of alternate spelling forms.

Example: "cooperate" and "co-operate" both become "coöperate".

Inhabit an alternate universe where the conventions of English writing style developed differently!

# How to Build

Use bundle.sh to prepare the extension for development or release.

Usage: bundle.sh [mode]

mode:
- clean:   Clean all temporary bundle files.
- develop: Copy all needed files to a develop directory that can be loaded for testing.
- Release: Copy all release files to a zip file consumable by the Chrome store.