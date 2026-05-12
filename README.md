# CryptoVault React + Flask + Python Engine

CryptoVault now uses a full Python backend with Flask. All cryptographic algorithms and API logic run in Python, while the frontend remains React + Vite.

## What is implemented

- Flask backend with JWT auth and SQLite persistence
- Python algorithm engine used directly by Flask for all crypto operations
- Modern UI refresh with theme switcher and responsive layout
- Unique features:
  - Cipher Challenge game mode
  - My Vault for authenticated users to save/favorite/delete run history
- Core pages:
  - Dashboard
  - Algorithm Lab
  - Comparison Dashboard
  - Security Analysis
  - Cipher Challenge
  - My Vault
  - Login/Register

## Project structure

```text
cryptovault-mern/
  client/                      React + Vite frontend
  server/                      Flask + SQLite backend
    python/cli_runner.py       Python algorithm dispatch and implementations
    app.py                     Flask API server
    requirements.txt           Python dependencies
```

## Setup

1. Install dependencies:

```bash
npm install
npm install --prefix client
python -m pip install -r server/requirements.txt
```

2. Configure environment files:

```bash
copy server\\.env.example server\\.env
copy client\\.env.example client\\.env
```

3. Ensure Python is available in PATH.

4. Start in dev mode:

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Environment variables

Server example fields in [server/.env.example](server/.env.example):
- `PORT`
- `SQLITE_DB_PATH`
- `JWT_SECRET`
- `PYTHON_EXECUTABLE`
- `NODE_ENV`

## Scripts

- Root:
  - `npm run dev`
  - `npm run build`
  - `npm run test`
- Client:
  - `npm run dev`
  - `npm run build`
  - `npm run preview`

## Key API routes

- Health:
  - `GET /api/health`
- Auth:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/auth/me`
- User Vault (auth required):
  - `GET /api/users/me`
  - `POST /api/users/runs`
  - `GET /api/users/runs`
  - `PATCH /api/users/runs/:id`
  - `DELETE /api/users/runs/:id`
- Crypto (python-backed):
  - `POST /api/crypto/classical/substitution/encrypt`
  - `POST /api/crypto/classical/substitution/decrypt`
  - `POST /api/crypto/classical/transposition/encrypt`
  - `POST /api/crypto/classical/transposition/decrypt`
  - `POST /api/crypto/symmetric/des/encrypt`
  - `POST /api/crypto/symmetric/des/decrypt`
  - `POST /api/crypto/symmetric/aes/encrypt`
  - `POST /api/crypto/symmetric/aes/decrypt`
  - `POST /api/crypto/public/rsa/keygen`
  - `POST /api/crypto/public/rsa/encrypt`
  - `POST /api/crypto/public/rsa/decrypt`
  - `POST /api/crypto/public/ecc/ecdh`
- Analysis + Benchmarks:
  - `POST /api/benchmarks/run`
  - `GET /api/benchmarks/history`
  - `GET /api/analysis/comparison`
  - `GET /api/analysis/security`

## Note

DES follows the full FIPS 46-3 specification: PC-1/PC-2 key schedule, eight standard S-boxes, IP/FP permutations, E expansion, and P permutation.

AES follows FIPS 197 (AES-128): Rijndael S-box, standard ShiftRows, GF(2⁸) MixColumns with precomputed multiplication tables, and RotWord/SubWord/Rcon key expansion.

Both produce results interoperable with other standards-compliant implementations. Neither uses constant-time operations or standard padding (PKCS#7), so they are not hardened for production use.
