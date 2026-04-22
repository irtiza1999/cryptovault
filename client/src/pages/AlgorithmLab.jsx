import { useEffect, useMemo, useState } from "react";
import { runAlgorithm, saveRun } from "../services/api";
import ResultPanel from "../components/ResultPanel";
import { useAuth } from "../context/AuthContext";

const ALGOS = [
  { value: "classical/substitution/encrypt", label: "Substitution — Encrypt",          type: "classical", dir: "encrypt", fields: ["text", "key"] },
  { value: "classical/substitution/decrypt", label: "Substitution — Decrypt",          type: "classical", dir: "decrypt", fields: ["text", "key"] },
  { value: "classical/substitution/attack",  label: "Substitution — Frequency Attack", type: "classical", dir: "attack",  fields: ["text"] },
  { value: "classical/transposition/encrypt",label: "Double Transposition — Encrypt",  type: "classical", dir: "encrypt", fields: ["text", "keyA", "keyB"] },
  { value: "classical/transposition/decrypt",label: "Double Transposition — Decrypt",  type: "classical", dir: "decrypt", fields: ["text", "keyA", "keyB"] },
  { value: "symmetric/des/encrypt",          label: "DES — Encrypt",                   type: "symmetric", dir: "encrypt", fields: ["text", "key"] },
  { value: "symmetric/des/decrypt",          label: "DES — Decrypt",                   type: "symmetric", dir: "decrypt", fields: ["desHex", "key"] },
  { value: "symmetric/aes/encrypt",          label: "AES — Encrypt",                   type: "symmetric", dir: "encrypt", fields: ["text", "key"] },
  { value: "symmetric/aes/decrypt",          label: "AES — Decrypt",                   type: "symmetric", dir: "decrypt", fields: ["aesHex", "key"] },
  { value: "public/rsa/keygen",              label: "RSA — Key Generation",            type: "publickey", dir: "keygen",  fields: ["bitSize"] },
  { value: "public/rsa/encrypt",             label: "RSA — Encrypt",                   type: "publickey", dir: "encrypt", fields: ["text", "publicKey"] },
  { value: "public/rsa/decrypt",             label: "RSA — Decrypt",                   type: "publickey", dir: "decrypt", fields: ["cipherInt", "privateKey"] },
  { value: "public/rsa/attack",              label: "RSA — Pollard's Rho Attack",      type: "publickey", dir: "attack",  fields: ["attackN"] },
  { value: "public/ecc/ecdh",               label: "ECC — ECDH Key Exchange",          type: "publickey", dir: "keygen",  fields: ["eccParams"] },
];

const TYPE_LABELS = { classical: "Classical Cryptography", symmetric: "Symmetric-Key", publickey: "Public-Key" };

const DIR_META = {
  encrypt: { label: "ENCRYPT",  cls: "badge-encrypt" },
  decrypt: { label: "DECRYPT",  cls: "badge-decrypt" },
  keygen:  { label: "KEY GEN",  cls: "badge-keygen"  },
  attack:  { label: "ATTACK",   cls: "badge-attack"  },
};

const HINTS = {
  "classical/substitution/encrypt": "key must be 26 unique letters, e.g. phqgiumeaylnofdxkrcvstzwbj",
  "classical/substitution/decrypt": "use the same 26-letter key you encrypted with",
  "symmetric/des/encrypt":          "key: any text (first 8 bytes used)",
  "symmetric/des/decrypt":          "ECB/CBC supported. CBC uses an IV and chains each block.",
  "symmetric/aes/encrypt":          "key: exactly 16 characters",
  "symmetric/aes/decrypt":          "ECB/CBC supported. CBC uses an IV and chains each block.",
  "public/rsa/keygen":              "larger bit size = stronger keys (try 40–256 for demo speed)",
  "public/rsa/encrypt":             "paste the e,n values from an RSA KeyGen result",
  "public/rsa/decrypt":             "paste the d,n values from an RSA KeyGen result",
  "public/rsa/attack":              "enter a small semiprime n to factor, e.g. 8051",
};

