import { useEffect, useMemo, useState } from "react";
import { runAlgorithm } from "../services/api";
import { askAITutor } from "../services/api";
import CryptoCube3D from "../components/CryptoCube3D";
import CipherRings3D from "../components/CipherRings3D";
import TranspositionGrid3D from "../components/TranspositionGrid3D";
import FeistelTower3D from "../components/FeistelTower3D";
import RSAClock3D from "../components/RSAClock3D";

const DEFAULT_SUB_KEY = "phqgiumeaylnofdxkrcvstzwbj";
const SPEED_MS = { "0.5": 1600, "1": 800, "2": 350 };

function randomSubstitutionKey() {
  const letters = "abcdefghijklmnopqrstuvwxyz".split("");
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  return letters.join("");
}

function hexCellClass(hexStr) {
  const v = parseInt(hexStr, 16);
  if (isNaN(v)) return "";
  if (v < 64)  return "hc-0";
  if (v < 128) return "hc-1";
  if (v < 192) return "hc-2";
  return "hc-3";
}

function HexGrid({ hexStr }) {
  const raw   = (hexStr || "").replace(/\s/g, "");
  const bytes = raw.match(/.{1,2}/g) || [];
  while (bytes.length < 16) bytes.push("··");
  return (
    <div className="hex-grid">
      {[0, 1, 2, 3].map((r) => (
        <div key={r} className="hex-row">
          {[0, 1, 2, 3].map((c) => {
            const byte = bytes[r * 4 + c];
            return (
              <span key={c} className={`hex-cell ${hexCellClass(byte)}`}>{byte}</span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function BitBlocks({ bits, limit = 32 }) {
  const s = (bits || "").slice(0, limit);
  return (
    <span className="bit-blocks">
      {s.split("").map((b, i) => (
        <span key={i} className={`bit-block bit-${b}`} />
      ))}
      {bits && bits.length > limit && <span className="bit-more">+{bits.length - limit}</span>}
    </span>
  );
}

function InteractivePlayground() {
  const [algo,    setAlgo]    = useState("classical/substitution/encrypt");
  const [text,    setText]    = useState("cryptovault makes learning crypto fun");
  const [key,     setKey]     = useState(DEFAULT_SUB_KEY);
  const [keyA,    setKeyA]    = useState("2,0,1");
  const [keyB,    setKeyB]    = useState("1,2,0");
  const [bitSize, setBitSize] = useState(32);
  const [speed,   setSpeed]   = useState("1");
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState("");
  const [stepIndex, setStepIndex] = useState(0);
  const [playing,   setPlaying]   = useState(false);
  const [aiExplanation, setAiExplanation] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    setAiExplanation("");
  }, [stepIndex, algo]);

  const steps = useMemo(() => {
    if (!result) return [];
    if (result.steps)  return result.steps;
    if (result.rounds) return result.rounds;
    if (result.intermediate) {
      const { intermediate } = result;
      return [
        { step: "First Grid",       value: JSON.stringify(intermediate.firstMatrix) },
        { step: "After Key A",      value: intermediate.afterFirst },
        { step: "Second Grid",      value: JSON.stringify(intermediate.secondMatrix) },
        { step: "Final Ciphertext", value: result.ciphertext },
      ];
    }
    return [];
  }, [result]);

  const totalSteps  = steps.length;
  const currentStep = totalSteps > 0 ? steps[stepIndex] : null;
  const progress    = totalSteps ? Math.round(((stepIndex + 1) / totalSteps) * 100) : 0;

  useEffect(() => {
    if (!playing || !totalSteps) return undefined;
    const id = window.setInterval(() => {
      setStepIndex((prev) => {
        if (prev >= totalSteps - 1) { setPlaying(false); return prev; }
        return prev + 1;
      });
    }, SPEED_MS[speed] || 800);
    return () => window.clearInterval(id);
  }, [playing, totalSteps, speed]);

  useEffect(() => {
    function onKey(e) {
      if (!totalSteps) return;
      if (e.key === "ArrowRight") setStepIndex((p) => Math.min(p + 1, totalSteps - 1));
      if (e.key === "ArrowLeft")  setStepIndex((p) => Math.max(p - 1, 0));
      if (e.key === " ") { e.preventDefault(); setPlaying((p) => !p); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [totalSteps]);

  async function run() {
    setError("");
    setPlaying(false);
    setResult(null);
    try {
      let payload = { text };
      if (algo.includes("substitution"))  payload.key  = key;
      else if (algo.includes("transposition")) { payload.keyA = keyA; payload.keyB = keyB; }
      else if (algo.includes("des") || algo.includes("aes")) payload.key = key;
      else if (algo.includes("rsa")) {
        const keyRes = await runAlgorithm("public/rsa/keygen", { bitSize });
        payload = { message: text.slice(0, 4), publicKey: keyRes.data.publicKey };
      }
      const res = await runAlgorithm(algo, payload);
      setResult(res.data);
      setStepIndex(0);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }

  async function handleAskAI() {
    if (!currentStep) return;
    setAiLoading(true);
    setAiExplanation("");
    try {
      const payload = {
        algo: algo,
        stepData: currentStep,
        text: text
      };
      const res = await askAITutor(payload);
      setAiExplanation(res.data.explanation);
    } catch (err) {
      setAiExplanation(err.response?.data?.message || "Failed to contact AI Tutor.");
    } finally {
      setAiLoading(false);
    }
  }

  const algoFamily = algo.split("/")[1] || "";

  return (
    <section className="card playground">
      <div className="playground-head">
        <div>
          <h2>Interactive Cryptography Studio</h2>
          <p>Visualize the inner workings of encryption step-by-step, in real time.</p>
        </div>
        <span className="pill badge-encrypt">Interactive</span>
      </div>

      <div className="pg-layout">
        <div className="pg-input-section">
          <div className="pg-algo-select-wrap">
            <label>
              <span className="field-label">Algorithm</span>
              <select
                value={algo}
                onChange={(e) => {
                  const v = e.target.value;
                  setAlgo(v);
                  setResult(null);
                  if (v.includes("substitution")) setKey(DEFAULT_SUB_KEY);
                  else if (v.includes("des"))      setKey("secret!!");
                  else if (v.includes("aes"))      setKey("sixteen-char-key");
                }}
              >
                <option value="classical/substitution/encrypt">Substitution (Classical)</option>
                <option value="classical/transposition/encrypt">Double Transposition (Classical)</option>
                <option value="symmetric/des/encrypt">DES (Symmetric)</option>
                <option value="symmetric/aes/encrypt">AES (Symmetric)</option>
                <option value="public/rsa/encrypt">RSA (Public Key)</option>
              </select>
            </label>
          </div>

          <label>
            <span className="field-label">Input Text</span>
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter text…" />
          </label>

          {algo.includes("substitution") && (
            <label>
              <span className="field-label">Alphabet Key</span>
              <input
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="mono-input"
                placeholder="26-letter permutation"
              />
            </label>
          )}

          {algo.includes("transposition") && (
            <>
              <label>
                <span className="field-label">Key A</span>
                <input value={keyA} onChange={(e) => setKeyA(e.target.value)} className="mono-input" />
              </label>
              <label>
                <span className="field-label">Key B</span>
                <input value={keyB} onChange={(e) => setKeyB(e.target.value)} className="mono-input" />
              </label>
            </>
          )}

          {(algo.includes("des") || algo.includes("aes")) && (
            <label>
              <span className="field-label">Secret Key</span>
              <input value={key} onChange={(e) => setKey(e.target.value)} className="mono-input" />
            </label>
          )}

          {algo.includes("rsa") && (
            <label>
              <span className="field-label">Key Bit Size</span>
              <select value={bitSize} onChange={(e) => setBitSize(e.target.value)}>
                <option value="16">16-bit (Fastest)</option>
                <option value="32">32-bit (Small)</option>
                <option value="64">64-bit (Medium)</option>
              </select>
            </label>
          )}

          <div className="pg-speed-row">
            <span className="pg-speed-label">Animation Speed</span>
            <div className="pg-speed-btns">
              {["0.5", "1", "2"].map((s) => (
                <button
                  key={s}
                  className={`pg-speed-btn ${speed === s ? "active" : ""}`}
                  onClick={() => setSpeed(s)}
                >
                  {s}×
                </button>
              ))}
            </div>
          </div>

          <div className="pg-actions">
            <button onClick={run} className="run-btn">▶ Execute</button>
            {algo.includes("substitution") && (
              <button className="ghost-button" onClick={() => setKey(randomSubstitutionKey())}>
                Random Key
              </button>
            )}
            <button
              className="ghost-button"
              onClick={() => setPlaying((p) => !p)}
              disabled={!totalSteps}
            >
              {playing ? "⏸ Pause" : "▶ Play"}
            </button>
          </div>

          {totalSteps > 0 && (
            <p className="pg-key-hint">
              <kbd>←</kbd> <kbd>→</kbd> navigate steps &nbsp;·&nbsp; <kbd>Space</kbd> play/pause
            </p>
          )}
        </div>

        {result && (
          <div className="workflow-summary" style={{ display: "flex", flexDirection: "column", gap: "0.75rem", margin: 0 }}>
            <div className="workflow-card workflow-input">
              <span className="workflow-label">Input</span>
              <div className="workflow-row">
                <strong>Algorithm</strong>
                <span>{algoFamily.toUpperCase()}</span>
              </div>
              <div className="workflow-row">
                <strong>Text</strong>
                <span style={{ wordBreak: "break-all" }}>{text.slice(0, 60)}{text.length > 60 ? "…" : ""}</span>
              </div>
            </div>
            <div className="workflow-card workflow-output">
              <span className="workflow-label">Output</span>
              <div className="workflow-row">
                <strong>Ciphertext</strong>
                <span style={{ wordBreak: "break-all", fontFamily: "monospace", fontSize: "0.82rem" }}>
                  {(result.text || result.ciphertext || result.ciphertextHex || "—").slice(0, 80)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && <p className="error" style={{ marginBottom: "1rem" }}>✗ {error}</p>}

      {result && totalSteps > 0 && (
        <div className="step-control-card card" style={{ marginBottom: 0 }}>
          <div className="step-control-head">
            <h3>Execution Timeline — {algoFamily.toUpperCase()}</h3>
            <span className="step-counter-badge">
              Step {stepIndex + 1} / {totalSteps}
            </span>
          </div>

          <input
            type="range"
            className="pg-slider"
            min="0"
            max={Math.max(0, totalSteps - 1)}
            value={stepIndex}
            onChange={(e) => { setPlaying(false); setStepIndex(Number(e.target.value)); }}
          />

          <div className="playground-progress-track">
            <span style={{ width: `${progress}%` }} />
          </div>

          <div className="step-detail-viewer">
            <StepViewer result={result} stepIndex={stepIndex} algo={algo} steps={steps} />
          </div>

          <div className="ai-tutor-section" style={{ marginTop: '1rem', padding: '1rem', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: aiExplanation || aiLoading ? '1rem' : 0 }}>
              <strong style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.2rem' }}>🤖</span> AI Crypto Tutor
              </strong>
              <button 
                onClick={handleAskAI} 
                disabled={aiLoading}
                className="pill badge-encrypt"
                style={{ cursor: 'pointer', border: 'none' }}
              >
                {aiLoading ? "Thinking..." : "Explain This Step"}
              </button>
            </div>
            
            {aiLoading && <div style={{ fontStyle: 'italic', color: 'var(--muted)', fontSize: '0.9rem' }}>Analyzing cryptographic context...</div>}
            
            {aiExplanation && !aiLoading && (
              <div className="ai-explanation-content" style={{ fontSize: '0.95rem', lineHeight: '1.6', padding: '1rem', background: 'var(--bg)', borderRadius: '4px', borderLeft: '4px solid #3b82f6' }}>
                {aiExplanation.split('\n').map((para, i) => (
                  <p key={i} style={{ margin: '0 0 0.5rem 0' }}>{para}</p>
                ))}
              </div>
            )}
          </div>

          <div className="playground-3d-view" style={{ marginTop: '1.5rem' }}>
            {algo.includes("substitution") && <CipherRings3D stepIndex={stepIndex} result={result} />}
            {algo.includes("transposition") && <TranspositionGrid3D stepIndex={stepIndex} result={result} />}
            {algo.includes("des") && <FeistelTower3D stepIndex={stepIndex} result={result} />}
            {algo.includes("aes") && <CryptoCube3D stepIndex={stepIndex} result={result} />}
            {algo.includes("rsa") && <RSAClock3D stepIndex={stepIndex} result={result} />}
          </div>
        </div>
      )}

      {result && totalSteps === 0 && (
        <p className="no-steps-msg">No step-by-step trace available for this operation.</p>
      )}
    </section>
  );
}

export default InteractivePlayground;

function SubstitutionDisplay({ result, stepIndex }) {
  if (!result?.steps?.[stepIndex]) return null;
  const item = result.steps[stepIndex];
  return (
    <div className="step-trace-card">
      <div className="trace-item active">
        <span className="trace-idx">Index {item.index}:</span>
        <span className="trace-val">{item.in} → {item.out}</span>
      </div>
    </div>
  );
}

function AESDisplay({ result, stepIndex }) {
  if (!result?.rounds?.[stepIndex]) return null;
  const round = result.rounds[stepIndex];
  return (
    <div className="round-card">
      <h4>Round {round.round} Output</h4>
      <div className="hex-display">{round.stateHex}</div>
    </div>
  );
}

function DESDisplay({ result, stepIndex }) {
  if (!result?.rounds?.[stepIndex]) return null;
  const round = result.rounds[stepIndex];
  return (
    <div className="round-card">
      <h4>Round {round.round}</h4>
      <div className="bit-split">
        <div>L: <code className="bit-code">{round.left}</code></div>
        <div>R: <code className="bit-code">{round.right}</code></div>
      </div>
    </div>
  );
}

function GenericDisplay({ steps, stepIndex }) {
  if (!steps[stepIndex]) return null;
  const item = steps[stepIndex];
  return (
    <div className="generic-step">
      <h4>{item.step}</h4>
      <div className="step-val">{item.value || item.formula}</div>
    </div>
  );
}

function StepViewer({ result, stepIndex, algo, steps }) {
  const totalSteps = result ? (result.steps?.length || result.rounds?.length || steps?.length || 0) : 0;
  if (!result || !totalSteps) return null;
  if (algo.includes("substitution") && result.steps) return <SubstitutionDisplay result={result} stepIndex={stepIndex} />;
  if (algo.includes("aes") && result.rounds)         return <AESDisplay result={result} stepIndex={stepIndex} />;
  if (algo.includes("des") && result.rounds)         return <DESDisplay result={result} stepIndex={stepIndex} />;
  return <GenericDisplay steps={steps} stepIndex={stepIndex} />;
}

