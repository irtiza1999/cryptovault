import json
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

from dispatcher import dispatch  # noqa: E402


def main():
    """Read a JSON request from stdin, dispatch it, and write JSON to stdout."""
    raw = sys.stdin.read() or "{}"
    data = json.loads(raw)
    operation = data.get("operation")
    payload = data.get("payload", {})
    result = dispatch(operation, payload)
    sys.stdout.write(json.dumps(result))


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        sys.stdout.write(json.dumps({"error": str(exc)}))
        sys.exit(1)
