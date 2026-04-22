import json
import sys
from pathlib import Path

# Add the python folder to the import path.
BASE_DIR = Path(__file__).resolve().parent
# Make the algorithms package importable from this script.
sys.path.insert(0, str(BASE_DIR))

# Pull in the top-level dispatch function.
from dispatcher import dispatch  # noqa: E402


# Read JSON from stdin, execute the matching algorithm, and write JSON to stdout.
def main():
    # Read the complete request payload from stdin.
    raw = sys.stdin.read() or "{}"
    # Parse the JSON request object.
    data = json.loads(raw)
    # Pull out the operation name.
    operation = data.get("operation")
    # Pull out the operation payload.
    payload = data.get("payload", {})
    # Run the selected algorithm.
    result = dispatch(operation, payload)
    # Write the result object back to stdout as JSON.
    sys.stdout.write(json.dumps(result))


# Catch all exceptions and return them as JSON errors.
if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        sys.stdout.write(json.dumps({"error": str(exc)}))
        sys.exit(1)
