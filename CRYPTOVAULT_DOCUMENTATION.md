# CryptoVault — Complete Technical Documentation

> Educational cryptography platform: interactive algorithm lab, step-by-step visualizations, benchmarking, and AI-assisted learning.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Directory Structure](#3-directory-structure)
4. [File → Algorithm Quick Reference](#4-file--algorithm-quick-reference)
5. [Backend — Flask Server](#5-backend--flask-server)
   - [API Endpoints](#51-api-endpoints)
   - [Database Schema](#52-database-schema)
   - [Algorithm Dispatcher](#53-algorithm-dispatcher)
6. [Cryptographic Algorithms](#6-cryptographic-algorithms)
   - [Classical — Substitution Cipher](#61-classical--substitution-cipher)
   - [Classical — Double Transposition](#62-classical--double-transposition)
   - [Symmetric — DES (FIPS 46-3)](#63-symmetric--des-fips-46-3)
   - [Symmetric — AES (FIPS 197)](#64-symmetric--aes-fips-197)
   - [Public-Key — RSA](#65-public-key--rsa)
   - [Public-Key — ECDH](#66-public-key--ecdh)
   - [Cryptanalysis — Frequency Analysis](#67-cryptanalysis--frequency-analysis)
   - [Cryptanalysis — Pollard's Rho Factorization](#68-cryptanalysis--pollards-rho-factorization)
7. [Shared Utilities](#7-shared-utilities)
8. [Frontend — React Application](#8-frontend--react-application)
   - [Pages](#81-pages)
   - [Components](#82-components)
   - [3D Visualizations](#83-3d-visualizations)
   - [API Service Layer](#84-api-service-layer)
9. [Data Flow — End-to-End Example](#9-data-flow--end-to-end-example)
10. [Dependencies](#10-dependencies)
11. [Setup & Running Locally](#11-setup--running-locally)

---

## 1. Project Overview

CryptoVault is a full-stack MERN-style application (React + Flask + SQLite) built for learning and experimenting with cryptographic algorithms. It covers classical ciphers, modern symmetric block ciphers, and public-key cryptography, all implemented from scratch in Python for educational transparency.

**Key goals:**
- Show every intermediate computation step, not just the final result
- Provide interactive 3D animations for each algorithm family
- Benchmark and compare algorithm performance in real time
- Allow an AI tutor (Gemini) to explain any step on demand
- Let users save and annotate algorithm runs in a personal vault

---

## 2. Architecture

```
Browser (React + Vite)
        │
        │  HTTP/REST (JSON)
        ▼
Flask Server (Python)           ← JWT auth, CORS, SQLite
        │
        │  Python function calls
        ▼
Algorithm Modules (Python)
  ├── classical.py
  ├── symmetric.py
  ├── public_key.py
  ├── attacks.py
  ├── common.py
  └── utils.py
```

- **Frontend**: React 19, Vite, React Router, Recharts, Three.js
- **Backend**: Flask 3, PyJWT, SQLite (via built-in `sqlite3`)
- **AI (optional)**: Google Generative AI (Gemini) for step explanations
- **Auth**: JWT bearer tokens, stored in `localStorage`

---

## 3. Directory Structure

```
cryptovault-mern/
├── client/                          # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── AlgorithmLab.jsx         # Main cipher playground
│   │   │   ├── Dashboard.jsx            # Status + benchmark charts
│   │   │   ├── InteractivePlayground.jsx# Step-by-step + 3D viewer
│   │   │   ├── Comparison.jsx           # Side-by-side benchmarks
│   │   │   ├── SecurityAnalysis.jsx     # Strengths / weaknesses
│   │   │   └── CipherChallenge.jsx      # Gamified decryption game
│   │   ├── components/
│   │   │   ├── Sidebar.jsx              # Navigation links
│   │   │   ├── ThemeSwitch.jsx          # Dark / light toggle
│   │   │   ├── ResultPanel.jsx          # Output wrapper
│   │   │   ├── AlgorithmInsightPanel.jsx# Per-algorithm trace views
│   │   │   ├── CryptoCube3D.jsx         # AES cube animation
│   │   │   ├── CipherRings3D.jsx        # Substitution rings
│   │   │   ├── TranspositionGrid3D.jsx  # Column shuffle grid
│   │   │   ├── FeistelTower3D.jsx       # DES Feistel tower
│   │   │   └── RSAClock3D.jsx           # RSA modexp clock
│   │   ├── services/
│   │   │   └── api.js                   # Axios wrappers
│   │   └── main.jsx                     # App entry
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── app.py                           # Flask app + all routes
│   ├── requirements.txt
│   ├── cryptovault.db                   # SQLite database
│   └── python/
│       ├── dispatcher.py                # Route string → function map
│       └── algorithms/
│           ├── classical.py
│           ├── symmetric.py
│           ├── public_key.py
│           ├── attacks.py
│           ├── common.py
│           └── utils.py
└── .env / server/.env.example
```

---

## 4. File → Algorithm Quick Reference

Every algorithm, utility, and frontend component mapped to its exact file.

### Backend — Python Algorithm Files

| File | Algorithm / Function | Purpose |
|------|---------------------|---------|
| `server/app.py` | — | Flask app, all HTTP routes, JWT auth, SQLite queries, Gemini AI proxy |
| `server/python/dispatcher.py` | `dispatch` | Shared route-string → algorithm function dispatcher |
| `server/python/cli_runner.py` | `main` | Read JSON from stdin, dispatch the operation, and write JSON to stdout |
| `server/python/algorithms/classical.py` | `normalize_sub_key` | Validates 26-letter substitution key |
| `server/python/algorithms/classical.py` | `substitution_transform` | Monoalphabetic substitution encrypt / decrypt |
| `server/python/algorithms/classical.py` | `double_trans_encrypt` | Double columnar transposition encryption |
| `server/python/algorithms/classical.py` | `double_trans_decrypt` | Double columnar transposition decryption |
| `server/python/algorithms/symmetric.py` | `_des_key_schedule` | DES key schedule — PC-1 → C/D split → 16 × PC-2 round keys (FIPS 46-3) |
| `server/python/algorithms/symmetric.py` | `_des_round_function` | DES F-function: E expansion, XOR key, 8 S-boxes, P permutation |
| `server/python/algorithms/symmetric.py` | `_des_process_block` | IP → 16 Feistel rounds → final swap → FP on one 64-bit block |
| `server/python/algorithms/symmetric.py` | `des_encrypt` | DES encryption in ECB or CBC mode |
| `server/python/algorithms/symmetric.py` | `des_decrypt` | DES decryption in ECB or CBC mode |
| `server/python/algorithms/symmetric.py` | `_aes_sub_bytes` / `_aes_inv_sub_bytes` | Rijndael S-box substitution (full 256-entry lookup table) |
| `server/python/algorithms/symmetric.py` | `_aes_shift_rows` / `_aes_inv_shift_rows` | AES row-shift step (column-major state) |
| `server/python/algorithms/symmetric.py` | `_aes_mix_columns` / `_aes_inv_mix_columns` | AES MixColumns / InvMixColumns via GF(2⁸) multiplication tables |
| `server/python/algorithms/symmetric.py` | `_aes_key_expansion` | FIPS 197 key expansion — RotWord, SubWord, Rcon → 11 round keys |
| `server/python/algorithms/symmetric.py` | `_aes_encrypt_block` | AES 10-round SPN block encryption |
| `server/python/algorithms/symmetric.py` | `aes_encrypt` | AES-128 encryption in ECB or CBC mode |
| `server/python/algorithms/symmetric.py` | `aes_decrypt` | AES-128 decryption in ECB or CBC mode |
| `server/python/algorithms/public_key.py` | `is_probable_prime` | Miller-Rabin primality test |
| `server/python/algorithms/public_key.py` | `generate_prime` | Random probable prime of given bit length |
| `server/python/algorithms/public_key.py` | `string_to_integer` | Pack text bytes into big integer (for RSA) |
| `server/python/algorithms/public_key.py` | `integer_to_string` | Unpack big integer into text bytes (for RSA) |
| `server/python/algorithms/public_key.py` | `rsa_keygen` | RSA key-pair generation (p, q, n, φ, e, d) |
| `server/python/algorithms/public_key.py` | `rsa_encrypt` | RSA encryption: c = mᵉ mod n |
| `server/python/algorithms/public_key.py` | `rsa_decrypt` | RSA decryption: m = cᵈ mod n |
| `server/python/algorithms/public_key.py` | `point_add` | Elliptic curve point addition over Fₚ |
| `server/python/algorithms/public_key.py` | `scalar_mult_trace` | Scalar multiplication k×G with step trace (double-and-add) |
| `server/python/algorithms/public_key.py` | `ecdh` | Full ECDH key exchange (Alice + Bob shared secret) |
| `server/python/algorithms/common.py` | `string_to_bits` / `bits_to_string` | String ↔ binary bit string |
| `server/python/algorithms/common.py` | `text_to_bytes` / `hex_to_bytes` / `bytes_to_hex` | Encoding conversions |
| `server/python/algorithms/common.py` | `chunk_text` / `flatten` | Matrix helpers for transposition cipher |
| `server/python/algorithms/common.py` | `inverse_permutation` / `parse_permutation` | Permutation utilities for transposition |
| `server/python/algorithms/common.py` | `gcd` / `egcd` / `mod_inverse` / `mod_inv` / `mod` | Number-theory math used by RSA and ECC |
| `server/python/algorithms/utils.py` | `shannon_entropy` | Compute H = −Σ pᵢ log₂(pᵢ) for benchmark quality metric |

---

### Frontend — Pages

| File | Page | What It Does |
|------|------|-------------|
| `client/src/pages/AlgorithmLab.jsx` | Algorithm Lab | Primary interactive cipher playground — select algorithm, enter inputs, view results |
| `client/src/pages/Dashboard.jsx` | Dashboard | Live cipher preview, benchmark trigger, runtime bar chart, API health status |
| `client/src/pages/InteractivePlayground.jsx` | Interactive Playground | Step-by-step trace viewer with auto-play, keyboard nav, 3D visuals, AI tutor |
| `client/src/pages/Comparison.jsx` | Comparison | Side-by-side benchmark charts, radar chart, algorithm spec table |
| `client/src/pages/SecurityAnalysis.jsx` | Security Analysis | Strengths / weaknesses cards for each algorithm |
| `client/src/pages/CipherChallenge.jsx` | Cipher Challenge | Gamified decryption game with timer, scoring, and hint system |

---

### Frontend — Components

| File | Component | What It Does |
|------|-----------|-------------|
| `client/src/components/Sidebar.jsx` | `Sidebar` | Navigation links to all pages |
| `client/src/components/ThemeSwitch.jsx` | `ThemeSwitch` | Dark / light mode toggle, persisted in localStorage |
| `client/src/components/ResultPanel.jsx` | `ResultPanel` | Output wrapper — handles loading state, delegates to AlgorithmInsightPanel |
| `client/src/components/AlgorithmInsightPanel.jsx` | `AlgorithmInsightPanel` | Main trace renderer — dispatches to sub-view per algorithm family |
| `client/src/components/AlgorithmInsightPanel.jsx` | `SubstitutionView` | Character-flow viz and mapping table |
| `client/src/components/AlgorithmInsightPanel.jsx` | `TranspositionView` | Column-permutation grid before/after each transposition step |
| `client/src/components/AlgorithmInsightPanel.jsx` | `DESView` | Feistel round trace with L/R bit visualization per round |
| `client/src/components/AlgorithmInsightPanel.jsx` | `AESView` | 4×4 hex state matrix heat-map, round-by-round progression |
| `client/src/components/AlgorithmInsightPanel.jsx` | `RSAView` | Key pair display and encrypt/decrypt result |
| `client/src/components/AlgorithmInsightPanel.jsx` | `ECCView` | Alice/Bob ECDH exchange, shared-secret match indicator, scalar mult trace |
| `client/src/components/CryptoCube3D.jsx` | `CryptoCube3D` | Three.js AES state as rotating 3D cube, per-operation animations |
| `client/src/components/CipherRings3D.jsx` | `CipherRings3D` | Three.js concentric rings for substitution mapping visualization |
| `client/src/components/TranspositionGrid3D.jsx` | `TranspositionGrid3D` | Three.js column-swap animation for transposition cipher |
| `client/src/components/FeistelTower3D.jsx` | `FeistelTower3D` | Three.js vertical tower of 16 Feistel rounds for DES |
| `client/src/components/RSAClock3D.jsx` | `RSAClock3D` | Three.js clock-face modular exponentiation visualization for RSA |

---

### Frontend — Service & Config

| File | What It Does |
|------|-------------|
| `client/src/services/api.js` | Axios wrappers: `runAlgorithm`, `runBenchmarks`, `fetchBenchmarkHistory`, `fetchComparison`, `fetchSecurity`, `askAITutor` |
| `client/src/main.jsx` | React app entry point, router setup |
| `client/src/App.jsx` | Root component, layout, theme context |
| `client/src/index.css` | Global styles, Tailwind / CSS variables |
| `client/vite.config.js` | Vite build config, dev server proxy |

---

### Route String → File → Function Lookup Table

| API Route (POST `/api/crypto/...`) | Python File | Function Called |
|------------------------------------|-------------|----------------|
| `classical/substitution/encrypt` | `classical.py` | `substitution_transform(text, key, decrypt=False)` |
| `classical/substitution/decrypt` | `classical.py` | `substitution_transform(text, key, decrypt=True)` |
| `classical/transposition/encrypt` | `classical.py` | `double_trans_encrypt(text, key_a, key_b)` |
| `classical/transposition/decrypt` | `classical.py` | `double_trans_decrypt(text, key_a, key_b)` |
| `symmetric/des/encrypt` | `symmetric.py` | `des_encrypt(text, key, mode, iv)` |
| `symmetric/des/decrypt` | `symmetric.py` | `des_decrypt(hex_text, key, mode, iv)` |
| `symmetric/aes/encrypt` | `symmetric.py` | `aes_encrypt(text, key, mode, iv)` |
| `symmetric/aes/decrypt` | `symmetric.py` | `aes_decrypt(hex_text, key, mode, iv)` |
| `public/rsa/keygen` | `public_key.py` | `rsa_keygen(bits)` |
| `public/rsa/encrypt` | `public_key.py` | `rsa_encrypt(message, public_key)` |
| `public/rsa/decrypt` | `public_key.py` | `rsa_decrypt(ciphertext, private_key)` |
| `public/ecc/ecdh` | `public_key.py` | `ecdh(payload)` |

---

## 5. Backend — Flask Server

### 5.1 API Endpoints

All API endpoints are prefixed with `/api`.

#### Authentication

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/auth/register` | Create account. Body: `{name, email, password}`. Returns JWT token. |
| `POST` | `/auth/login` | Login. Body: `{email, password}`. Returns JWT token. |
| `GET` | `/auth/me` | Get current user from bearer token. |
| `GET` | `/users/me` | Alias for `/auth/me`. |

JWT tokens carry `{user_id, name, email}` and expire after 24 hours. Protected routes require `Authorization: Bearer <token>`.

#### Algorithm Execution

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/crypto/<operation>` | Run any algorithm. `operation` is a slash-separated route string (e.g., `classical/substitution/encrypt`). Body is algorithm-specific JSON. |

The dispatcher maps route strings to Python functions:

```
classical/substitution/encrypt  →  substitution_transform(text, key, decrypt=False)
classical/substitution/decrypt  →  substitution_transform(text, key, decrypt=True)
classical/transposition/encrypt →  double_trans_encrypt(text, key_a, key_b)
classical/transposition/decrypt →  double_trans_decrypt(text, key_a, key_b)
symmetric/des/encrypt           →  des_encrypt(text, key, mode, iv)
symmetric/des/decrypt           →  des_decrypt(hex_text, key, mode, iv)
symmetric/aes/encrypt           →  aes_encrypt(text, key, mode, iv)
symmetric/aes/decrypt           →  aes_decrypt(hex_text, key, mode, iv)
public/rsa/keygen               →  rsa_keygen(bits)
public/rsa/encrypt              →  rsa_encrypt(message, public_key)
public/rsa/decrypt              →  rsa_decrypt(ciphertext, private_key)
public/ecc/ecdh                 →  ecdh(payload)
```

#### Run Management (authenticated)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/users/runs` | Save a run. Body: `{route, input, output, notes?, tags?}` |
| `GET` | `/users/runs` | List last 100 saved runs for current user. |
| `PATCH` | `/users/runs/<id>` | Update notes, tags, or favorite flag. |
| `DELETE` | `/users/runs/<id>` | Delete a saved run. |

#### Benchmarking

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/benchmarks/run` | Run benchmarks. Body: `{"sizes": [10, 100, 1000]}`. Measures time, throughput, entropy for all algorithms at each size. |
| `GET` | `/benchmarks/history` | Fetch last 200 benchmark results from database. |

#### Analysis

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/analysis/comparison` | Static metadata: key sizes, block sizes, security levels for all algorithms. |
| `GET` | `/analysis/security` | Strengths and weaknesses per algorithm. |

#### AI Tutor (optional)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/ai/explain` | Get Gemini AI explanation for a step. Body: `{algo, stepData, text}`. Requires `GEMINI_API_KEY` env var. |

#### Health

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Returns `{"status": "ok"}`. |

---

### 5.2 Database Schema

SQLite database at `server/cryptovault.db`.

#### `users`

```sql
CREATE TABLE users (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT NOT NULL,
  email        TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,        -- bcrypt or sha256 hash
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### `algorithm_runs`

```sql
CREATE TABLE algorithm_runs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER REFERENCES users(id),
  route       TEXT NOT NULL,          -- e.g. "classical/substitution/encrypt"
  input_json  TEXT,                   -- JSON-serialized input
  output_json TEXT,                   -- JSON-serialized output
  notes       TEXT,
  favorite    INTEGER DEFAULT 0,      -- boolean 0/1
  tags_json   TEXT,                   -- JSON array of strings
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_runs_user ON algorithm_runs(user_id);
```

#### `benchmarks`

```sql
CREATE TABLE benchmarks (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  algorithm   TEXT NOT NULL,
  operation   TEXT NOT NULL,
  input_size  INTEGER,
  duration_ms REAL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

### 5.3 Algorithm Dispatcher

`server/python/dispatcher.py` exposes the shared `dispatch(operation, payload)` entrypoint that maps route strings to algorithm functions. `server/python/cli_runner.py` reuses that same entrypoint for stdin/stdout execution, while Flask calls it for HTTP requests.

This keeps `app.py` clean of algorithm logic and makes adding new algorithms a one-line registration.

---

## 6. Cryptographic Algorithms

DES and AES are implemented to the full FIPS standard (FIPS 46-3 and FIPS 197 respectively) with complete permutation tables, real S-boxes, and correct GF(2⁸) arithmetic. Classical ciphers and public-key algorithms are also implemented from scratch in Python for educational transparency. None of these implementations use constant-time operations or padding standards and are not suitable for production security use.

---

### 6.1 Classical — Substitution Cipher

**File**: `server/python/algorithms/classical.py`  
**Functions**: `substitution_transform`, `normalize_sub_key`

#### What It Is

A monoalphabetic substitution cipher replaces each letter with a fixed different letter according to a 26-character permutation key. It is the oldest family of ciphers and is trivially broken by frequency analysis.

#### Key Format

The key must be exactly 26 lowercase letters, each appearing exactly once — a permutation of the alphabet. Example:

```
Alphabet:  a b c d e f g h i j k l m n o p q r s t u v w x y z
Key:       q w e r t y u i o p a s d f g h j k l z x c v b n m
```

This means `a → q`, `b → w`, `c → e`, etc.

#### Encryption Algorithm

```
INPUT:  text = "hello", key = "qwertyuiopasdfghjklzxcvbnm"

Build forward map:
  a→q, b→w, c→e, d→r, e→t, ..., z→m

For each character:
  h → i     (key[7]  = 'i')
  e → t     (key[4]  = 't')
  l → s     (key[11] = 's')
  l → s
  o → g     (key[14] = 'g')

OUTPUT: "itssg"
```

Non-alphabetic characters (spaces, digits, punctuation) pass through unchanged. Case is preserved: uppercase input maps to uppercase output using the same key.

#### Decryption Algorithm

Build the inverse mapping (swap key and alphabet):

```
If key[4] = 't', then the inverse maps 't' → 'e'
Apply inverse map to ciphertext letters
```

#### Step Trace (returned to frontend)

```json
{
  "text": "itssg",
  "steps": [
    {"index": 0, "in": "h", "out": "i"},
    {"index": 1, "in": "e", "out": "t"},
    {"index": 2, "in": "l", "out": "s"},
    {"index": 3, "in": "l", "out": "s"},
    {"index": 4, "in": "o", "out": "g"}
  ]
}
```

#### Line-by-Line Code Walkthrough

**`normalize_sub_key(key)` — `classical.py` lines 4–16**

```python
def normalize_sub_key(key):
    key = (key or "").lower()
    # Guard against None; lowercase for uniform comparison
    if len(key) != 26:
        raise ValueError("Substitution key must have 26 characters")
    # Exact 26-char length required — no more, no less
    if set(key) != set(ALPHABET):
        raise ValueError("Substitution key must be a permutation of a-z")
    # set(key) == set("abc...z") confirms every letter appears at least once
    # Combined with len==26 this proves every letter appears exactly once
    return key
    # Returns validated lowercase key ready for mapping
```

**`substitution_transform(text, key, decrypt)` — `classical.py` lines 19–52**

```python
def substitution_transform(text, key, decrypt=False):
    key = normalize_sub_key(key)
    # Validate key first so the rest of the function can trust it

    enc = {ALPHABET[i]: key[i] for i in range(26)}
    # enc["a"] = key[0], enc["b"] = key[1], ...
    # Maps each plaintext letter to its ciphertext substitute

    dec = {v: k for k, v in enc.items()}
    # Reverses enc: each ciphertext letter maps back to its plaintext letter
    # Used for decryption

    mapper = dec if decrypt else enc
    # Pick direction: enc for encrypt, dec for decrypt

    output = []
    steps = []
    # output accumulates result characters; steps records trace for UI

    for index, char in enumerate(text or ""):
        # Walk every character in the input, tracking position for the trace

        lowered = char.lower()
        # Normalize to lowercase for dictionary lookup

        if lowered in mapper:
            mapped = mapper[lowered]
            # Look up the substitute for this letter

            final_char = mapped if char == lowered else mapped.upper()
            # If original was uppercase, output uppercase substitute
            # If original was lowercase, output lowercase substitute

            output.append(final_char)
            steps.append({"index": index, "in": char, "out": final_char})
            # Save the substitution for the step trace

        else:
            output.append(char)
            steps.append({"index": index, "in": char, "out": char})
            # Non-letter (space, digit, punctuation): pass through unchanged

    return {"text": "".join(output), "steps": steps}
    # Return joined result and full per-character trace
```

#### Security

- **Keyspace**: 26! ≈ 4 × 10²⁶ — brute force is infeasible
- **Attack**: Frequency analysis defeats it in seconds. English letter frequencies are well-known, so the most common ciphertext letter maps to `e`, next to `t`, etc.
- **Historical use**: ROT13, Caesar cipher are special cases where the key is a simple shift

---

### 6.2 Classical — Double Transposition

**File**: `server/python/algorithms/classical.py`  
**Functions**: `double_trans_encrypt`, `double_trans_decrypt`

#### What It Is

A transposition cipher rearranges (permutes) the characters of the plaintext without changing them. A *double* transposition applies two successive columnar permutations, making it much harder to reverse than a single transposition.

#### Key Format

Two permutation keys, each a comma-separated list of zero-based column indices. Example: `"2,0,1"` means "take column 2 first, then column 0, then column 1".

The number of columns is inferred from the length of the key list.

#### Encryption Algorithm

**Step 1 — First transposition with `key_a`:**

```
key_a = "2,0,1"  →  3 columns, permutation order = [2, 0, 1]

Plaintext: "WEAREDISCOVEREDFLEEAKNOW"
Pad to multiple of 3: "WEAREDISCOVEREDFLEEAKNOW" (already 24 chars)

Write into 3-column matrix (row by row):
  W  E  A
  R  E  D
  I  S  C
  O  V  E
  R  E  D
  F  L  E
  E  A  K
  N  O  W

Permute columns in order [2, 0, 1] (read col 2, then col 0, then col 1):
  A  W  E
  D  R  E
  C  I  S
  E  O  V
  D  R  E
  E  F  L
  K  E  A
  W  N  O

Read row by row: "AWEDRECIOSVEDREEFLEAKEWNO"
```

**Step 2 — Second transposition with `key_b`:**

Apply the same process to the intermediate ciphertext using `key_b`. This produces the final ciphertext.

#### Decryption Algorithm

Apply the inverse of each permutation in reverse order:

1. Compute inverse of `key_b`
2. Undo second transposition
3. Compute inverse of `key_a`
4. Undo first transposition
5. Strip trailing padding (`X` characters)

**Inverse permutation**: If permutation maps position 0→2, 1→0, 2→1, then the inverse maps 2→0, 0→1, 1→2.

#### Intermediate Trace (returned to frontend)

```json
{
  "ciphertext": "...",
  "intermediate": {
    "afterFirstTransposition": "...",
    "matrix1Before": [[...], ...],
    "matrix1After":  [[...], ...],
    "matrix2Before": [[...], ...],
    "matrix2After":  [[...], ...]
  }
}
```

#### Line-by-Line Code Walkthrough

**`double_trans_encrypt(text, key_a, key_b)` — `classical.py` lines 55–82**

```python
def double_trans_encrypt(text, key_a, key_b):
    perm_a = parse_permutation(key_a)
    # "2,0,1" → [2, 0, 1]; validates it's a proper 0-based permutation

    perm_b = parse_permutation(key_b)
    # Same for the second key

    first_matrix = chunk_text(text or "", len(perm_a))
    # Write text into rows of len(perm_a) columns, padding last row with 'X'
    # e.g., "HELLO" with 3 cols → [['H','E','L'],['L','O','X']]

    first_permuted = [[row[i] for i in perm_a] for row in first_matrix]
    # For each row, reorder columns according to perm_a
    # perm_a=[2,0,1] means: new col0 = old col2, new col1 = old col0, new col2 = old col1

    after_first = flatten(first_permuted)
    # Flatten the 2D matrix back into a single string by reading row-by-row

    second_matrix = chunk_text(after_first, len(perm_b))
    # Re-chunk the intermediate result using perm_b's column count

    second_permuted = [[row[i] for i in perm_b] for row in second_matrix]
    # Apply perm_b column reordering to every row

    ciphertext = flatten(second_permuted)
    # Final flatten produces the ciphertext

    return {
        "ciphertext": ciphertext,
        "intermediate": {
            "afterFirst": after_first,         # text after 1st transposition
            "firstMatrix": first_matrix,        # grid before 1st permute
            "firstPermuted": first_permuted,    # grid after 1st permute
            "secondMatrix": second_matrix,      # grid before 2nd permute
            "secondPermuted": second_permuted,  # grid after 2nd permute
        },
    }
    # Full trace returned so the UI can animate each step
```

**`reverse_transposition(text, perm)` — `classical.py` lines 85–91**

```python
def reverse_transposition(text, perm):
    matrix = chunk_text(text, len(perm))
    # Rebuild matrix using same column count as the original transposition

    restored = [[row[i] for i in inverse_permutation(perm)] for row in matrix]
    # inverse_permutation([2,0,1]) = [1,2,0]
    # Applying the inverse permutation undoes the column reordering exactly

    return flatten(restored)
    # Flatten back to string
```

**`double_trans_decrypt(text, key_a, key_b)` — `classical.py` lines 94–104**

```python
def double_trans_decrypt(text, key_a, key_b):
    perm_a = parse_permutation(key_a)
    perm_b = parse_permutation(key_b)

    undo_second = reverse_transposition(text or "", perm_b)
    # Must undo SECOND transposition first (last-in, first-out order)

    plaintext = reverse_transposition(undo_second, perm_a).rstrip("X")
    # Undo FIRST transposition, then strip 'X' padding added during encrypt

    return {"plaintext": plaintext, "intermediate": {"undoSecond": undo_second}}
    # Returns recovered plaintext and intermediate for UI display
```

#### Security

- Significantly stronger than single transposition
- Vulnerable to known-plaintext attacks and cribs if messages are repetitive
- Key length and message length must be compatible for exact reversal

---

### 6.3 Symmetric — DES (FIPS 46-3)

**File**: `server/python/algorithms/symmetric.py`  
**Functions**: `des_encrypt`, `des_decrypt`, `_des_key_schedule`, `_des_round_function`, `_des_process_block`

#### What It Is

DES (Data Encryption Standard, FIPS 46-3) is a 64-bit block cipher with a 56-bit effective key, standardised in 1977. It uses a **Feistel network**: the block is split into two 32-bit halves processed through 16 rounds. Each round applies the F-function (expansion, XOR, S-box substitution, permutation) and XORs the result into the opposite half.

This implementation follows the full FIPS 46-3 specification including all permutation tables, the eight standard 6→4 S-boxes, and the correct PC-1/PC-2 key schedule.

#### Block and Key Parameters

| Parameter | Value |
|-----------|-------|
| Block size | 64 bits (8 bytes) |
| Key input | 8 bytes (64 bits); 8 parity bits stripped by PC-1 → 56 effective bits |
| Rounds | 16 |
| Round key size | 48 bits |
| S-boxes | 8 (each maps 6 bits → 4 bits) |

#### Key Schedule: `_des_key_schedule(key_bits_str)`

```
INPUT: 64-bit key as a binary string

1. PC-1 permutation: select 56 of 64 bits, split into C (28 bits) and D (28 bits)
2. For each of 16 rounds:
   a. Rotate C left by shift[round]  (schedule: 1,1,2,2,2,2,2,2,1,2,2,2,2,2,2,1)
   b. Rotate D left by the same amount
   c. PC-2 permutation: select 48 bits from C|D as the round key K_i

OUTPUT: List of 16 × 48-bit round keys
```

PC-1 discards the 8 parity bits (positions 8, 16, 24, …, 64). PC-2 selects 48 of the remaining 56 bits for each round key.

#### F-Function: `_des_round_function(right_bits, round_key_bits)`

```
INPUT: R (32 bits), K_i (48 bits)

1. E expansion: 32 → 48 bits by duplicating boundary bits (permutation table E)
2. XOR with round key: 48 bits XOR 48 bits
3. S-box substitution: split 48 bits into 8 groups of 6; each group enters one S-box
   - Row index: bit 0 (MSB) and bit 5 (LSB) of the 6-bit group
   - Column index: bits 1–4 of the 6-bit group
   - Output: 4 bits from the 4×16 S-box table → 8 × 4 = 32 bits total
4. P permutation: 32 → 32 bit rearrangement for diffusion

OUTPUT: F(R, K_i) — 32 bits
```

#### Full Block Encryption: `_des_process_block(block_bits_str, round_keys)`

```
INPUT: 64-bit block as binary string, 16 × 48-bit round keys

1. IP (Initial Permutation): rearrange 64 bits
2. Split into L_0 (bits 0–31) and R_0 (bits 32–63)
3. For i = 1 to 16:
     L_i = R_{i-1}
     R_i = L_{i-1} XOR F(R_{i-1}, K_i)
4. Final swap: concatenate R_16 | L_16
5. FP (Final Permutation / IP⁻¹): rearrange 64 bits

OUTPUT: (ciphertext_bits_string, rounds_trace)
```

`rounds_trace` records `left` and `right` (as binary strings) after every round for the step-by-step visualization.

#### ECB Mode Encryption: `des_encrypt(text, key, mode="ecb", iv=None)`

```
INPUT: arbitrary text, key string (up to 8 bytes), mode="ecb"

1. Truncate / zero-pad key to exactly 8 bytes, convert to 64-bit string
2. Run key schedule → 16 round keys
3. For each 8-byte plaintext block (last block zero-padded):
     ciphertext_block = _des_process_block(block, round_keys)
4. Concatenate all blocks → hex string

OUTPUT: {
  "mode": "ECB",
  "ciphertextHex": "a1b2c3...",
  "blocks": [...],
  "rounds": [...]
}
```

**Weakness of ECB**: identical plaintext blocks → identical ciphertext blocks, leaking patterns.

#### CBC Mode: `des_encrypt(text, key, mode="cbc", iv=...)`

```
For each block i:
  1. XOR plaintext_block[i] with IV (i=0) or previous ciphertext block
  2. Encrypt through DES
  3. Output becomes "previous" for next block
```

Decryption reverses the 16 round keys (K_16 first, K_1 last) — the Feistel property guarantees inversion.

#### Code Walkthrough

**`_des_key_schedule(key_bits_str)` — `symmetric.py`**

```python
def _des_key_schedule(key_bits_str):
    key_bits = _str_to_list((key_bits_str + "0" * 64)[:64])
    cd = _permute(key_bits, _DES_PC1)      # 64 → 56 bits, strips parity
    c, d = cd[:28], cd[28:]                # C and D halves
    round_keys = []
    for shift in _DES_SHIFTS:              # [1,1,2,2,2,2,2,2,1,2,2,2,2,2,2,1]
        c = _rotate_left_bits(c, shift)
        d = _rotate_left_bits(d, shift)
        round_keys.append(_permute(c + d, _DES_PC2))  # 56 → 48 bits
    return round_keys                      # 16 × 48-bit keys
```

**`_des_round_function(right_bits, round_key_bits)` — `symmetric.py`**

```python
def _des_round_function(right_bits, round_key_bits):
    expanded = _permute(right_bits, _DES_E)            # 32 → 48 bits
    xored    = _xor_lists(expanded, round_key_bits)    # XOR with round key
    sbox_out = []
    for i in range(8):
        sbox_out.extend(_sbox_lookup(xored[i*6:(i+1)*6], i))  # 6→4 per box
    return _permute(sbox_out, _DES_P)                  # P permutation
```

**`_sbox_lookup(six_bits, box_index)` — `symmetric.py`**

```python
def _sbox_lookup(six_bits, box_index):
    row = (six_bits[0] << 1) | six_bits[5]            # outer bits → row 0-3
    col = (six_bits[1] << 3) | (six_bits[2] << 2) \
        | (six_bits[3] << 1) |  six_bits[4]           # inner bits → col 0-15
    val = _DES_SBOXES[box_index][row * 16 + col]       # table lookup
    return [(val >> (3 - i)) & 1 for i in range(4)]   # 4-bit output
```

**`des_encrypt(text, key, mode, iv)` — `symmetric.py`**

```python
def des_encrypt(text, key, mode="ecb", iv=None):
    raw_key   = (key or "secret!!")[:8].ljust(8, "\x00")  # 8-byte key
    key_bits  = string_to_bits(raw_key)
    round_keys = _des_key_schedule(key_bits)

    for block_index, chunk in enumerate(blocks):
        plain_bits  = string_to_bits(chunk)
        chain_bits  = xor_bits(plain_bits, previous_bits) if mode == "cbc" else plain_bits
        cipher_bits, block_rounds = _des_process_block(chain_bits, round_keys)
        # cipher_bits is the IP + 16 Feistel rounds + FP output
```

**`des_decrypt(hex_text, key, mode, iv)` — `symmetric.py`**

```python
def des_decrypt(hex_text, key, mode="ecb", iv=None):
    round_keys = list(reversed(_des_key_schedule(key_bits)))
    # Reversed key order: K_16, K_15, ..., K_1
    # Feistel property: same _des_process_block call, reversed keys = inversion
```

---

### 6.4 Symmetric — AES (FIPS 197)

**File**: `server/python/algorithms/symmetric.py`  
**Functions**: `aes_encrypt`, `aes_decrypt`, `_aes_encrypt_block`, `_aes_decrypt_block`, `_aes_sub_bytes`, `_aes_inv_sub_bytes`, `_aes_shift_rows`, `_aes_inv_shift_rows`, `_aes_mix_columns`, `_aes_inv_mix_columns`, `_aes_key_expansion`

#### What It Is

AES (Advanced Encryption Standard, FIPS 197) is the current gold standard for symmetric encryption. It uses a **substitution-permutation network** (SPN). The state is a 4×4 column-major byte matrix (16 bytes = 128 bits), processed through 10 rounds (for AES-128) of four operations each.

This implementation follows the full FIPS 197 specification: the complete 256-entry Rijndael S-box, correct ShiftRows, GF(2⁸) MixColumns with precomputed multiplication tables, and the standard RotWord/SubWord/Rcon key expansion.

#### Block and Key Parameters

| Parameter | Value |
|-----------|-------|
| Block size | 128 bits (16 bytes) |
| Key size | 128 bits (16 bytes); truncated / zero-padded from input string |
| Rounds | 10 (Nr = 10 for Nk = 4) |
| Round keys | 11 × 16 bytes (initial + 10 rounds) |

#### State Layout

The state is a flat 16-byte list stored **column-major**: `state[row + col*4]`.

```
state[ 0]  state[ 4]  state[ 8]  state[12]   ← row 0
state[ 1]  state[ 5]  state[ 9]  state[13]   ← row 1
state[ 2]  state[ 6]  state[10]  state[14]   ← row 2
state[ 3]  state[ 7]  state[11]  state[15]   ← row 3
  col 0      col 1      col 2      col 3
```

#### The Four AES Operations

**1. SubBytes — `_aes_sub_bytes(state)` / `_aes_inv_sub_bytes(state)`**

Each of the 16 bytes is replaced via the Rijndael S-box, a fixed 256-entry lookup table built from the multiplicative inverse in GF(2⁸) composed with an affine transformation over GF(2):

```
SBOX[0x00] = 0x63,  SBOX[0x01] = 0x7c,  ...,  SBOX[0xff] = 0x16
```

The non-linearity of the GF(2⁸) inversion is what makes AES resistant to linear and differential cryptanalysis.

**2. ShiftRows — `_aes_shift_rows(state)` / `_aes_inv_shift_rows(state)`**

Each row of the 4×4 matrix is cyclically shifted left by its row index:

```
Row 0: no shift    →  state[0,  4,  8, 12]  unchanged
Row 1: shift left 1   state[1,  5,  9, 13]  → [5,  9, 13,  1]
Row 2: shift left 2   state[2,  6, 10, 14]  → [10, 14,  2,  6]
Row 3: shift left 3   state[3,  7, 11, 15]  → [15,  3,  7, 11]
```

ShiftRows ensures bytes from different columns are mixed together over successive rounds (inter-column diffusion).

**3. MixColumns — `_aes_mix_columns(state)` / `_aes_inv_mix_columns(state)`**

Each 4-byte column is multiplied by a fixed MDS matrix in GF(2⁸) with irreducible polynomial x⁸+x⁴+x³+x+1 (0x11b):

```
Forward matrix:          Inverse matrix:
[ 2  3  1  1 ]          [14 11 13  9 ]
[ 1  2  3  1 ]    ×     [ 9 14 11 13 ]
[ 1  1  2  3 ]          [13  9 14 11 ]
[ 3  1  1  2 ]          [11 13  9 14 ]
```

Multiplication by 2 is `xtime(a) = (a << 1) XOR 0x1b if MSB set, else (a << 1)`.  
Multiplication by 3 is `xtime(a) XOR a`. Larger multipliers (9, 11, 13, 14) are computed by chaining xtime. All six multipliers are precomputed into lookup tables (`_GF[factor][byte]`) for performance.

MixColumns is skipped in round 10 (final round), matching the FIPS 197 specification.

**4. AddRoundKey — inline XOR**

XOR the 16-byte state with the 16-byte round key:

```
state[i] = state[i] XOR round_key[i]   for i = 0..15
```

This is the only step involving key material. All other steps are key-independent.

#### Key Expansion: `_aes_key_expansion(key_bytes)`

Generates 11 round keys from the 16-byte key (FIPS 197 §5.2):

```
W[0..3] = key words (4 bytes each)
For i = 4 to 43:
  temp = W[i-1]
  if i % 4 == 0:
    temp = SubWord(RotWord(temp)) XOR [Rcon[i/4], 0, 0, 0]
  W[i] = W[i-4] XOR temp

Round key r = W[4r] || W[4r+1] || W[4r+2] || W[4r+3]  (r = 0..10)
```

- **RotWord**: left-rotate 4-byte word by 1 byte: `[a,b,c,d] → [b,c,d,a]`
- **SubWord**: apply S-box to each of the 4 bytes
- **Rcon**: `[0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36]`

#### Full Block Encryption: `_aes_encrypt_block(state, round_keys)`

```
AddRoundKey(state, round_keys[0])      ← initial key whitening

For round = 1 to 10:
  SubBytes(state)
  ShiftRows(state)
  if round < 10: MixColumns(state)    ← skipped in final round
  AddRoundKey(state, round_keys[round])

OUTPUT: (ciphertext_bytes, rounds_trace)
```

#### Full Block Decryption: `_aes_decrypt_block(state, round_keys)`

```
AddRoundKey(state, round_keys[10])

For round = 9 down to 0:
  InvShiftRows(state)
  InvSubBytes(state)
  AddRoundKey(state, round_keys[round])
  if round > 0: InvMixColumns(state)

OUTPUT: (plaintext_bytes, rounds_trace)
```

#### ECB and CBC Modes

Work identically to DES modes (see section 6.3) but with 16-byte blocks instead of 8-byte blocks.

#### Code Walkthrough

**`_aes_key_expansion(key_bytes)` — `symmetric.py`**

```python
def _aes_key_expansion(key_bytes):
    w = [list(key_bytes[i*4:(i+1)*4]) for i in range(4)]  # W[0..3]
    for i in range(4, 44):
        temp = w[i-1][:]
        if i % 4 == 0:
            temp = temp[1:] + temp[:1]               # RotWord
            temp = [_AES_SBOX[b] for b in temp]      # SubWord
            temp[0] ^= _AES_RCON[i // 4 - 1]         # XOR Rcon (first byte only)
        w.append([w[i-4][j] ^ temp[j] for j in range(4)])
    # Flatten W into 11 sixteen-byte round keys
    return [sum((w[r*4+k] for k in range(4)), []) for r in range(11)]
```

**`_aes_mix_columns(state)` — `symmetric.py`**

```python
def _aes_mix_columns(state):
    g = _GF   # precomputed GF(2^8) multiplication tables
    result = [0] * 16
    for c in range(4):
        a = state[c*4:(c+1)*4]            # column bytes a[0..3]
        result[c*4]   = g[2][a[0]] ^ g[3][a[1]] ^ a[2]        ^ a[3]
        result[c*4+1] = a[0]        ^ g[2][a[1]] ^ g[3][a[2]] ^ a[3]
        result[c*4+2] = a[0]        ^ a[1]        ^ g[2][a[2]] ^ g[3][a[3]]
        result[c*4+3] = g[3][a[0]] ^ a[1]         ^ a[2]       ^ g[2][a[3]]
    return result
```

**`_aes_encrypt_block(state, round_keys)` — `symmetric.py`**

```python
def _aes_encrypt_block(state, round_keys):
    state = _aes_add_round_key(state, round_keys[0])   # initial whitening
    rounds = []
    for r in range(1, 11):
        state = _aes_sub_bytes(state)
        state = _aes_shift_rows(state)
        if r < 10:
            state = _aes_mix_columns(state)            # skip in final round
        state = _aes_add_round_key(state, round_keys[r])
        rounds.append({"round": r, "stateHex": bytes_to_hex(state)})
    return state, rounds
```

---

### 6.5 Public-Key — RSA

**File**: `server/python/algorithms/public_key.py`  
**Functions**: `rsa_keygen`, `rsa_encrypt`, `rsa_decrypt`, `is_probable_prime`, `generate_prime`, `string_to_integer`, `integer_to_string`

#### What It Is

RSA is the most widely known public-key cryptosystem, based on the mathematical difficulty of factoring the product of two large primes. Encryption uses a public key; decryption requires the private key.

#### Mathematics Behind RSA

1. Choose two distinct primes `p` and `q`
2. Compute `n = p × q` (the modulus)
3. Compute `φ(n) = (p − 1)(q − 1)` (Euler's totient)
4. Choose `e` such that `1 < e < φ(n)` and `gcd(e, φ(n)) = 1`
   - Standard choice: `e = 65537` (a prime, efficient in binary)
5. Compute `d = e⁻¹ mod φ(n)` (modular inverse via extended GCD)
6. Public key: `(e, n)` — share this freely
7. Private key: `(d, n)` — keep secret

**Encrypt**: `c = mᵉ mod n`  
**Decrypt**: `m = cᵈ mod n`

This works because `(mᵉ)ᵈ ≡ m (mod n)` by Euler's theorem.

#### Primality Test: `is_probable_prime(value)` — Miller-Rabin

```
1. Check divisibility by small primes [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
2. Write value - 1 = 2^s × d  (factor out all powers of 2)
3. For each witness base b in [2, 3, 5, 7, 11]:
   a. Compute x = b^d mod value
   b. If x == 1 or x == value-1: this base passes, try next
   c. Repeat s-1 times: x = x² mod value
      If x == value-1: this base passes, try next
   d. If no pass found: value is COMPOSITE (definite)
4. If all bases pass: value is PROBABLY PRIME

For these 5 specific bases, the test is deterministic for all n < 3,215,031,751
```

#### Prime Generation: `generate_prime(bits=16)`

```python
lower = 2 ** (bits - 1)
upper = 2 ** bits - 1
while True:
    candidate = random.randrange(lower, upper) | 1  # force odd
    if is_probable_prime(candidate):
        return candidate
```

The educational default is 16-bit primes (fast). Real RSA uses 2048+ bits.

#### Key Generation: `rsa_keygen(bits)`

```
1. p = generate_prime(bits)
2. q = generate_prime(bits)   (ensure p ≠ q)
3. n = p × q
4. phi = (p - 1) × (q - 1)
5. e = 65537
   if gcd(e, phi) ≠ 1: fallback to e = 17
6. d = modular_inverse(e, phi)  ← extended GCD

OUTPUT: {
  "publicKey":  {"e": ..., "n": ...},
  "privateKey": {"d": ..., "n": ...},
  "meta":       {"p": ..., "q": ..., "phi": ...},
  "steps": [...]   ← each computation step for display
}
```

#### Encryption: `rsa_encrypt(message, public_key)`

```
1. m = string_to_integer(message)   ← pack bytes into big integer
2. Verify m < n  (message must be smaller than modulus)
3. c = pow(m, e, n)                 ← Python's built-in modular exponentiation

OUTPUT: {"ciphertext": c, "steps": [...]}
```

#### Decryption: `rsa_decrypt(ciphertext, private_key)`

```
1. m = pow(c, d, n)
2. message = integer_to_string(m)   ← unpack bytes from big integer

OUTPUT: {"plaintext": message, "steps": [...]}
```

#### Line-by-Line Code Walkthrough

**`is_probable_prime(value)` — `public_key.py` lines 6–54**

```python
def is_probable_prime(value):
    if value < 2:
        return False
        # 0 and 1 are not prime by definition

    for prime in [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]:
        if value == prime:
            return True          # exact match to known prime → definitely prime
        if value % prime == 0:
            return False         # divisible by small prime → composite
    # This trial-division pre-filter eliminates ~70% of composites instantly

    d = value - 1
    s = 0
    while d % 2 == 0:
        d //= 2
        s += 1
    # Factor out powers of 2 from (value - 1)
    # After loop: value - 1 = 2^s × d, where d is odd
    # Example: value=13 → value-1=12 → 12=4×3 → s=2, d=3

    for base in [2, 3, 5, 7, 11]:
        if base >= value - 2:
            continue
            # Skip bases that are too close to value (would be degenerate)

        witness = pow(base, d, value)
        # Compute base^d mod value using Python's fast modular exponentiation
        # This is the first Miller-Rabin witness computation

        if witness in [1, value - 1]:
            continue
            # These values pass immediately: base is not a witness to compositeness

        composite = True
        for _ in range(1, s):
            witness = pow(witness, 2, value)
            # Square the witness: compute (base^(2^i * d)) mod value
            if witness == value - 1:
                composite = False
                break
                # Found value-1: this base does NOT witness compositeness

        if composite:
            return False
            # This base IS a witness to compositeness → definitely composite

    return True
    # All bases passed → probably prime (deterministic for n < 3,215,031,751)
```

**`generate_prime(bits=16)` — `public_key.py` lines 57–72**

```python
def generate_prime(bits=16):
    lower = 1 << (bits - 1)    # 2^(bits-1): smallest number with exactly `bits` bits
    upper = (1 << bits) - 1    # 2^bits - 1: largest number with exactly `bits` bits

    candidate = random.randrange(lower | 1, upper, 2)
    # lower | 1 forces the starting value to be odd (sets bit 0)
    # step=2 means we only generate odd numbers
    # Even numbers > 2 are never prime, so skip them

    while not is_probable_prime(candidate):
        candidate += 2          # advance to next odd number
        if candidate > upper:
            candidate = lower | 1    # wrap around to bottom of range
    return candidate
    # Returns first probable prime found in the range
```

**`string_to_integer(message)` — `public_key.py` lines 75–83**

```python
def string_to_integer(message):
    output = 0
    for byte in (message or "").encode("utf-8"):
        output = (output << 8) | byte
        # Shift existing value left 8 bits (make room for one more byte)
        # OR in the new byte value into the lowest 8 bits
        # Example: "AB" → byte 65 → output=65 → shift → output=65*256 → OR 66 → output=16706
    return output
    # Result is a big-endian integer representation of the UTF-8 bytes
```

**`integer_to_string(number)` — `public_key.py` lines 86–101**

```python
def integer_to_string(number):
    if number == 0:
        return ""
    data = []
    current = number
    while current > 0:
        data.append(current & 0xFF)    # extract lowest 8 bits as a byte
        current >>= 8                  # shift right to remove the extracted byte
    # data now holds bytes in REVERSE order (LSB first)
    return bytes(reversed(data)).decode("utf-8", errors="ignore")
    # reversed(data) restores big-endian order, decode() converts to string
```

**`rsa_keygen(bits)` — `public_key.py` lines 161–194**

```python
def rsa_keygen(bits):
    bits = max(16, int(bits or 32))
    # Enforce minimum 16-bit key for demo; real RSA uses 2048+

    prime_p = generate_prime(bits // 2)
    # Generate first prime p with bits/2 bits
    # Using bits/2 so that p×q has approximately `bits` total bits

    prime_q = generate_prime(bits // 2)
    # Generate second prime q independently
    # Not checking p≠q here; at 16+ bits collision probability is negligible

    modulus = prime_p * prime_q
    # n = p × q: the RSA modulus
    # This is what recipients use to encrypt; its factors are the private secret

    phi = (prime_p - 1) * (prime_q - 1)
    # φ(n) = (p-1)(q-1): Euler's totient function
    # Counts integers in [1, n-1] coprime to n
    # Used to choose e and compute d

    exponent = 65537
    # Standard public exponent e = 65537 = 2^16 + 1
    # Chosen because it's prime and has only two 1-bits in binary (fast exponentiation)

    if gcd(exponent, phi) != 1:
        exponent = 17
        # Fallback: if gcd(65537, phi) ≠ 1 then 65537 doesn't have an inverse mod phi
        # This can happen with very small primes; 17 is also commonly used

    private_exponent = mod_inverse(exponent, phi)
    # d = e^(-1) mod φ(n) via extended Euclidean algorithm
    # Property: e × d ≡ 1 (mod φ(n))
    # This means (m^e)^d ≡ m (mod n) by Euler's theorem

    steps = [
        {"step": "Choose prime p",          "value": str(prime_p)},
        {"step": "Choose prime q",          "value": str(prime_q)},
        {"step": "Compute n = p × q",       "value": str(modulus)},
        {"step": "Compute φ(n)",            "value": str(phi)},
        {"step": "Select e",                "value": str(exponent)},
        {"step": "Compute d = e^-1 mod φ(n)", "value": str(private_exponent)},
    ]
    # Step trace for the UI's timeline view

    return {
        "publicKey":  {"e": str(exponent),         "n": str(modulus)},
        "privateKey": {"d": str(private_exponent), "n": str(modulus)},
        "meta":       {"p": str(prime_p), "q": str(prime_q), "phi": str(phi)},
        "steps": steps,
    }
    # All values returned as strings for safe JSON transport (large integers)
```

**`rsa_encrypt(message, public_key)` — `public_key.py` lines 197–216**

```python
def rsa_encrypt(message, public_key):
    exponent = int(public_key["e"])
    modulus  = int(public_key["n"])
    # Parse e and n from the public key dict (stored as strings)

    numeric_message = string_to_integer(message)
    # Convert text to big integer using byte-packing

    if numeric_message >= modulus:
        raise ValueError("Message too large for selected key")
        # RSA requires m < n; if m ≥ n the math breaks down
        # With 16-bit keys n can be as small as ~65536, limiting message length

    ciphertext = str(pow(numeric_message, exponent, modulus))
    # c = m^e mod n
    # Python's three-argument pow() uses fast square-and-multiply (O(log e) multiplications)
    # Result converted to string for JSON transport

    steps = [
        {"step": "Convert message to integer", "value": str(numeric_message)},
        {"step": "Apply c = m^e mod n",        "formula": f"{numeric_message}^{exponent} mod {modulus}"},
        {"step": "Read ciphertext",            "value": ciphertext},
    ]
    return {"ciphertext": ciphertext, "steps": steps}
```

**`rsa_decrypt(ciphertext, private_key)` — `public_key.py` lines 219–235**

```python
def rsa_decrypt(ciphertext, private_key):
    private_exponent = int(private_key["d"])
    modulus          = int(private_key["n"])

    numeric_ciphertext = int(ciphertext)
    # Parse ciphertext integer from string

    numeric_message = pow(numeric_ciphertext, private_exponent, modulus)
    # m = c^d mod n
    # By RSA correctness: (m^e)^d ≡ m^(e×d) ≡ m^(1 + k×φ(n)) ≡ m (mod n)
    # The key insight: e×d ≡ 1 (mod φ(n)) means e×d = 1 + k×φ(n) for some k
    # Euler's theorem: m^φ(n) ≡ 1 (mod n) when gcd(m,n)=1
    # So m^(1+k×φ(n)) = m × (m^φ(n))^k ≡ m × 1^k = m (mod n)

    return {"plaintext": integer_to_string(numeric_message), "steps": steps}
    # integer_to_string unpacks the big integer back to UTF-8 text
```

#### Security

- Security depends on the difficulty of factoring `n` into `p` and `q`
- With the toy 16-bit primes used here, `n` is small enough to factor by trial division in milliseconds — that is intentional for the attack demonstration
- Real RSA uses 2048-bit or 4096-bit moduli

---

### 6.6 Public-Key — ECDH

**File**: `server/python/algorithms/public_key.py`  
**Functions**: `ecdh`, `point_add`, `scalar_mult_trace`

#### What It Is

Elliptic Curve Diffie-Hellman (ECDH) is a key agreement protocol. Two parties (Alice and Bob) each generate a key pair on an elliptic curve and exchange public keys. Each can then compute the same shared secret independently, without ever transmitting it.

#### Elliptic Curve Mathematics

The curve equation used: **y² ≡ x³ + ax (mod p)**

A point on the curve is a pair `(x, y)` satisfying this equation, plus a special "point at infinity" (the identity element).

**Point Addition**: Adding two distinct points P and Q on the curve:

```
If P = infinity: return Q
If Q = infinity: return P
If x_P = x_Q and y_P + y_Q ≡ 0 (mod p): return infinity  (P = -Q)

slope λ = (y_Q - y_P) × (x_Q - x_P)⁻¹ mod p    (regular add)
slope λ = (3x_P² + a) × (2y_P)⁻¹ mod p           (point doubling, P = Q)

x_R = λ² - x_P - x_Q   (mod p)
y_R = λ(x_P - x_R) - y_P  (mod p)
```

**Scalar Multiplication** (P = k × G): Add G to itself k times. Done efficiently with **double-and-add** (like binary exponentiation):

```python
result = infinity
current = G

for bit in binary_representation(k):
    if bit == 1:
        result = point_add(result, current)
    current = point_add(current, current)  # double
```

This is O(log k) point additions instead of O(k).

#### ECDH Key Exchange: `ecdh(payload)`

```
Inputs:
  p        = prime field modulus
  a        = curve coefficient
  G        = base point (generator) {x, y}
  privateA = Alice's private scalar (integer)
  privateB = Bob's private scalar (integer)

Step 1 — Derive public keys:
  publicA = privateA × G   (Alice's public key)
  publicB = privateB × G   (Bob's public key)

Step 2 — Compute shared secret:
  sharedA = privateA × publicB  = privateA × privateB × G
  sharedB = privateB × publicA  = privateB × privateA × G

Step 3 — Verify:
  sharedA == sharedB  ✓  (they're equal by commutativity of scalar mult)

OUTPUT: {
  "publicA":     {x, y},
  "publicB":     {x, y},
  "sharedA":     {x, y},
  "sharedB":     {x, y},
  "sharedMatch": true,
  "trace":       { step-by-step scalar multiplication path }
}
```

The shared secret is the x-coordinate of the shared point. An eavesdropper who sees `publicA` and `publicB` cannot compute the shared secret without solving the **Elliptic Curve Discrete Logarithm Problem (ECDLP)** — finding k given G and k×G — which is computationally infeasible for properly chosen curves and large scalars.

#### Line-by-Line Code Walkthrough

**`point_add(point_a, point_b, coefficient, prime)` — `public_key.py` lines 104–128**

```python
def point_add(point_a, point_b, coefficient, prime):
    if point_a is None:
        return point_b
    if point_b is None:
        return point_a
    # None represents the "point at infinity" (identity element)
    # P + O = P; O + P = P

    x1, y1 = int(point_a["x"]), int(point_a["y"])
    x2, y2 = int(point_b["x"]), int(point_b["y"])
    # Parse coordinates from string dicts (stored as strings for JSON safety)

    if x1 == x2 and mod(y1 + y2, prime) == 0:
        return None
        # P + (-P) = O (point at infinity)
        # -P on the curve is (x, -y mod p)
        # If y1 + y2 ≡ 0 (mod p), then y2 = -y1, so points are inverses

    if x1 == x2 and y1 == y2:
        slope = mod((3 * x1 * x1 + coefficient) * mod_inv(2 * y1, prime), prime)
        # POINT DOUBLING: P + P = 2P
        # Slope of tangent: λ = (3x₁² + a) / (2y₁) mod p
        # Division in modular arithmetic = multiply by modular inverse
        # coefficient = a (the curve parameter in y² = x³ + ax)
    else:
        slope = mod((y2 - y1) * mod_inv(x2 - x1, prime), prime)
        # REGULAR ADDITION: P + Q where P ≠ Q
        # Slope of secant line: λ = (y₂ - y₁) / (x₂ - x₁) mod p

    x3 = mod(slope * slope - x1 - x2, prime)
    # x₃ = λ² - x₁ - x₂  (mod p)
    # This is the standard chord-and-tangent formula for elliptic curves

    y3 = mod(slope * (x1 - x3) - y1, prime)
    # y₃ = λ(x₁ - x₃) - y₁  (mod p)
    # mod() normalizes to positive range [0, p) in case result is negative

    return {"x": str(x3), "y": str(y3)}
    # Return as string dict for JSON-safe transport
```

**`scalar_mult_trace(scalar, point, coefficient, prime)` — `public_key.py` lines 131–158**

```python
def scalar_mult_trace(scalar, point, coefficient, prime):
    result = None       # Accumulator starts as point-at-infinity (identity)
    addend = point      # Current "doubling" point starts at G
    trace = []
    current = int(scalar)
    bit_index = 0

    while current > 0:
        bit = current & 1
        # Extract the lowest bit of scalar
        # This is the "double-and-add" algorithm (binary method)

        trace.append({"bit": bit_index, "take": bool(bit), "current": result, "addend": addend})
        # Record state BEFORE this step for the UI animation

        if bit:
            result = point_add(result, addend, coefficient, prime)
            # If this bit is 1: add current addend to accumulator
            # On bit 0: result = G if scalar is odd, else skip
            # On bit 1: result = result + 2G
            # On bit 2: result = result + 4G, etc.

        addend = point_add(addend, addend, coefficient, prime)
        # Always double the addend: G → 2G → 4G → 8G → ...
        # This is O(log k) doublings instead of O(k) additions

        current >>= 1
        # Shift scalar right to process next bit
        bit_index += 1

    return result, trace
    # result = scalar × point (the scalar multiplication product)
    # trace feeds the step-by-step visualization
```

**`ecdh(payload)` — `public_key.py` lines 238–280**

```python
def ecdh(payload):
    prime       = int(payload.get("p",        "97"))     # field modulus
    coefficient = int(payload.get("a",        "2"))      # curve parameter a
    generator   = payload.get("G",  {"x": "3", "y": "6"})  # base point G
    private_a   = int(payload.get("privateA", "5"))      # Alice's secret scalar
    private_b   = int(payload.get("privateB", "7"))      # Bob's secret scalar

    public_a, trace_a = scalar_mult_trace(private_a, generator, coefficient, prime)
    # Alice computes: A = a×G  (her public key)
    # a is her private key; A is safe to share publicly

    public_b, trace_b = scalar_mult_trace(private_b, generator, coefficient, prime)
    # Bob computes:   B = b×G  (his public key)

    shared_a, shared_trace_a = scalar_mult_trace(private_a, public_b, coefficient, prime)
    # Alice computes shared secret: a×B = a×(b×G) = (a×b)×G
    # She uses her OWN private key and Bob's PUBLIC key

    shared_b, shared_trace_b = scalar_mult_trace(private_b, public_a, coefficient, prime)
    # Bob computes shared secret: b×A = b×(a×G) = (b×a)×G
    # He uses his OWN private key and Alice's PUBLIC key

    # Because (a×b)×G = (b×a)×G (scalar mult is commutative),
    # shared_a == shared_b — they agree on the same secret point
    # An eavesdropper knowing A and B cannot compute a×B without knowing a or b
    # (That's the Elliptic Curve Discrete Logarithm Problem)

    return {
        "publicA": public_a, "publicB": public_b,
        "sharedA": shared_a, "sharedB": shared_b,
        "sharedMatch": shared_a == shared_b,
        # sharedMatch should always be True for valid curve parameters
        "trace": {"publicA": trace_a, "publicB": trace_b,
                  "sharedA": shared_trace_a, "sharedB": shared_trace_b},
    }
```

#### Security

- ECDLP is much harder per key bit than RSA's factoring problem
- 256-bit ECC ≈ 3072-bit RSA in security
- The toy parameters here (small p) are intentionally weak for visualization

---


        iterations += 1
        trace.append({"iteration": iterations, "x": str(x), "y": str(y), "gcd": str(d)})
        # Save state for the UI's iteration table

        if d == modulus:
            c += 1          # degenerate: x and y collided in the full modulus
            x = y = 2       # reset both pointers
            d = 1           # reset factor candidate
            # Try a different polynomial (c=2, then c=3, etc.)

    if 1 < d < modulus:
        return {
            "success":   True,
            "factor":    str(d),           # one prime factor of n
            "cofactor":  str(modulus // d), # the other factor (n / p)
            "iterations": iterations,
            "trace":     trace,
        }
    return {"success": False, "iterations": iterations, "message": "No factor found in budget", "trace": trace}
    # Failure case: very rare with proper RSA toy keys, signals parameter issue
```

---

## 7. Shared Utilities

**File**: `server/python/algorithms/common.py`

### String / Binary Conversions

| Function | Purpose |
|----------|---------|
| `string_to_bits(text)` | Convert string to binary (8 bits per char) |
| `bits_to_string(bits)` | Convert binary back to string |
| `text_to_bytes(text)` | Convert to 16-byte array (0-padded) |
| `hex_to_bytes(hex_str)` | Hex string → byte array |
| `bytes_to_hex(data)` | Byte array → hex string |

### Matrix Operations

| Function | Purpose |
|----------|---------|
| `chunk_text(text, cols)` | Split text into rows of fixed width, pad with 'X' |
| `flatten(matrix)` | 2D list → flat string |
| `inverse_permutation(values)` | Compute inverse of permutation (for transposition decryption) |
| `parse_permutation(raw)` | Parse "2,0,1" string → validated integer list |

### Math

| Function | Purpose |
|----------|---------|
| `gcd(a, b)` | Euclidean greatest common divisor |
| `egcd(a, b)` | Extended GCD — returns (gcd, x, y) where ax + by = gcd |
| `mod_inverse(v, m)` | Modular inverse via extended GCD |
| `mod_inv(v, m)` | Modular inverse via Python's `pow(v, -1, m)` |
| `mod(v, m)` | Normalize integer to [0, m) |

**File**: `server/python/algorithms/utils.py`

| Function | Purpose |
|----------|---------|
| `shannon_entropy(data)` | H = −Σ pᵢ log₂(pᵢ) — measures randomness of ciphertext output |

Shannon entropy ranges from 0 (completely predictable) to 8 bits/byte (perfectly random). Good ciphertext should be close to 8.

### Line-by-Line Code Walkthrough

**`string_to_bits(text)` — `common.py` line 62–64**

```python
def string_to_bits(text):
    return "".join(format(ord(char), "08b") for char in (text or ""))
    # ord(char): get ASCII/Unicode integer for each character
    # format(..., "08b"): format as 8-bit binary string, zero-padded
    # "H" → ord=72 → "01001000"
    # Result: all chars concatenated as one long binary string
    # e.g., "Hi" → "0100100001101001"
```

**`bits_to_string(bits)` — `common.py` lines 67–79**

```python
def bits_to_string(bits):
    output = []
    for i in range(0, len(bits), 8):
        chunk = bits[i : i + 8]      # grab 8 bits at a time
        if len(chunk) == 8:
            output.append(chr(int(chunk, 2)))
            # int(chunk, 2): parse binary string as base-2 integer → byte value
            # chr(...): convert byte integer back to character
    return "".join(output).rstrip("\x00")
    # rstrip removes null bytes added as padding during block splitting
```

**`text_to_bytes(text)` — `common.py` lines 82–89**

```python
def text_to_bytes(text):
    data = [ord(char) for char in (text or "")][:16]
    # Convert each character to its ASCII byte value, keep only first 16
    # Truncation: keys/blocks longer than 16 chars are silently truncated

    while len(data) < 16:
        data.append(0)
    # Zero-pad to exactly 16 bytes
    # This is why you need 16-char keys for AES; shorter keys work but are padded

    return data    # List of 16 integers in range [0, 255]
```

**`hex_to_bytes(raw_hex)` — `common.py` lines 92–109**

```python
def hex_to_bytes(raw_hex):
    cleaned = (raw_hex or "").replace("0x", "")
    # Strip "0x" prefix if present

    output = []
    for i in range(0, len(cleaned), 2):
        piece = cleaned[i : i + 2]     # grab two hex digits at a time
        if len(piece) == 2:
            output.append(int(piece, 16))
            # int("a3", 16) = 163: parse hex pair as byte value

    while len(output) < 16:
        output.append(0)
    return output[:16]
    # Zero-pad to 16, then truncate to 16 — always returns exactly 16 bytes
```

**`chunk_text(text, cols)` — `common.py` lines 18–32**

```python
def chunk_text(text, cols):
    rows = math.ceil(len(text) / cols) if cols else 0
    # Calculate how many rows needed to fit all characters

    matrix = [["X" for _ in range(cols)] for _ in range(rows)]
    # Pre-fill entire matrix with 'X' padding characters
    # This way the last row is automatically padded

    for index, char in enumerate(text):
        row = index // cols     # integer division gives the row number
        col = index % cols      # modulo gives the column number
        matrix[row][col] = char
        # Place each character at its (row, col) position

    return matrix    # 2D list, e.g., [['H','e','l'],['l','o','X']]
```

**`inverse_permutation(values)` — `common.py` lines 40–48**

```python
def inverse_permutation(values):
    inverse = [0] * len(values)
    for index, value in enumerate(values):
        inverse[value] = index
        # If original permutation says "position index goes to value",
        # then inverse says "position value came from index"
        # Example: [2,0,1] → inverse[2]=0, inverse[0]=1, inverse[1]=2 → [1,2,0]
    return inverse
    # Applying inverse_permutation after permutation restores original column order
```

**`parse_permutation(raw_value)` — `common.py` lines 51–59**

```python
def parse_permutation(raw_value):
    values = [int(piece.strip()) for piece in (raw_value or "").split(",") if piece.strip()]
    # Split on commas, strip whitespace, convert each part to int
    # "2, 0, 1" → [2, 0, 1]

    if sorted(values) != list(range(len(values))):
        raise ValueError("Permutation key must be like 2,0,1")
        # sorted([2,0,1]) = [0,1,2] = list(range(3)) → valid
        # [2,0,2] fails: sorted=[0,2,2] ≠ [0,1,2] (duplicate 2, missing 1)
        # [3,0,1] fails: sorted=[0,1,3] ≠ [0,1,2] (out of range)

    return values    # Guaranteed valid 0-based permutation
```

**`gcd(left, right)` — `common.py` lines 122–128**

```python
def gcd(left, right):
    while right:
        left, right = right, left % right
        # Euclidean algorithm: gcd(a, b) = gcd(b, a mod b)
        # Each iteration: larger problem → smaller problem
        # e.g., gcd(48, 18): (48,18)→(18,12)→(12,6)→(6,0) → return 6
    return left    # When right=0, left holds the GCD
```

**`egcd(left, right)` — `common.py` lines 131–139**

```python
def egcd(left, right):
    if right == 0:
        return left, 1, 0
        # Base case: gcd(a,0)=a, and a×1 + 0×0 = a (Bézout coefficients 1,0)

    gcd_value, x, y = egcd(right, left % right)
    # Recurse on smaller problem

    return gcd_value, y, x - (left // right) * y
    # Rebuild Bézout coefficients on the way back up
    # If gcd(b, a%b) = b×x + (a%b)×y, then gcd(a,b) = a×y + b×(x - ⌊a/b⌋×y)
    # Used by mod_inverse to find d = e^(-1) mod φ(n) for RSA
```

**`mod_inverse(value, modulus)` — `common.py` lines 142–150**

```python
def mod_inverse(value, modulus):
    gcd_value, x, _ = egcd(value, modulus)
    # Bézout identity: value×x + modulus×_ = gcd_value

    if gcd_value != 1:
        raise ValueError("No modular inverse")
        # Inverse exists only when gcd(value, modulus) = 1
        # (They must be coprime)

    return x % modulus
    # x from egcd may be negative; % modulus brings it to positive range [0, m)
    # This is d in RSA: d = e^(-1) mod φ(n)
```

**`mod(value, modulus)` — `common.py` lines 153–155**

```python
def mod(value, modulus):
    return ((value % modulus) + modulus) % modulus
    # Python's % can return negative results for negative inputs
    # e.g., (-3) % 7 = -3 in some languages (not Python, but pattern is defensive)
    # ((v % m) + m) % m always gives a result in [0, m) regardless of sign
    # Used in ECC point_add where coordinates can be negative intermediate values
```

---

## 8. Frontend — React Application

### 8.1 Pages

#### AlgorithmLab.jsx — Main Cipher Playground

The primary interactive page. Users select an algorithm, fill in parameters, and see results with step traces.

**Features:**
- Algorithm selector dropdown for all 6 families
- Dynamic input fields (change based on selected algorithm)
- Mode selector for DES/AES (ECB / CBC)
- IV input for CBC mode
- ECC curve parameter editor (p, a, G, private keys)
- RSA key generation with configurable bit size
- Results rendered via `AlgorithmInsightPanel`

**Algorithms available:**
1. Substitution — encrypt / decrypt / attack
2. Double Transposition — encrypt / decrypt
3. DES — encrypt / decrypt (ECB or CBC)
4. AES — encrypt / decrypt (ECB or CBC)
5. RSA — keygen / encrypt / decrypt / attack (Pollard's rho)
6. ECC ECDH — key exchange

#### Dashboard.jsx — Status & Benchmarks

- Live cipher preview (substitution encrypt shown in real time)
- Benchmark trigger button → runs all algorithms at multiple input sizes
- Bar chart of average runtimes (Recharts)
- API health indicator
- Benchmark history visualization

#### InteractivePlayground.jsx — Step-by-Step Visualizer

The most educational page — walks through every intermediate computation.

**Features:**
- Algorithm selector
- Auto-play with speed control (0.5×, 1×, 2×)
- Keyboard navigation: ← → arrows, spacebar to pause/play
- Progress slider + step counter
- **AI Tutor button**: sends current step to Gemini API, gets plain-language explanation
- 3D visualization panel matching selected algorithm:
  - Substitution → `CipherRings3D`
  - Transposition → `TranspositionGrid3D`
  - DES → `FeistelTower3D`
  - AES → `CryptoCube3D`
  - RSA → `RSAClock3D`

#### Comparison.jsx — Algorithm Benchmarks

- Info cards per algorithm (key size, block size, security level, algorithm type)
- Performance bar chart (speed, throughput, entropy side by side)
- Radar chart with 5 axes: Speed, Security, Key Strength, Complexity, Standardization
- Full specification comparison table

#### SecurityAnalysis.jsx — Security Overview

Cards for each algorithm showing:
- Strengths (e.g., "AES: Modern standard, fast in hardware, 128+ bit security")
- Weaknesses (e.g., "Substitution: Completely broken by frequency analysis")
- Security level badge

#### CipherChallenge.jsx — Gamified Decryption Game

- 7 preset plaintext messages (e.g., famous quotes, sentences)
- Difficulty selector:
  - Easy: Substitution cipher (breakable by frequency analysis)
  - Hard: Double Transposition (requires structured guessing)
- Timer (MM:SS countdown)
- Hint system: up to 3 hints, each reveals first letter of each word (−score penalty per hint)
- Scoring: base 10 × 1000 − time penalty − hint penalties
- Round progression

---

### 8.2 Components

#### AlgorithmInsightPanel.jsx — Trace Viewer

Dispatches to a sub-component based on algorithm type. All sub-components receive the full API response and render it visually.

**SubstitutionView:**
- Ciphertext/plaintext banner
- Character flow: each step shown as `in → out` with arrow
- Full 26-character substitution mapping table
- Attack mode: frequency bar chart + ranked candidate plaintexts

**TranspositionView:**
- Plaintext/ciphertext banner
- Step timeline: Before/After each transposition phase
- Grid visualization showing column order before and after permutation
- Column indices highlighted by permutation position

**DESView:**
- Ciphertext/plaintext banner
- CBC chain indicator (which block feeds which)
- Block flow timeline (block index, length)
- Per-block Feistel rounds: L₀, R₀ → L₁, R₁ → ... → L₁₆, R₁₆
- Bit visualizer: each 32-bit half shown as colored squares (blue = 1, gray = 0)

**AESView:**
- Ciphertext/plaintext banner
- CBC chain indicator (if applicable)
- 4×4 hex matrix at each stage (Initial → After SubBytes → After ShiftRows → After MixColumns → After AddRoundKey)
- Heat-mapped color per byte (darker = higher value)
- Round-by-round progression

**RSAView:**
- Key pair display with copy buttons:
  - Public key: `e`, `n`
  - Private key: `d`, `n`
  - Meta: `p`, `q`, `φ(n)`
- Encrypt result: ciphertext integer
- Decrypt result: recovered plaintext
- Attack result: factor found, cofactor, iterations table
- Step timeline with each computation (prime gen, phi, d derivation, etc.)

**ECCView:**
- Curve equation badge: `y² ≡ x³ + ax (mod p)`
- Alice/Bob exchange visualization:
  - Each party's private key → public key derivation (A = a×G)
  - Shared secret computation (Alice: a×B, Bob: b×A)
- Match indicator: ✓ Shared secrets match / ✗ No match
- Scalar multiplication trace (point doubling and addition steps)

#### ResultPanel.jsx

Wrapper that delegates to `AlgorithmInsightPanel`. Handles loading state and error display.

#### Sidebar.jsx

Navigation links to all pages. Collapses on mobile.

#### ThemeSwitch.jsx

Toggles between dark and light mode. Persists to `localStorage`.

---

### 8.3 3D Visualizations

All built with **Three.js**, **@react-three/fiber** (React bindings), and **@react-three/drei** (helpers).

#### CryptoCube3D.jsx — AES

Renders the AES 4×4 state matrix as a 3D cube. Each face of the cube represents a 4-byte column. Bytes are shown as colored tiles. When a round completes, the cube rotates to reveal the new state. SubBytes changes tile colors; ShiftRows animates row sliding; MixColumns shows intra-column mixing; AddRoundKey flashes tiles.

#### CipherRings3D.jsx — Substitution

Two concentric rotating rings: outer ring = plaintext alphabet (a–z), inner ring = ciphertext alphabet (permuted). When encrypting a character, the matching position on each ring glows. The ring rotates to show the mapping. Attack mode shows a third ring with English frequency order.

#### TranspositionGrid3D.jsx — Double Transposition

A 3D grid of letter tiles. Columns are colored by permutation group. Each transposition step animates columns swapping positions. The intermediate state hovers between the two grids. After both transpositions, the final arrangement is visible.

#### FeistelTower3D.jsx — DES

A vertical tower of 16 floors, each representing a Feistel round. Left and right 32-bit halves are shown as red and blue blocks on each floor. The round function `f` is a glowing orange sphere. Arrows show data flowing down: right becomes next left, `f(right, key) XOR left` becomes next right. The tower fills from bottom to top as rounds progress.

#### RSAClock3D.jsx — RSA

A clock-face visualization of modular exponentiation. The modulus `n` defines the clock's circumference. The base `m` starts at a position on the clock. Each multiplication step advances the hand by `e` positions (modulo `n`). The final position `c` lights up as the ciphertext. Decryption reverses the process.

---

### 8.4 API Service Layer

**File**: `client/src/services/api.js`

Axios instance with base URL from `VITE_API_URL` environment variable (default: `http://localhost:5000/api`).

```javascript
// Run any algorithm
export const runAlgorithm = (route, payload)
// POST /crypto/{route}  with payload as JSON body
// Returns: algorithm-specific result object

// Benchmarking
export const runBenchmarks = (payload)
// POST /benchmarks/run  with {"sizes": [...]}
// Returns: timing and entropy results

export const fetchBenchmarkHistory = ()
// GET /benchmarks/history
// Returns: last 200 benchmark records

// Analysis
export const fetchComparison = ()
// GET /analysis/comparison
// Returns: algorithm metadata

export const fetchSecurity = ()
// GET /analysis/security
// Returns: strengths and weaknesses

// AI Tutor
export const askAITutor = (payload)
// POST /ai/explain  with {algo, stepData, text}
// Returns: {explanation: "..."}
```

JWT tokens (when auth is enabled) are read from `localStorage` and attached as `Authorization: Bearer <token>` headers.

---

## 9. Data Flow — End-to-End Example

### Example: AES CBC Encryption

**User action**: Types `"hello world"` as plaintext, `"mysecretkey12345"` as key, selects CBC mode in AlgorithmLab.

```
1. User fills form → React state updates

2. Click "Encrypt" → AlgorithmLab calls:
   runAlgorithm("symmetric/aes/encrypt", {
     text: "hello world",
     key: "mysecretkey12345",
     mode: "cbc",
     iv: null   // auto-generate
   })

3. api.js sends:
   POST http://localhost:5000/api/crypto/symmetric/aes/encrypt
   Body: {"text": "hello world", "key": "mysecretkey12345", "mode": "cbc"}

4. Flask app.py receives request
   Passes route "symmetric/aes/encrypt" to dispatcher.py
   dispatcher calls: aes_encrypt("hello world", "mysecretkey12345", "cbc", None)

5. aes_encrypt():
   a. Pad text to 16-byte block: "hello world\x00\x00\x00\x00\x00"
   b. Convert key to 16 bytes
   c. Derive 10 round keys via expand_key()
   d. Generate random IV (16 bytes)
   e. XOR block with IV
   f. Run aes_encrypt_block() for 10 rounds:
      - Initial key whitening
      - 10 × (SubBytes, ShiftRows, MixColumns*, AddRoundKey)
      * MixColumns skipped in round 10
   g. Collect round trace (4×4 state after each operation)
   h. Encode output as hex

6. Flask returns JSON:
   {
     "mode": "cbc",
     "ciphertextHex": "a3f7b2...",
     "iv": "1a2b3c...",
     "blocks": [{...}],
     "rounds": [
       {"round": 0, "afterSubBytes": [...], "afterShiftRows": [...], ...},
       ...
       {"round": 9, ...}
     ]
   }

7. React receives response → sets result state

8. AlgorithmInsightPanel renders AESView:
   - Shows hex ciphertext banner
   - Shows CBC chain visualization
   - Renders 4×4 hex matrices for each round state
   - Heat-map colors applied to each byte value

9. InteractivePlayground (if open):
   - User can step through each of the 10 rounds
   - CryptoCube3D animates the cube state changes
   - Click AI Tutor → askAITutor({algo: "aes", stepData: round3data, text: "Explain MixColumns"})
   - Gemini responds with explanation in a modal
```

---

## 10. Dependencies

### Backend (`server/requirements.txt`)

| Package | Version | Purpose |
|---------|---------|---------|
| Flask | 3.1.1 | Web framework, routing, request handling |
| Flask-Cors | 5.0.1 | Allow cross-origin requests from React dev server |
| PyJWT | 2.10.1 | JWT token creation and verification for auth |
| python-dotenv | 1.1.1 | Load `.env` file into environment variables |
| google-generativeai | 0.8.4 | Gemini AI API for step explanations (optional) |

Note: All cryptographic algorithms are implemented from scratch using only Python standard library (`math`, `random`, `hashlib`). No cryptographic library (PyCryptodome, etc.) is used.

### Frontend (`client/package.json`)

| Package | Version | Purpose |
|---------|---------|---------|
| react | 19.2.5 | UI framework |
| react-dom | 19.2.5 | DOM bindings |
| react-router-dom | 7.14.1 | Client-side page routing |
| axios | 1.15.1 | HTTP client for API calls |
| recharts | 3.8.1 | Bar charts, radar charts, benchmark graphs |
| three | 0.184.0 | 3D graphics engine |
| @react-three/fiber | 9.6.1 | React declarative bindings for Three.js |
| @react-three/drei | 10.7.7 | Three.js helper components (OrbitControls, etc.) |
| vite | 8.0.9 | Build tool and dev server |

---

## 11. Setup & Running Locally

### Prerequisites

- Python 3.10+
- Node.js 18+
- (Optional) Google Gemini API key for AI tutor

### Backend

```bash
cd server
cp .env.example .env
# Edit .env: set JWT_SECRET and optionally GEMINI_API_KEY

pip install -r requirements.txt
python app.py
# Server starts on http://localhost:5000
```

### Frontend

```bash
cd client
npm install
# Create .env.local if needed:
# VITE_API_URL=http://localhost:5000/api
npm run dev
# App opens on http://localhost:5173
```

### Environment Variables

**`server/.env`:**
```env
PORT=5000
JWT_SECRET=your-secret-key-here
SQLITE_DB_PATH=./cryptovault.db
GEMINI_API_KEY=optional-api-key
```

**`client/.env.local`** (optional, has defaults):
```env
VITE_API_URL=http://localhost:5000/api
```

### Quick Test

1. Open `http://localhost:5173`
2. Navigate to Algorithm Lab
3. Select "Substitution" → enter any plaintext and a 26-letter permutation key → Encrypt
4. Navigate to Interactive Playground → step through each character substitution
5. Navigate to Dashboard → click "Run Benchmarks" → see timing results

---

## Algorithm Security Summary

| Algorithm | Type | Key Size | Block Size | Practical Security | Broken By |
|-----------|------|----------|-----------|-------------------|-----------|
| Substitution | Classical | 26! keys | N/A | None | Frequency analysis |
| Double Transposition | Classical | Variable | N/A | Weak | Known-plaintext, cribs |
| DES (toy) | Symmetric block | 56-bit | 64-bit | Educational only | Exhaustive search (real DES), simplified here |
| AES (toy) | Symmetric block | 128-bit | 128-bit | Educational only | Structurally correct, simplified operations |
| RSA | Asymmetric | 2048+ bits (toy: 16-bit) | N/A | Toy: none; real: strong | Pollard's rho (toy), general number field sieve (real) |
| ECDH | Asymmetric | 256+ bits (toy: small p) | N/A | Toy: none; real: strong | ECDLP (infeasible for proper params) |
