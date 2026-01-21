import getopt
import json
import sys

from collections import OrderedDict

from js_encoder import PatternsEncoder

# Read command input --------------------

opts, params = getopt.getopt(sys.argv[1:], "i", ["in-place"])

in_place = False
data_path = "data/patterns.json"

for opt, arg in opts:
    if opt in ["-i", "--in-place"]:
        in_place = True

if len(params) > 0:
    data_path = params[0]

# Read data -----------------------------

json_data = None

with open(data_path, "r", encoding="utf-8-sig") as file_data:
    json_data = json.loads(file_data.read())

# Output data ---------------------------

output = json.dumps(json_data, ensure_ascii=False, cls=PatternsEncoder, indent=4)
output += "\n"

if in_place:
    with open(data_path, "w", encoding="utf-8-sig") as file_data:
        file_data.write(output)
else:
    print(output)
