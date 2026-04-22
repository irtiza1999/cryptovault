import { useEffect, useMemo, useState, useRef } from "react";
import { runAlgorithm } from "../services/api";

const PLAINTEXTS = [
  "knowledge is power",
  "cryptography protects data",
  "never trust plain text",
  "elliptic curves are elegant",
  "security through obscurity is bad",
  "aes is the gold standard",
  "keep your private keys secret"
];

function randomSubstitutionKey() {
  const chars = "abcdefghijklmnopqrstuvwxyz".split("");
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

function CipherChallenge() {
  const [algo, setAlgo] = useState("substitution");
  const [round, setRound] = useState(1);
  const [input, setInput] = useState("");
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [hints, setHints] = useState(0);
  const timerRef = useRef(null);

  const challenge = useMemo(() => {
    const plain = PLAINTEXTS[Math.floor(Math.random() * PLAINTEXTS.length)];
    let key;
    if (algo === "substitution") {
      key = randomSubstitutionKey();
    } else {
      key = { keyA: "2,0,1", keyB: "1,2,0" };
    }
    return { plain, key };
  }, [round, algo]);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isActive]);

  async function generateCipher() {
    setLoading(true);
    setFeedback(null);
    setHints(0);
    try {
      let res;
      if (algo === "substitution") {
        res = await runAlgorithm("classical/substitution/encrypt", {
          text: challenge.plain,
          key: challenge.key
        });
        setInput(res.data.text);
      } else {
        res = await runAlgorithm("classical/transposition/encrypt", {
          text: challenge.plain,
          keyA: challenge.key.keyA,
          keyB: challenge.key.keyB
        });
        setInput(res.data.ciphertext);
      }
      setTimer(0);
      setIsActive(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function submit() {
    const ok = answer.trim().toLowerCase() === challenge.plain;
    if (ok) {
      const bonus = Math.max(1, 10 - Math.floor(timer / 10)) - hints;
      setScore((s) => s + bonus);
      setFeedback({ type: "success", text: `Correct! +${bonus} points` });
      setIsActive(false);
      setTimeout(() => nextRound(), 1500);
    } else {
      setFeedback({ type: "error", text: "Incorrect, try again!" });
    }
  }

  function nextRound() {
    setRound((r) => r + 1);
    setAnswer("");
    setInput("");
    setFeedback(null);
  }

  function getHint() {
    if (hints >= 3) return;
    setHints((h) => h + 1);
    const words = challenge.plain.split(" ");
    const revealed = words.map(w => w[0] + ".".repeat(w.length - 1)).join(" ");
    setFeedback({ type: "hint", text: `Hint: ${revealed}` });
  }

  return (
    <section className="card challenge-card">
      <div className="playground-head">
        <div>
          <h2>Cipher Challenge</h2>
          <p>Solve the encrypted messages as fast as you can. No copy-pasting!</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p className="pill">Score: {score}</p>
          <p className="pill" style={{ marginLeft: "0.5rem" }}>Round: {round}</p>
        </div>
      </div>

      <div className="form-grid" style={{ marginBottom: "1rem" }}>
        <label>
          Algorithm Difficulty
          <select value={algo} onChange={(e) => setAlgo(e.target.value)} disabled={isActive}>
            <option value="substitution">Substitution (Easy)</option>
            <option value="transposition">Double Transposition (Hard)</option>
          </select>
        </label>
        <div style={{ alignSelf: "end", textAlign: "right" }}>
          <span className={`pill ${isActive ? "badge-encrypt" : ""}`}>
            Timer: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, "0")}
          </span>
        </div>
      </div>

      <div style={{ textAlign: "center", margin: "1.5rem 0" }}>
        {!input ? (
          <button onClick={generateCipher} disabled={loading} style={{ padding: "1rem 2rem", fontSize: "1.1rem" }}>
            {loading ? "Generating..." : "Start Challenge"}
          </button>
        ) : (
          <div className="cipher-box" style={{ fontSize: "1.4rem", padding: "1.5rem", border: "2px dashed var(--brand)" }}>
            {input}
          </div>
        )}
      </div>

      {input && (
        <div className="challenge-controls">
          <label>
            Your Guess
            <input 
              value={answer} 
              onChange={(e) => setAnswer(e.target.value)} 
              placeholder="type the plaintext..." 
              onKeyDown={(e) => e.key === "Enter" && submit()}
              autoFocus
            />
          </label>
          <div className="lab-actions">
            <button onClick={submit}>Submit Guess</button>
            <button className="ghost-button" onClick={getHint} disabled={hints >= 3}>
              Get Hint ({3 - hints} left)
            </button>
            <button className="ghost-button" onClick={nextRound}>Skip Round</button>
          </div>
        </div>
      )}

      {feedback && (
        <div className={`dashboard-output ${feedback.type === "success" ? "badge-encrypt" : feedback.type === "error" ? "badge-attack" : ""}`} style={{ marginTop: "1rem", fontWeight: "bold" }}>
          {feedback.text}
        </div>
      )}
    </section>
  );
}

export default CipherChallenge;