export default function AlgorithmLab() {
  const { user } = useAuth();

  const [route,      setRoute]      = useState(ALGOS[0].value);
  const [text,       setText]       = useState("hello world");
  const [desHex,     setDesHex]     = useState("");
  const [aesHex,     setAesHex]     = useState("");
  const [blockMode,  setBlockMode]  = useState("ecb");
  const [desIv,      setDesIv]      = useState("0000000000000000");
  const [aesIv,      setAesIv]      = useState("00000000000000000000000000000000");
  const [cipherInt,  setCipherInt]  = useState("");
  const [key,        setKey]        = useState("phqgiumeaylnofdxkrcvstzwbj");
  const [keyA,       setKeyA]       = useState("2,0,1");
  const [keyB,       setKeyB]       = useState("1,2,0");
  const [bitSize,    setBitSize]    = useState("40");
  const [publicKey,  setPublicKey]  = useState("65537,9173503");
  const [privateKey, setPrivateKey] = useState("4922825,9173503");
  const [attackN,    setAttackN]    = useState("8051");

  // ECC curve parameters — fully editable
  const [eccP,       setEccP]       = useState("97");
  const [eccA,       setEccA]       = useState("2");
  const [eccGx,      setEccGx]      = useState("3");
  const [eccGy,      setEccGy]      = useState("6");
  const [eccPrivA,   setEccPrivA]   = useState("5");
  const [eccPrivB,   setEccPrivB]   = useState("7");

  const [output,     setOutput]     = useState(null);
  const [error,      setError]      = useState("");
  const [notice,     setNotice]     = useState("");
  const [running,    setRunning]    = useState(false);

  const currentAlgo = ALGOS.find((a) => a.value === route);

  const payload = useMemo(() => {
    const p = { text, message: text, key, keyA, keyB, bitSize: parseInt(bitSize) || 40 };

    if (route.includes("des/decrypt"))  p.text = desHex;
    if (route.includes("aes/decrypt"))  p.text = aesHex;

    if (route.startsWith("symmetric/des")) {
      p.mode = blockMode;
      if (blockMode === "cbc") p.iv = desIv;
    }
    if (route.startsWith("symmetric/aes")) {
      p.mode = blockMode;
      if (blockMode === "cbc") p.iv = aesIv;
    }

    if (route.includes("rsa/encrypt")) {
      const [e, n] = publicKey.split(",");
      p.publicKey = { e: (e || "").trim(), n: (n || "").trim() };
    }
    if (route.includes("rsa/decrypt")) {
      const [d, n] = privateKey.split(",");
      p.privateKey = { d: (d || "").trim(), n: (n || "").trim() };
      p.ciphertext = cipherInt;
      p.text       = cipherInt;
    }
    if (route.includes("rsa/attack"))  p.n = attackN;

    if (route.includes("ecc/ecdh")) {
      p.p        = eccP;
      p.a        = eccA;
      p.G        = { x: eccGx, y: eccGy };
      p.privateA = eccPrivA;
      p.privateB = eccPrivB;
    }
    return p;
  }, [route, text, desHex, aesHex, cipherInt, key, keyA, keyB,
      blockMode, desIv, aesIv, bitSize, publicKey, privateKey, attackN,
      eccP, eccA, eccGx, eccGy, eccPrivA, eccPrivB]);

  useEffect(() => {
    if (!output?.ivHex || !route.includes("encrypt")) return;
    if (output.mode !== "CBC") return;
    if (route.startsWith("symmetric/des")) setDesIv(output.ivHex);
    if (route.startsWith("symmetric/aes")) setAesIv(output.ivHex);
  }, [output, route]);

  async function run() {
    setError(""); setNotice(""); setRunning(true);
    try {
      const res = await runAlgorithm(route, payload);
      setOutput(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setOutput(null);
    } finally {
      setRunning(false);
    }
  }

  async function saveCurrentRun() {
    if (!user || !output) { setNotice("Log in and run an algorithm first."); return; }
    try {
      await saveRun({ route, input: payload, output, notes: "saved from lab", favorite: false, tags: ["lab"] });
      setNotice("Saved to My Vault.");
    } catch (err) {
      setNotice(err.response?.data?.message || err.message);
    }
  }

  function applyGeneratedKeys() {
    if (!output?.publicKey || !output?.privateKey) return;
    const { e, n } = output.publicKey;
    const { d }    = output.privateKey;
    setPublicKey(`${e},${n}`);
    setPrivateKey(`${d},${n}`);
    setNotice("Generated keys pasted into RSA Encrypt / Decrypt fields.");
  }

  const badge = DIR_META[currentAlgo?.dir] || DIR_META.encrypt;
  const hint  = HINTS[route] || "";

  function switchRoute(val) {
    setRoute(val);
    setOutput(null);
    setError("");
    setNotice("");
  }

  return (
    <div className="card lab-card">
      {/* ── Header ─────────────────────────────────── */}
      <div className="lab-header">
        <div>
          <h2 className="lab-title">Algorithm Lab</h2>
          <p className="lab-subtitle">Pick an algorithm, configure inputs, trace every step.</p>
        </div>
        <span className={`dir-badge ${badge.cls}`}>{badge.label}</span>
      </div>

      {/* ── Algorithm Selector ─────────────────────── */}
      <div className="algo-selector-wrap">
        <label className="algo-selector-label">
          <span className="field-label">Algorithm</span>
          <select value={route} onChange={(e) => switchRoute(e.target.value)}>
            {["classical", "symmetric", "publickey"].map((type) => (
              <optgroup key={type} label={TYPE_LABELS[type]}>
                {ALGOS.filter((a) => a.type === type).map((algo) => (
                  <option key={algo.value} value={algo.value}>{algo.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        {hint && <p className="algo-hint">ℹ {hint}</p>}
      </div>

      {/* ── Input Fields ───────────────────────────── */}
      <div className="form-grid lab-form">

        {currentAlgo?.fields.includes("text") && (
          <label className="field-full">
            <span className="field-label">{route.includes("decrypt") ? "Ciphertext / Input" : "Plaintext / Message"}</span>
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter text…" />
          </label>
        )}

        {currentAlgo?.fields.includes("desHex") && (
          <label className="field-full">
            <span className="field-label">DES Ciphertext (hex)</span>
             <input value={desHex} onChange={(e) => setDesHex(e.target.value)} placeholder="hex ciphertext from DES Encrypt run (can span multiple 8-byte blocks)" className="mono-input" />
          </label>
        )}

        {currentAlgo?.fields.includes("aesHex") && (
          <label className="field-full">
            <span className="field-label">AES Ciphertext (hex)</span>
            <input value={aesHex} onChange={(e) => setAesHex(e.target.value)} placeholder="32-character hex from AES Encrypt" className="mono-input" />
          </label>
        )}

        {currentAlgo?.fields.includes("cipherInt") && (
          <label className="field-full">
            <span className="field-label">RSA Ciphertext (integer from Encrypt)</span>
            <input value={cipherInt} onChange={(e) => setCipherInt(e.target.value)} placeholder="e.g. 12345678" className="mono-input" />
          </label>
        )}

        {route.startsWith("symmetric/des") || route.startsWith("symmetric/aes") ? (
          <label className="field-full">
            <span className="field-label">Block Mode</span>
            <select value={blockMode} onChange={(e) => setBlockMode(e.target.value)}>
              <option value="ecb">ECB - independent blocks</option>
              <option value="cbc">CBC - chained with IV</option>
            </select>
            <p className="algo-hint">
              ECB encrypts each block directly. CBC XORs every block with the IV or previous ciphertext before the block cipher runs.
            </p>
          </label>
        ) : null}

        {route.startsWith("symmetric/des") && blockMode === "cbc" && (
          <label className="field-full">
            <span className="field-label">DES IV (hex)</span>
            <input value={desIv} onChange={(e) => setDesIv(e.target.value)} placeholder="0000000000000000" className="mono-input" />
          </label>
        )}

        {route.startsWith("symmetric/aes") && blockMode === "cbc" && (
          <label className="field-full">
            <span className="field-label">AES IV (hex)</span>
            <input value={aesIv} onChange={(e) => setAesIv(e.target.value)} placeholder="00000000000000000000000000000000" className="mono-input" />
          </label>
        )}

        {currentAlgo?.fields.includes("attackN") && (
          <label className="field-full">
            <span className="field-label">Modulus n to Factor</span>
            <input value={attackN} onChange={(e) => setAttackN(e.target.value)} placeholder="e.g. 8051" className="mono-input" />
          </label>
        )}

        {currentAlgo?.fields.includes("key") && (
          <label>
            <span className="field-label">
              {route.includes("substitution") ? "Cipher Key (26-letter permutation)" : "Key"}
            </span>
            <input value={key} onChange={(e) => setKey(e.target.value)} placeholder={route.includes("substitution") ? "phqgiumeaylnofdxkrcvstzwbj" : "secret key"} className="mono-input" />
          </label>
        )}

        {currentAlgo?.fields.includes("keyA") && (
          <label>
            <span className="field-label">Key A — column indices (comma-separated)</span>
            <input value={keyA} onChange={(e) => setKeyA(e.target.value)} placeholder="e.g. 2,0,1" className="mono-input" />
          </label>
        )}

        {currentAlgo?.fields.includes("keyB") && (
          <label>
            <span className="field-label">Key B — column indices (comma-separated)</span>
            <input value={keyB} onChange={(e) => setKeyB(e.target.value)} placeholder="e.g. 1,2,0" className="mono-input" />
          </label>
        )}

        {currentAlgo?.fields.includes("bitSize") && (
          <label>
            <span className="field-label">RSA Key Bit Size</span>
            <input type="number" value={bitSize} onChange={(e) => setBitSize(e.target.value)} min="16" max="1024" />
          </label>
        )}

        {currentAlgo?.fields.includes("publicKey") && (
          <label className="field-full">
            <span className="field-label">Public Key — e,n (paste from KeyGen)</span>
            <input value={publicKey} onChange={(e) => setPublicKey(e.target.value)} placeholder="e.g. 65537,9173503" className="mono-input" />
          </label>
        )}

        {currentAlgo?.fields.includes("privateKey") && (
          <label className="field-full">
            <span className="field-label">Private Key — d,n (paste from KeyGen)</span>
            <input value={privateKey} onChange={(e) => setPrivateKey(e.target.value)} placeholder="e.g. 4922825,9173503" className="mono-input" />
          </label>
        )}

        {currentAlgo?.fields.includes("eccParams") && (
          <div className="ecc-params-box field-full">
            <div className="ecc-params-title">ECC Curve Parameters</div>
            <p className="ecc-equation">y² ≡ x³ + <strong>{eccA}</strong>x (mod <strong>{eccP}</strong>),  G = ({eccGx}, {eccGy})</p>
            <div className="form-grid ecc-inner-grid">
              <label>
                <span className="field-label">Prime p</span>
                <input value={eccP} onChange={(e) => setEccP(e.target.value)} className="mono-input" />
              </label>
              <label>
                <span className="field-label">Coefficient a</span>
                <input value={eccA} onChange={(e) => setEccA(e.target.value)} className="mono-input" />
              </label>
              <label>
                <span className="field-label">Base Point G.x</span>
                <input value={eccGx} onChange={(e) => setEccGx(e.target.value)} className="mono-input" />
              </label>
              <label>
                <span className="field-label">Base Point G.y</span>
                <input value={eccGy} onChange={(e) => setEccGy(e.target.value)} className="mono-input" />
              </label>
              <label>
                <span className="field-label">Alice's private key (a)</span>
                <input value={eccPrivA} onChange={(e) => setEccPrivA(e.target.value)} className="mono-input" />
              </label>
              <label>
                <span className="field-label">Bob's private key (b)</span>
                <input value={eccPrivB} onChange={(e) => setEccPrivB(e.target.value)} className="mono-input" />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* ── Actions ────────────────────────────────── */}
      <div className="lab-actions">
        <button onClick={run} disabled={running} className="run-btn">
          {running ? "⏳ Computing…" : "▶  Run Algorithm"}
        </button>
        <button onClick={saveCurrentRun} className="ghost-button">💾 Save to Vault</button>
        {route.includes("rsa/keygen") && output?.publicKey && (
          <button onClick={applyGeneratedKeys} className="ghost-button use-keys-btn">
            ⚡ Use These Keys
          </button>
        )}
      </div>

      {error  && <p className="error lab-error">✗ {error}</p>}
      {notice && <p className="pill notice-pill">{notice}</p>}

      {output && (
        <ResultPanel title={currentAlgo?.label} data={output} route={route} payload={payload} />
      )}
    </div>
  );
}
