import json
import os
import sqlite3
import sys
import time
from datetime import datetime, timedelta, timezone
from functools import wraps
from pathlib import Path

import jwt
from dotenv import load_dotenv
from flask import Flask, g, jsonify, request
from flask_cors import CORS
from werkzeug.security import check_password_hash, generate_password_hash
import google.generativeai as genai

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

sys.path.insert(0, str(BASE_DIR / "python"))
from cli_runner import dispatch  # noqa: E402
from algorithms.utils import shannon_entropy  # noqa: E402

app = Flask(__name__)
CORS(app)

PORT = int(os.getenv("PORT", "5000"))
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret")
DB_PATH = os.getenv("SQLITE_DB_PATH", str(BASE_DIR / "cryptovault.db"))

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


ANALYSIS_COMPARISON = [
    {"name": "Substitution", "category": "Classical", "keySize": "26 letters", "blockSize": "N/A", "securityLevel": "Low"},
    {"name": "Double Transposition", "category": "Classical", "keySize": "Permutation keys", "blockSize": "Grid", "securityLevel": "Low-Medium"},
    {"name": "DES", "category": "Symmetric", "keySize": "56-bit (effective)", "blockSize": "64-bit", "securityLevel": "Deprecated"},
    {"name": "AES", "category": "Symmetric", "keySize": "128/192/256-bit", "blockSize": "128-bit", "securityLevel": "High"},
    {"name": "RSA", "category": "Public-Key", "keySize": "1024+ (demo uses smaller)", "blockSize": "Integer modulus", "securityLevel": "High with large keys"},
    {"name": "ECC", "category": "Public-Key", "keySize": "Small vs RSA equivalent", "blockSize": "Point operations", "securityLevel": "High"},
]

ANALYSIS_SECURITY = [
    {
        "algorithm": "Substitution",
        "strengths": ["Simple to understand"],
        "weaknesses": ["Small key space for practical attacks"],
    },
    {
        "algorithm": "DES",
        "strengths": ["Strong pedagogical structure"],
        "weaknesses": ["Short key; vulnerable to brute force"],
    },
    {
        "algorithm": "AES",
        "strengths": ["Modern standard", "Fast and secure with correct modes"],
        "weaknesses": ["Implementation mistakes can break security"],
    },
    {
        "algorithm": "RSA",
        "strengths": ["Mature public key system"],
        "weaknesses": ["Weak keys are factorable; padding mistakes are dangerous"],
    },
    {
        "algorithm": "ECC",
        "strengths": ["Strong security at small key sizes"],
        "weaknesses": ["Hard to implement safely without careful validation"],
    },
]


def utc_now_iso():
    return datetime.now(timezone.utc).isoformat()


def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
    return g.db


