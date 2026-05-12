import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fetchComparison, runBenchmarks } from "../services/api";

const CHART_COLORS = ["#2563eb", "#0f766e", "#7c3aed", "#ea580c", "#dc2626", "#2dd4bf"];

const RADAR_SCORES = {
  "Substitution":        { speed: 10, security: 1,  keyStr: 1,  complexity: 2,  standard: 1  },
  "Double Transposition":{ speed: 9,  security: 2,  keyStr: 3,  complexity: 4,  standard: 1  },
  "DES":                 { speed: 7,  security: 4,  keyStr: 5,  complexity: 7,  standard: 8  },
  "AES":                 { speed: 8,  security: 10, keyStr: 9,  complexity: 8,  standard: 10 },
  "RSA":                 { speed: 3,  security: 9,  keyStr: 8,  complexity: 9,  standard: 10 },
  "ECC ECDH":            { speed: 5,  security: 10, keyStr: 10, complexity: 9,  standard: 9  },
};

const ALGO_ICONS = {
  "Substitution":         "🔤",
  "Double Transposition": "↔",
  "DES":                  "🔐",
  "AES":                  "🛡",
  "RSA":                  "🔑",
  "ECC ECDH":             "📐",
};

function securityClass(level) {
  if (!level) return "sec-medium";
  const l = level.toLowerCase();
  if (l.includes("broken"))   return "sec-broken";
  if (l.includes("low"))      return "sec-low";
  if (l.includes("moderate")) return "sec-medium";
  if (l.includes("high"))     return "sec-high";
  return "sec-medium";
}

const RADAR_AXES = [
  { key: "speed",      label: "Speed"         },
  { key: "security",   label: "Security"      },
  { key: "keyStr",     label: "Key Strength"  },
  { key: "complexity", label: "Complexity"    },
  { key: "standard",   label: "Standardized"  },
];

const METRIC_LABEL = {
  durationMs:     "Avg Duration (ms)",
  throughputKbps: "Throughput (chars/ms)",
  entropy:        "Ciphertext Entropy (bits/byte)",
};

