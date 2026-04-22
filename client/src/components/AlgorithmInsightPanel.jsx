import { useMemo, useState } from "react";

/* ─────────────────────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────────────────────── */

function detectFamily(route) {
  if (!route) return "general";
  if (route.startsWith("classical/substitution")) return "substitution";
  if (route.startsWith("classical/transposition")) return "transposition";
  if (route.startsWith("symmetric/des"))           return "des";
  if (route.startsWith("symmetric/aes"))           return "aes";
  if (route.startsWith("public/rsa"))              return "rsa";
  if (route.startsWith("public/ecc"))              return "ecc";
  return "general";
}

function pointStr(pt) {
  if (pt === null || pt === undefined) return "∞ (point at infinity)";
  if (typeof pt === "object" && "x" in pt) return `(${pt.x}, ${pt.y})`;
  return String(pt);
}

function trimTo(val, n = 52) {
  const s = typeof val === "string" ? val : JSON.stringify(val ?? "");
  return s.length > n ? s.slice(0, n) + "…" : s;
}

function hexToBits(hexStr, bitLength = 64) {
  const cleaned = String(hexStr || "").replace(/\s/g, "").replace(/^0x/i, "");
  if (!cleaned) return "0".repeat(bitLength);
  return BigInt(`0x${cleaned}`).toString(2).padStart(bitLength, "0").slice(-bitLength);
}

/* Byte value → heat-map CSS class for AES hex cells */
function hexCellClass(hexStr) {
  const v = parseInt(hexStr, 16);
  if (isNaN(v)) return "";
  if (v < 64)  return "hc-0";
  if (v < 128) return "hc-1";
  if (v < 192) return "hc-2";
  return "hc-3";
}

/* ─────────────────────────────────────────────────────────────
   Primitive UI pieces
   ───────────────────────────────────────────────────────────── */