@app.teardown_appcontext
def close_db(_error):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    db = sqlite3.connect(DB_PATH)
    db.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
        """
    )
    db.execute(
        """
        CREATE TABLE IF NOT EXISTS algorithm_runs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            route TEXT NOT NULL,
            input_json TEXT NOT NULL,
            output_json TEXT NOT NULL,
            notes TEXT NOT NULL DEFAULT '',
            favorite INTEGER NOT NULL DEFAULT 0,
            tags_json TEXT NOT NULL DEFAULT '[]',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
        """
    )
    db.execute(
        """
        CREATE TABLE IF NOT EXISTS benchmarks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            algorithm TEXT NOT NULL,
            operation TEXT NOT NULL,
            input_size INTEGER NOT NULL,
            duration_ms REAL NOT NULL,
            created_at TEXT NOT NULL
        )
        """
    )
    db.execute("CREATE INDEX IF NOT EXISTS idx_runs_user_id ON algorithm_runs(user_id)")
    db.commit()
    db.close()


init_db()


def make_token(user):
    payload = {
        "userId": user["id"],
        "email": user["email"],
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def token_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"message": "Missing bearer token"}), 401
        token = auth_header[7:]
        try:
            decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            request.user = {"userId": int(decoded["userId"]), "email": decoded["email"]}
        except Exception:
            return jsonify({"message": "Invalid or expired token"}), 401
        return fn(*args, **kwargs)

    return wrapper


def row_to_user(row):
    return {
        "id": row["id"],
        "name": row["name"],
        "email": row["email"],
        "createdAt": row["created_at"],
    }


def row_to_run(row):
    return {
        "id": row["id"],
        "userId": row["user_id"],
        "route": row["route"],
        "input": json.loads(row["input_json"]),
        "output": json.loads(row["output_json"]),
        "notes": row["notes"],
        "favorite": bool(row["favorite"]),
        "tags": json.loads(row["tags_json"]),
        "createdAt": row["created_at"],
        "updatedAt": row["updated_at"],
    }


@app.get("/api/health")
def health_check():
    return jsonify({"ok": True, "service": "cryptovault-flask-server"})


@app.post("/api/auth/register")
def register():
    body = request.get_json(silent=True) or {}
    name = (body.get("name") or "").strip()
    email = (body.get("email") or "").strip().lower()
    password = body.get("password") or ""

    if len(name) < 2 or "@" not in email or len(password) < 6:
        return jsonify({"message": "Invalid registration payload"}), 400

    db = get_db()
    existing = db.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
    if existing:
        return jsonify({"message": "Email already in use"}), 409

    now = utc_now_iso()
    password_hash = generate_password_hash(password)
    cursor = db.execute(
        "INSERT INTO users (name, email, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
        (name, email, password_hash, now, now),
    )
    db.commit()

    user_row = db.execute("SELECT id, name, email, created_at FROM users WHERE id = ?", (cursor.lastrowid,)).fetchone()
    user = row_to_user(user_row)
    token = make_token(user)
    return jsonify({"token": token, "user": {"id": user["id"], "name": user["name"], "email": user["email"]}}), 201


@app.post("/api/auth/login")
def login():
    body = request.get_json(silent=True) or {}
    email = (body.get("email") or "").strip().lower()
    password = body.get("password") or ""

    if "@" not in email or not password:
        return jsonify({"message": "Invalid credentials"}), 401

    db = get_db()
    row = db.execute(
        "SELECT id, name, email, password_hash, created_at FROM users WHERE email = ?",
        (email,),
    ).fetchone()

    if not row or not check_password_hash(row["password_hash"], password):
        return jsonify({"message": "Invalid credentials"}), 401

    user = {"id": row["id"], "name": row["name"], "email": row["email"], "createdAt": row["created_at"]}
    token = make_token(user)
    return jsonify({"token": token, "user": {"id": user["id"], "name": user["name"], "email": user["email"]}})


@app.get("/api/auth/me")
@token_required
def auth_me():
    db = get_db()
    row = db.execute(
        "SELECT id, name, email, created_at FROM users WHERE id = ?",
        (request.user["userId"],),
    ).fetchone()
    if not row:
        return jsonify({"message": "User not found"}), 404
    return jsonify({"user": row_to_user(row)})


@app.get("/api/users/me")
@token_required
def users_me():
    return auth_me()


@app.post("/api/users/runs")
@token_required
def create_run():
    body = request.get_json(silent=True) or {}
    route = body.get("route")
    input_payload = body.get("input")
    output_payload = body.get("output")
    notes = body.get("notes", "")
    favorite = bool(body.get("favorite", False))
    tags = body.get("tags", [])

    if not route or input_payload is None or output_payload is None:
        return jsonify({"message": "route, input, and output are required"}), 400

    now = utc_now_iso()
    db = get_db()
    cursor = db.execute(
        """
        INSERT INTO algorithm_runs
        (user_id, route, input_json, output_json, notes, favorite, tags_json, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            request.user["userId"],
            route,
            json.dumps(input_payload),
            json.dumps(output_payload),
            notes,
            1 if favorite else 0,
            json.dumps(tags),
            now,
            now,
        ),
    )
    db.commit()
    row = db.execute("SELECT * FROM algorithm_runs WHERE id = ?", (cursor.lastrowid,)).fetchone()
    return jsonify({"run": row_to_run(row)}), 201