function Comparison() {
  const [algorithms, setAlgorithms] = useState([]);
  const [benchmarks, setBenchmarks] = useState([]);
  const [metric,     setMetric]     = useState("durationMs");
  const [loading,    setLoading]    = useState(false);
  const [radarAlgos, setRadarAlgos] = useState(["AES", "RSA", "DES"]);

  useEffect(() => {
    fetchComparison().then((res) => setAlgorithms(res.data.algorithms || []));
  }, []);

  async function run() {
    setLoading(true);
    try {
      const res = await runBenchmarks({ sizes: [100, 500, 1000] });
      setBenchmarks(res.data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const chartData = useMemo(() => {
    const grouped = {};
    benchmarks.forEach((row) => {
      if (!grouped[row.algorithm])
        grouped[row.algorithm] = { algorithm: row.algorithm, val: 0, count: 0 };
      grouped[row.algorithm].val   += row[metric] || 0;
      grouped[row.algorithm].count += 1;
    });
    return Object.values(grouped).map((item) => ({
      algorithm: item.algorithm,
      value: Number((item.val / Math.max(1, item.count)).toFixed(4)),
    }));
  }, [benchmarks, metric]);

  const radarData = useMemo(() => {
    return RADAR_AXES.map(({ key, label }) => {
      const row = { axis: label };
      radarAlgos.forEach((name) => {
        row[name] = RADAR_SCORES[name]?.[key] ?? 0;
      });
      return row;
    });
  }, [radarAlgos]);

  const RADAR_COLORS = ["#2563eb", "#0f766e", "#7c3aed", "#ea580c"];

  function toggleRadarAlgo(name) {
    setRadarAlgos((prev) =>
      prev.includes(name)
        ? prev.filter((n) => n !== name)
        : [...prev, name]
    );
  }

  return (
    <div className="comparison-page">
      <section className="card hero-card" style={{ marginBottom: "1rem" }}>
        <div className="comparison-hero-row">
          <div>
            <h2>Algorithm Benchmark Hub</h2>
            <p>Compare performance, security, and efficiency across cryptographic standards.</p>
          </div>
          <button onClick={run} disabled={loading} className="run-btn">
            {loading ? "⏳ Benchmarking…" : "▶ Run Comparison"}
          </button>
        </div>

        {algorithms.length > 0 && (
          <div className="algo-cards-grid">
            {algorithms.map((algo) => (
              <div key={algo.name} className="algo-card">
                <div className="algo-card-icon">{ALGO_ICONS[algo.name] || "⚙"}</div>
                <div className="algo-card-name">{algo.name}</div>
                <div className="algo-card-cat">{algo.category}</div>
                <div className="algo-card-meta">
                  <div className="algo-card-row">
                    <span>Key Size</span>
                    <strong>{algo.keySize}</strong>
                  </div>
                  <div className="algo-card-row">
                    <span>Block / Op</span>
                    <strong>{algo.blockSize}</strong>
                  </div>
                  <div className="algo-card-row">
                    <span>Security</span>
                    <span className={`sec-badge ${securityClass(algo.securityLevel)}`}>
                      {algo.securityLevel}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="grid-three" style={{ marginBottom: "1rem" }}>
        <section className="card feature-card" style={{ gridColumn: "1 / 3" }}>
          <div className="insight-header">
            <div>
              <h3>Performance Analysis</h3>
              <p className="insight-summary">
                Showing <strong>{METRIC_LABEL[metric]}</strong> across tested algorithms.
                {benchmarks.length === 0 && " Run a comparison to populate."}
              </p>
            </div>
            <div className="metric-toggle">
              <button className={metric === "durationMs"     ? "active" : ""} onClick={() => setMetric("durationMs")}>Speed</button>
              <button className={metric === "throughputKbps" ? "active" : ""} onClick={() => setMetric("throughputKbps")}>Throughput</button>
              <button className={metric === "entropy"        ? "active" : ""} onClick={() => setMetric("entropy")}>Entropy</button>
            </div>
          </div>

          <div className="insight-chart">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} barCategoryGap="28%">
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.12} />
                <XAxis dataKey="algorithm" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid var(--line)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    fontSize: "0.85rem",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "0.83rem", paddingTop: "0.5rem" }} />
                <Bar dataKey="value" name={METRIC_LABEL[metric]} radius={[8, 8, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card feature-card">
          <h3>Quick Stats</h3>
          <div className="stat-list">
            {chartData.length > 0
              ? chartData.map((item, idx) => (
                  <div key={item.algorithm} className="stat-row">
                    <span className="stat-algo">
                      <span style={{ marginRight: "0.4rem" }}>{ALGO_ICONS[item.algorithm] || "⚙"}</span>
                      {item.algorithm}
                    </span>
                    <span
                      className="stat-value"
                      style={{ color: CHART_COLORS[idx % CHART_COLORS.length] }}
                    >
                      {item.value}
                    </span>
                  </div>
                ))
              : <p className="no-steps-msg">Run benchmarks to see data.</p>
            }
          </div>
        </section>
      </div>

      <section className="card">
        <div className="insight-header">
          <div>
            <h3>Multi-Dimension Security Radar</h3>
            <p className="insight-summary">Comparative scores across Speed, Security, Key Strength, Complexity, and Standardization.</p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
            {Object.keys(RADAR_SCORES).map((name, i) => (
              <button
                key={name}
                onClick={() => toggleRadarAlgo(name)}
                style={{
                  padding: "0.3rem 0.75rem",
                  borderRadius: "999px",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  border: `1px solid ${RADAR_COLORS[i % RADAR_COLORS.length]}`,
                  background: radarAlgos.includes(name)
                    ? RADAR_COLORS[i % RADAR_COLORS.length]
                    : "transparent",
                  color: radarAlgos.includes(name) ? "#fff" : "var(--muted)",
                  cursor: "pointer",
                  transition: "all 140ms",
                  transform: "none",
                  filter: "none",
                  boxShadow: "none",
                }}
              >
                {ALGO_ICONS[name] || ""} {name}
              </button>
            ))}
          </div>
        </div>

        <div className="radar-wrap">
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={radarData} outerRadius="68%">
              <PolarGrid stroke="var(--line)" />
              <PolarAngleAxis dataKey="axis" tick={{ fontSize: 12, fill: "var(--muted)" }} />
              <PolarRadiusAxis domain={[0, 10]} tick={{ fontSize: 10, fill: "var(--muted)" }} tickCount={6} />
              {radarAlgos.map((name, i) => (
                <Radar
                  key={name}
                  name={name}
                  dataKey={name}
                  stroke={RADAR_COLORS[i % RADAR_COLORS.length]}
                  fill={RADAR_COLORS[i % RADAR_COLORS.length]}
                  fillOpacity={0.12}
                  strokeWidth={2}
                />
              ))}
              <Legend wrapperStyle={{ fontSize: "0.83rem" }} />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid var(--line)",
                  fontSize: "0.83rem",
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="card">
        <h3 style={{ marginBottom: "1rem" }}>Cryptographic Specification Matrix</h3>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Algorithm</th>
                <th>Category</th>
                <th>Typical Key Size</th>
                <th>Block / Operation</th>
                <th>Security Level</th>
              </tr>
            </thead>
            <tbody>
              {algorithms.map((algo) => (
                <tr key={algo.name}>
                  <td>
                    <strong>
                      {ALGO_ICONS[algo.name] || ""} {algo.name}
                    </strong>
                  </td>
                  <td><span className="pill">{algo.category}</span></td>
                  <td style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>{algo.keySize}</td>
                  <td style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>{algo.blockSize}</td>
                  <td>
                    <span className={`sec-badge ${securityClass(algo.securityLevel)}`}>
                      {algo.securityLevel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Comparison;