function ResultBanner({ label, value, mono = true }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(String(value)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <div className="result-banner">
      <span className="result-banner-label">{label}</span>
      <div className="result-banner-value-row">
        <span className={`result-banner-value ${mono ? "mono" : ""}`}>{value}</span>
        <button className="copy-inline-btn" onClick={copy} title="Copy">
          {copied ? "✓" : "⎘"}
        </button>
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return <div className="section-label">{children}</div>;
}

function FormulaBox({ children }) {
  return <div className="formula-box">{children}</div>;
}

/* AES 4×4 hex state matrix — heat-map colored */
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
              <span key={c} className={`hex-cell ${hexCellClass(byte)}`}>
                {byte}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* Visual bit-block row instead of text */
function BitBlocks({ bits, limit = 32 }) {
  const s = (bits || "").slice(0, limit);
  return (
    <span className="bit-blocks">
      {s.split("").map((b, i) => (
        <span key={i} className={`bit-block bit-${b}`} />
      ))}
      {bits && bits.length > limit && (
        <span className="bit-more">+{bits.length - limit}</span>
      )}
    </span>
  );
}

/* Vertical timeline step */
function Step({ n, title, tone = "blue", last = false, children }) {
  return (
    <div className={`tl-step tone-${tone}`}>
      <div className="tl-spine">
        <div className="tl-dot">{n}</div>
        {!last && <div className="tl-line" />}
      </div>
      <div className="tl-content">
        <div className="tl-title">{title}</div>
        <div className="tl-body">{children}</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   RSA View
   ───────────────────────────────────────────────────────────── */

function KeyBox({ title, fields, copyStr, accent }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(copyStr).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <div className={`key-box key-${accent}`}>
      <div className="key-box-title">{title}</div>
      <div className="key-box-fields">
        {fields.map(({ var: v, val }) => (
          <div key={v} className="key-box-row">
            <span className="key-var">{v}</span>
            <code className="key-val">{trimTo(String(val ?? ""), 40)}</code>
          </div>
        ))}
      </div>
      <button className="copy-btn" onClick={copy}>
        {copied ? "✓ Copied" : `Copy ${fields.map((f) => f.var).join(", ")}`}
      </button>
    </div>
  );
}

function RSAView({ data, route }) {
  const steps    = data?.steps    || [];
  const isKeygen  = route?.includes("keygen");
  const isEncrypt = route?.includes("encrypt");
  const isDecrypt = route?.includes("decrypt");
  const isAttack  = route?.includes("attack");
  const tones = ["blue", "teal", "blue", "teal", "blue", "teal", "blue"];

  return (
    <div>
      {/* ── Key pair ── */}
      {isKeygen && data?.publicKey && (
        <>
          <SectionLabel>Generated Key Pair</SectionLabel>
          <div className="key-pair-row">
            <KeyBox
              title="PUBLIC KEY"
              accent="public"
              fields={[{ var: "e", val: data.publicKey.e }, { var: "n", val: data.publicKey.n }]}
              copyStr={`${data.publicKey.e},${data.publicKey.n}`}
            />
            <KeyBox
              title="PRIVATE KEY"
              accent="private"
              fields={[{ var: "d", val: data.privateKey?.d }, { var: "n", val: data.privateKey?.n }]}
              copyStr={`${data.privateKey?.d},${data.privateKey?.n}`}
            />
            {data.meta && (
              <KeyBox
                title="PARAMETERS"
                accent="meta"
                fields={[
                  { var: "p",    val: data.meta.p   },
                  { var: "q",    val: data.meta.q   },
                  { var: "φ(n)", val: data.meta.phi },
                ]}
                copyStr={`p=${data.meta.p} q=${data.meta.q} φ=${data.meta.phi}`}
              />
            )}
          </div>
        </>
      )}

      {isEncrypt && data?.ciphertext && (
        <ResultBanner label="Ciphertext (integer)" value={data.ciphertext} />
      )}

      {isDecrypt && data?.plaintext !== undefined && (
        <ResultBanner label="Recovered Plaintext" value={data.plaintext} />
      )}

      {/* ── Attack result ── */}
      {isAttack && (
        <div className={`attack-result-box ${data?.success ? "success" : "fail"}`}>
          <div className="attack-status">
            {data?.success ? "✓ Factor Found!" : "✗ No Factor Found"}
          </div>
          {data?.success && (
            <div className="attack-factors">
              <span>p = <code>{data.factor}</code></span>
              <span>q = <code>{data.cofactor}</code></span>
              <span>Iterations: <code>{data.iterations}</code></span>
            </div>
          )}
          {!data?.success && <p className="attack-msg">{data?.message}</p>}
        </div>
      )}

      {/* ── Step-by-step trace ── */}
      <SectionLabel>Step-by-Step Computation</SectionLabel>
      <div className="timeline">
        {steps.length > 0 ? (
          steps.map((s, i) => (
            <Step
              key={i}
              n={i + 1}
              title={s.step}
              tone={tones[i % tones.length]}
              last={i === steps.length - 1}
            >
              {s.formula && <FormulaBox>{s.formula}</FormulaBox>}
              {s.value   && <code className="step-code">{s.value}</code>}
            </Step>
          ))
        ) : (
          <p className="no-steps-msg">No detailed trace for this operation.</p>
        )}
      </div>

      {/* ── Pollard's rho trace ── */}
      {isAttack && data?.trace?.length > 0 && (
        <>
          <SectionLabel>Pollard's Rho Iteration Trace (first 10)</SectionLabel>
          <div className="trace-table-wrap">
            <table className="trace-table">
              <thead>
                <tr>
                  <th>Iter</th>
                  <th>x (slow)</th>
                  <th>y (fast)</th>
                  <th>gcd(|x−y|, n)</th>
                </tr>
              </thead>
              <tbody>
                {data.trace.slice(0, 10).map((row) => (
                  <tr key={row.iteration} className={row.gcd !== "1" ? "tr-hit" : ""}>
                    <td>{row.iteration}</td>
                    <td><code>{row.x}</code></td>
                    <td><code>{row.y}</code></td>
                    <td><code>{row.gcd}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   AES View — heat-map state matrices
   ───────────────────────────────────────────────────────────── */

function AESView({ data, route }) {
  const mode      = (data?.mode || "ECB").toUpperCase();
  const isCBC     = mode === "CBC";
  const isDecrypt = route?.includes("decrypt");
  const result    = isDecrypt ? data?.plaintext : data?.ciphertextHex;
  const blocks    = data?.blocks || [];
  const rounds    = blocks[0]?.rounds || data?.rounds || [];

  return (
    <div>
      {result !== undefined && result !== null && (
        <ResultBanner label={isDecrypt ? "Decrypted Plaintext" : "Ciphertext (hex)"} value={result} />
      )}

      {isCBC && data?.ivHex !== undefined && data?.ivHex !== null && (
        <ResultBanner label="CBC IV (hex)" value={data.ivHex} />
      )}

      <SectionLabel>{mode} Block Flow — 4×4 Byte Matrices</SectionLabel>
      <p className="step-note">
        ECB processes each 16-byte block independently. CBC chains blocks by XORing the current block with the previous ciphertext, or the IV for the first block, before the AES rounds.
      </p>

      {blocks.length > 0 && (
        <div className="timeline">
          {blocks.map((block, index) => {
            return (
              <Step
                key={index}
                n={index + 1}
                title={`Block ${block.index} • ${mode}`}
                tone={index % 2 === 0 ? "blue" : "teal"}
                last={index === blocks.length - 1}
              >
                <div className="mode-flow-grid">
                  <div className="mode-flow-card">
                    <div className="mode-flow-label">{isDecrypt ? "Cipher block" : "Plaintext block"}</div>
                    <HexGrid hexStr={isDecrypt ? block.cipherHex : block.plainHex} />
                  </div>
                  {isCBC && (
                    <>
                      <div className="mode-flow-arrow">⊕</div>
                      <div className="mode-flow-card">
                        <div className="mode-flow-label">{isDecrypt ? "After AES rounds" : "CBC-chained input"}</div>
                        <HexGrid hexStr={block.chainHex} />
                        <div className="mode-flow-note">{index === 0 ? "Source: IV" : "Source: previous ciphertext"}</div>
                      </div>
                    </>
                  )}
                  <div className="mode-flow-arrow">→</div>
                  <div className="mode-flow-card">
                    <div className="mode-flow-label">{isDecrypt ? "Recovered plaintext" : "Cipher block"}</div>
                    <HexGrid hexStr={isDecrypt ? block.plainHex : block.cipherHex} />
                  </div>
                </div>
                <div className="mode-flow-hex">{isDecrypt ? block.plainHex : block.cipherHex}</div>
              </Step>
            );
          })}
        </div>
      )}

      <SectionLabel>AES Round States — 4×4 Byte Matrix</SectionLabel>
      <p className="step-note">
        Each round: SubBytes → ShiftRows{isDecrypt ? "⁻¹" : ""} → MixColumns → AddRoundKey.
        Cells are heat-mapped by byte value: <span style={{ color: "#3b82f6" }}>■</span> 00–3F
        &nbsp;<span style={{ color: "#14b8a6" }}>■</span> 40–7F
        &nbsp;<span style={{ color: "#f59e0b" }}>■</span> 80–BF
        &nbsp;<span style={{ color: "#8b5cf6" }}>■</span> C0–FF
      </p>

      <div className="aes-rounds-grid">
        {rounds.map((r, i) => (
          <div key={i} className={`aes-round-card tone-${i % 2 === 0 ? "blue" : "teal"}`}>
            <div className="aes-round-num">Round {r.round}</div>
            <HexGrid hexStr={r.stateHex} />
            <div className="aes-round-hex">{r.stateHex}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   DES View — visual bit blocks
   ───────────────────────────────────────────────────────────── */

function DESView({ data, route }) {
  const mode      = (data?.mode || "ECB").toUpperCase();
  const isCBC     = mode === "CBC";
  const isDecrypt = route?.includes("decrypt");
  const result    = isDecrypt ? data?.plaintext : data?.ciphertextHex;
  const blocks    = data?.blocks || [];
  const rounds    = blocks[0]?.rounds || data?.rounds || [];

  return (
    <div>
      {result !== undefined && result !== null && (
        <ResultBanner label={isDecrypt ? "Decrypted Plaintext" : "Ciphertext (hex)"} value={result} />
      )}

      {isCBC && data?.ivHex !== undefined && data?.ivHex !== null && (
        <ResultBanner label="CBC IV (hex)" value={data.ivHex} />
      )}

      <SectionLabel>{mode} Block Flow — Left | Right Halves</SectionLabel>
      <p className="step-note">
        ECB processes each 8-byte block independently. CBC chains blocks by XORing the current block with the previous ciphertext, or the IV for the first block, before the DES rounds.
      </p>

      {blocks.length > 0 && (
        <div className="timeline">
          {blocks.map((block, index) => {
            return (
              <Step
                key={index}
                n={index + 1}
                title={`Block ${block.index} • ${mode}`}
                tone={index % 2 === 0 ? "blue" : "teal"}
                last={index === blocks.length - 1}
              >
                <div className="mode-flow-grid">
                  <div className="mode-flow-card">
                    <div className="mode-flow-label">{isDecrypt ? "Cipher block" : "Plaintext block"}</div>
                    <BitBlocks bits={isDecrypt ? block.cipherBits : block.plainBits} limit={32} />
                  </div>
                  {isCBC && (
                    <>
                      <div className="mode-flow-arrow">⊕</div>
                      <div className="mode-flow-card">
                        <div className="mode-flow-label">{isDecrypt ? "After DES rounds" : "CBC-chained input"}</div>
                        <BitBlocks bits={block.chainBits} limit={32} />
                        <div className="mode-flow-note">{index === 0 ? "Source: IV" : "Source: previous ciphertext"}</div>
                      </div>
                    </>
                  )}
                  <div className="mode-flow-arrow">→</div>
                  <div className="mode-flow-card">
                    <div className="mode-flow-label">{isDecrypt ? "Recovered plaintext" : "Cipher block"}</div>
                    <BitBlocks bits={isDecrypt ? block.plainBits : block.cipherBits} limit={32} />
                  </div>
                </div>
                <div className="mode-flow-hex">{isDecrypt ? block.plainHex : block.cipherHex}</div>
              </Step>
            );
          })}
        </div>
      )}

      <SectionLabel>16 Feistel Rounds — Left | Right Halves</SectionLabel>
      <p className="step-note">
        Each round: new_R = L ⊕ f(R, K{isDecrypt ? "ₙ₋ᵢ" : "ᵢ"}), new_L = R. Lit blocks = 1-bits, dim blocks = 0-bits.
      </p>

      <div className="des-rounds-list">
        {rounds.map((r, i) => (
          <div key={i} className={`des-round-row tone-${i % 2 === 0 ? "blue" : "teal"}`}>
            <span className="des-round-lbl">R{r.round}</span>
            <div className="des-halves">
              <div className="des-half">
                <span className="half-tag">L</span>
                <BitBlocks bits={r.left} limit={32} />
              </div>
              <div className="des-sep">│</div>
              <div className="des-half">
                <span className="half-tag">R</span>
                <BitBlocks bits={r.right} limit={32} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ECC ECDH View
   ───────────────────────────────────────────────────────────── */

function ECCView({ data, payload }) {
  const steps = data?.steps || [];
  const tones = ["blue", "teal", "blue", "teal", "blue"];

  return (
    <div>
      {/* Curve equation bar */}
      <div className="ecc-curve-bar">
        <span className="ecc-param">p = <code>{payload?.p ?? "97"}</code></span>
        <span className="ecc-param">a = <code>{payload?.a ?? "2"}</code></span>
        <span className="ecc-param">G = <code>({payload?.G?.x ?? "3"}, {payload?.G?.y ?? "6"})</code></span>
        <span className="ecc-param ecc-eq">
          y² ≡ x³ + {payload?.a ?? "2"}x (mod {payload?.p ?? "97"})
        </span>
      </div>

      {/* Alice / Bob exchange */}
      <SectionLabel>ECDH Key Exchange</SectionLabel>
      <div className="ecdh-exchange">
        <div className="ecdh-party alice">
          <div className="ecdh-party-name">Alice</div>
          <div className="ecdh-row">
            <span className="ecdh-lbl">Private key a</span>
            <code>{payload?.privateA ?? "?"}</code>
          </div>
          <div className="ecdh-row">
            <span className="ecdh-lbl">Public key A = aG</span>
            <code>{pointStr(data?.publicA)}</code>
          </div>
          <div className="ecdh-row highlight">
            <span className="ecdh-lbl">Shared secret = a·B</span>
            <code>{pointStr(data?.sharedA)}</code>
          </div>
        </div>

        <div className="ecdh-match-col">
          <div className={`ecdh-match-badge ${data?.sharedMatch ? "match-ok" : "match-fail"}`}>
            {data?.sharedMatch ? "✓ Match" : "✗ No match"}
          </div>
          <div className="ecdh-match-eq">a·B = b·A</div>
        </div>

        <div className="ecdh-party bob">
          <div className="ecdh-party-name">Bob</div>
          <div className="ecdh-row">
            <span className="ecdh-lbl">Private key b</span>
            <code>{payload?.privateB ?? "?"}</code>
          </div>
          <div className="ecdh-row">
            <span className="ecdh-lbl">Public key B = bG</span>
            <code>{pointStr(data?.publicB)}</code>
          </div>
          <div className="ecdh-row highlight">
            <span className="ecdh-lbl">Shared secret = b·A</span>
            <code>{pointStr(data?.sharedB)}</code>
          </div>
        </div>
      </div>

      {/* Step trace */}
      <SectionLabel>ECDH Computation Steps</SectionLabel>
      <div className="timeline">
        {steps.map((s, i) => (
          <Step key={i} n={i + 1} title={s.step} tone={tones[i % tones.length]} last={i === steps.length - 1}>
            <code className="step-code">
              {s.value === null
                ? "∞ (point at infinity)"
                : typeof s.value === "object" && s.value !== null
                  ? pointStr(s.value)
                  : String(s.value)}
            </code>
          </Step>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Substitution View
   ───────────────────────────────────────────────────────────── */

function SubstitutionView({ data, route }) {
  const steps     = data?.steps     || [];
  const isDecrypt = route?.includes("decrypt");
  const isAttack  = route?.includes("attack");
  const changed   = steps.filter((s) => s.in !== s.out);
  const freq      = data?.frequency;
  const brute     = data?.bruteForce?.attempts || [];

  return (
    <div>
      {data?.text && (
        <ResultBanner label={isDecrypt ? "Decrypted Plaintext" : "Ciphertext"} value={data.text} />
      )}

      {/* ── Full text character flow ── */}
      {!isAttack && steps.length > 0 && (
        <>
          <SectionLabel>Character-by-Character Flow</SectionLabel>
          <div className="sub-text-flow">
            {steps.map((s, i) => (
              <span key={i} className={`sub-char-token ${s.in !== s.out ? "mapped" : ""}`}>
                {s.in !== s.out ? (
                  <>
                    <span>{s.in}</span>
                    <span className="char-out">{s.out}</span>
                  </>
                ) : (
                  s.in
                )}
              </span>
            ))}
          </div>
        </>
      )}

      {/* ── Character mapping table ── */}
      {!isAttack && changed.length > 0 && (
        <>
          <SectionLabel>Substitution Table</SectionLabel>
          <div className="sub-table">
            <div className="sub-header">
              <span>Pos</span>
              <span>Input</span>
              <span></span>
              <span>Output</span>
            </div>
            {changed.slice(0, 40).map((s, i) => (
              <div key={i} className={`sub-row ${i % 2 === 0 ? "even" : "odd"}`}>
                <span className="sub-pos">{s.index}</span>
                <code className="sub-char in-char">{s.in}</code>
                <span className="sub-arrow">→</span>
                <code className="sub-char out-char">{s.out}</code>
              </div>
            ))}
            {changed.length > 40 && (
              <div className="sub-more">…and {changed.length - 40} more substitutions</div>
            )}
          </div>
        </>
      )}

      {/* ── Frequency analysis ── */}
      {isAttack && freq && (
        <>
          <SectionLabel>Letter Frequency Analysis</SectionLabel>
          <div className="freq-bars">
            {(freq.ranked || []).slice(0, 16).map((item) => {
              const maxCount = freq.ranked[0]?.count || 1;
              const pct = Math.round((item.count / maxCount) * 100);
              return (
                <div key={item.ch} className="freq-bar-row">
                  <span className="freq-lbl">{item.ch}</span>
                  <div className="freq-bar-track">
                    <div className="freq-bar-fill" style={{ width: `${Math.max(4, pct)}%` }} />
                  </div>
                  <span className="freq-count">{item.count}</span>
                  <span className="freq-guess">→ {freq.guessedMap?.[item.ch] ?? "?"}</span>
                </div>
              );
            })}
          </div>

          <SectionLabel>Candidate Plaintext Guesses</SectionLabel>
          {brute.map((att, i) => (
            <div key={i} className={`brute-row ${i === 0 ? "best-guess" : ""}`}>
              <div className="brute-meta">
                <span className="brute-rank">{i === 0 ? "Best" : `#${i + 1}`}</span>
                <code className="brute-key">{att.key}</code>
                <span className="brute-score">score {att.score}</span>
              </div>
              <code className="brute-candidate">{att.candidate?.slice(0, 80)}</code>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Transposition View
   ───────────────────────────────────────────────────────────── */

function GridTable({ matrix, label, highlightCols = [] }) {
  if (!Array.isArray(matrix) || matrix.length === 0) return null;
  return (
    <div className="grid-display">
      {label && <div className="grid-label">{label}</div>}
      <table className="grid-table">
        <tbody>
          {matrix.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className={`grid-cell ${
                    highlightCols.includes(ci) ? "col-a" : ""
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TranspositionView({ data, route }) {
  const inter     = data?.intermediate || {};
  const isDecrypt = route?.includes("decrypt");
  const result    = isDecrypt ? data?.plaintext : data?.ciphertext;

  return (
    <div>
      {result && (
        <ResultBanner label={isDecrypt ? "Decrypted Plaintext" : "Ciphertext"} value={result} />
      )}

      <SectionLabel>{isDecrypt ? "Decryption Trace" : "Encryption Trace"}</SectionLabel>

      <div className="timeline">
        {!isDecrypt && inter.firstMatrix && (
          <>
            <Step n={1} title="Write plaintext into grid rows" tone="blue">
              <GridTable matrix={inter.firstMatrix} />
            </Step>
            <Step n={2} title="Permute columns by Key A" tone="teal">
              <GridTable matrix={inter.firstPermuted} label="After Key A shuffle" highlightCols={[0]} />
            </Step>
            <Step n={3} title="Read columns → intermediate text" tone="blue">
              <code className="step-code">{inter.afterFirst}</code>
            </Step>
            <Step n={4} title="Write intermediate into second grid" tone="teal">
              <GridTable matrix={inter.secondMatrix} />
            </Step>
            <Step n={5} title="Permute columns by Key B" tone="blue">
              <GridTable matrix={inter.secondPermuted} label="After Key B shuffle" highlightCols={[0]} />
            </Step>
            <Step n={6} title="Read columns → final ciphertext" tone="teal" last>
              <code className="step-code">{result}</code>
            </Step>
          </>
        )}

        {isDecrypt && (
          <>
            <Step n={1} title="Reverse second permutation (Key B⁻¹)" tone="blue">
              <code className="step-code">{inter.undoSecond}</code>
            </Step>
            <Step n={2} title="Reverse first permutation (Key A⁻¹) → plaintext" tone="teal" last>
              <code className="step-code">{result}</code>
            </Step>
          </>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Panel metadata
   ───────────────────────────────────────────────────────────── */

const FAMILY_META = {
  substitution: { label: "Substitution Cipher",   icon: "🔤", cat: "Classical"  },
  transposition: { label: "Double Transposition", icon: "↔",  cat: "Classical"  },
  des:           { label: "DES",                  icon: "🔐", cat: "Symmetric"  },
  aes:           { label: "AES",                  icon: "🛡",  cat: "Symmetric"  },
  rsa:           { label: "RSA",                  icon: "🔑", cat: "Public Key" },
  ecc:           { label: "ECC ECDH",             icon: "📐", cat: "Public Key" },
  general:       { label: "Algorithm",            icon: "⚙",  cat: "General"    },
};

function dirLabel(route) {
  if (!route) return "";
  if (route.includes("encrypt"))                        return "Plaintext → Ciphertext";
  if (route.includes("decrypt"))                        return "Ciphertext → Plaintext";
  if (route.includes("keygen") || route.includes("ecdh")) return "Key Generation";
  if (route.includes("attack"))                         return "Cryptanalysis";
  return "Operation";
}

/* ─────────────────────────────────────────────────────────────
   Main export
   ───────────────────────────────────────────────────────────── */

function AlgorithmInsightPanel({ title, data, route, payload }) {
  const family = useMemo(() => detectFamily(route), [route]);
  const meta   = FAMILY_META[family] || FAMILY_META.general;

  return (
    <section className="insight-panel card">
      {/* Panel header */}
      <div className="ip-header">
        <div className="ip-title-group">
          <div className="ip-icon-wrap">
            <span className="ip-icon">{meta.icon}</span>
          </div>
          <div>
            <h3 className="ip-title">{title || meta.label}</h3>
            <span className="ip-cat">{meta.cat}</span>
          </div>
        </div>
        <span className="ip-dir-label">{dirLabel(route)}</span>
      </div>

      <div className="ip-body">
        {family === "rsa"          && <RSAView           data={data} route={route} payload={payload} />}
        {family === "aes"          && <AESView           data={data} route={route} />}
        {family === "des"          && <DESView           data={data} route={route} />}
        {family === "ecc"          && <ECCView           data={data} payload={payload} />}
        {family === "substitution" && <SubstitutionView  data={data} route={route} payload={payload} />}
        {family === "transposition"&& <TranspositionView data={data} route={route} />}
        {family === "general"      && <pre className="step-code">{JSON.stringify(data, null, 2)}</pre>}
      </div>
    </section>
  );
}

export default AlgorithmInsightPanel;