@app.get("/api/users/runs")
@token_required
def list_runs():
    db = get_db()
    rows = db.execute(
        "SELECT * FROM algorithm_runs WHERE user_id = ? ORDER BY created_at DESC LIMIT 100",
        (request.user["userId"],),
    ).fetchall()
    runs = [row_to_run(row) for row in rows]
    return jsonify({"runs": runs})


@app.patch("/api/users/runs/<int:run_id>")
@token_required
def update_run(run_id):
    body = request.get_json(silent=True) or {}

    db = get_db()
    existing = db.execute(
        "SELECT * FROM algorithm_runs WHERE id = ? AND user_id = ?",
        (run_id, request.user["userId"]),
    ).fetchone()
    if not existing:
        return jsonify({"message": "Run not found"}), 404

    notes = body.get("notes", existing["notes"])
    favorite = body.get("favorite")
    if favorite is None:
        favorite = bool(existing["favorite"])
    tags = body.get("tags")
    if tags is None:
        tags = json.loads(existing["tags_json"])

    now = utc_now_iso()
    db.execute(
        "UPDATE algorithm_runs SET notes = ?, favorite = ?, tags_json = ?, updated_at = ? WHERE id = ? AND user_id = ?",
        (notes, 1 if bool(favorite) else 0, json.dumps(tags), now, run_id, request.user["userId"]),
    )
    db.commit()

    row = db.execute("SELECT * FROM algorithm_runs WHERE id = ?", (run_id,)).fetchone()
    return jsonify({"run": row_to_run(row)})


@app.delete("/api/users/runs/<int:run_id>")
@token_required
def delete_run(run_id):
    db = get_db()
    row = db.execute(
        "SELECT id FROM algorithm_runs WHERE id = ? AND user_id = ?",
        (run_id, request.user["userId"]),
    ).fetchone()
    if not row:
        return jsonify({"message": "Run not found"}), 404

    db.execute("DELETE FROM algorithm_runs WHERE id = ? AND user_id = ?", (run_id, request.user["userId"]))
    db.commit()
    return jsonify({"ok": True})


@app.post("/api/crypto/<path:operation>")
def run_crypto(operation):
    payload = request.get_json(silent=True) or {}
    try:
        result = dispatch(operation, payload)
        if isinstance(result, dict) and result.get("error"):
            return jsonify({"message": result["error"]}), 400
        return jsonify(result)
    except Exception as exc:
        return jsonify({"message": str(exc)}), 400


@app.post("/api/ai/explain")
def explain_step():
    if not GEMINI_API_KEY:
        return jsonify({"message": "Gemini API Key is not configured in the server environment. Please set GEMINI_API_KEY in server/.env."}), 500
    
    body = request.get_json(silent=True) or {}
    algo = body.get("algo", "Unknown")
    step_data = body.get("stepData", {})
    text = body.get("text", "")
    
    prompt = f"""You are an expert cryptography tutor. Explain the following specific step of the {algo} algorithm in a simple, beginner-friendly way, like "Explain Like I'm 5".
    
    Context:
    - User Input Text: {text}
    - Step Data: {json.dumps(step_data)}
    
    Keep your explanation to 2-3 short, engaging paragraphs. Focus exactly on what the 'Step Data' is showing and how it mathematically or logically transforms the data."""
    
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        return jsonify({"explanation": response.text})
    except Exception as e:
        return jsonify({"message": f"LLM Error: {str(e)}"}), 500


def time_operation(fn):
    start = time.perf_counter()
    fn()
    return (time.perf_counter() - start) * 1000


@app.post("/api/benchmarks/run")
def run_benchmarks():
    body = request.get_json(silent=True) or {}
    sizes = body.get("sizes", [10, 100, 1000])
    results = []

    for size in sizes:
        plain = "a" * int(size)
        size_bytes = len(plain.encode("utf-8"))

        sub_res = None
        def run_sub():
            nonlocal sub_res
            sub_res = dispatch("classical/substitution/encrypt", {"text": plain, "key": "phqgiumeaylnofdxkrcvstzwbj"})
        sub_ms = time_operation(run_sub)

        trans_res = None
        def run_trans():
            nonlocal trans_res
            trans_res = dispatch("classical/transposition/encrypt", {"text": plain, "keyA": "2,0,1", "keyB": "1,2,0"})
        trans_ms = time_operation(run_trans)

        des_res = None
        def run_des():
            nonlocal des_res
            des_res = dispatch("symmetric/des/encrypt", {"text": plain[:8], "key": "secret!!"})
        des_ms = time_operation(run_des)

        aes_res = None
        def run_aes():
            nonlocal aes_res
            aes_res = dispatch("symmetric/aes/encrypt", {"text": plain[:16], "key": "sixteen-char-key"})
        aes_ms = time_operation(run_aes)

        rsa_res = None
        def run_rsa():
            nonlocal rsa_res
            key = dispatch("public/rsa/keygen", {"bitSize": 32})
            rsa_res = dispatch("public/rsa/encrypt", {"message": plain[:4], "publicKey": key["publicKey"]})
        rsa_ms = time_operation(run_rsa)

        ecc_ms = time_operation(
            lambda: dispatch("public/ecc/ecdh", {"p": "97", "a": "2", "privateA": "5", "privateB": "7"})
        )

        def make_entry(name, ms, output_text):
            return {
                "algorithm": name,
                "operation": "encrypt",
                "inputSize": int(size),
                "durationMs": ms,
                "throughputKbps": (size_bytes / ms) if ms > 0 else 0,
                "entropy": shannon_entropy(output_text) if output_text else 0
            }

        results.extend([
            make_entry("Substitution", sub_ms, sub_res.get("text")),
            make_entry("Double Transposition", trans_ms, trans_res.get("ciphertext")),
            make_entry("DES", des_ms, des_res.get("ciphertextHex")),
            make_entry("AES", aes_ms, aes_res.get("ciphertextHex")),
            make_entry("RSA", rsa_ms, rsa_res.get("ciphertext")),
            make_entry("ECC", ecc_ms, "fixed-size-output-not-text")
        ])

    now = utc_now_iso()
    db = get_db()
    for result in results:
        db.execute(
            "INSERT INTO benchmarks (algorithm, operation, input_size, duration_ms, created_at) VALUES (?, ?, ?, ?, ?)",
            (result["algorithm"], result["operation"], result["inputSize"], result["durationMs"], now),
        )
    db.commit()

    return jsonify({"results": results})


@app.get("/api/benchmarks/history")
def benchmark_history():
    db = get_db()
    rows = db.execute(
        "SELECT id, algorithm, operation, input_size, duration_ms, created_at FROM benchmarks ORDER BY created_at DESC LIMIT 200"
    ).fetchall()
    data = [
        {
            "id": row["id"],
            "algorithm": row["algorithm"],
            "operation": row["operation"],
            "inputSize": row["input_size"],
            "durationMs": row["duration_ms"],
            "createdAt": row["created_at"],
        }
        for row in rows
    ]
    return jsonify({"rows": data})


@app.get("/api/analysis/comparison")
def analysis_comparison():
    return jsonify({"algorithms": ANALYSIS_COMPARISON})


@app.get("/api/analysis/security")
def analysis_security():
    return jsonify({"entries": ANALYSIS_SECURITY})


@app.errorhandler(404)
def handle_404(_err):
    return jsonify({"message": "Not found"}), 404


@app.errorhandler(Exception)
def handle_error(err):
    return jsonify({"message": str(err)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT, debug=True)
