import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fetchBenchmarkHistory, healthCheck, runBenchmarks } from "../services/api";
import CryptoCube3D from "../components/CryptoCube3D";

function Dashboard() {
  const [status, setStatus] = useState("Checking API...");
  const [size, setSize] = useState(100);
  const [benchRows, setBenchRows] = useState([]);
  const [loadingBench, setLoadingBench] = useState(false);
  const [error, setError] = useState("");
  const user = null;

  const chartRows = useMemo(() => {
    const grouped = benchRows.reduce((acc, row) => {
      if (!acc[row.algorithm]) {
        acc[row.algorithm] = { algorithm: row.algorithm, durationMs: 0, count: 0 };
      }
      acc[row.algorithm].durationMs += Number(row.durationMs || 0);
      acc[row.algorithm].count += 1;
      return acc;
    }, {});

    return Object.values(grouped).map((item) => ({
      algorithm: item.algorithm,
      avgDuration: Number((item.durationMs / Math.max(1, item.count)).toFixed(2)),
    }));
  }, [benchRows]);

  useEffect(() => {
    healthCheck()
      .then(() => setStatus("Backend is online"))
      .catch(() => setStatus("Backend unavailable"));

    fetchBenchmarkHistory()
      .then((res) => setBenchRows(res.data.rows || []))
      .catch(() => setBenchRows([]));
  }, []);

  async function runDashboardBenchmark() {
    setLoadingBench(true);
    setError("");
    try {
      const res = await runBenchmarks({ sizes: [Number(size)] });
      const nextRows = res.data.results || [];
      setBenchRows((prev) => [...nextRows, ...prev].slice(0, 200));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoadingBench(false);
    }
  }

  return (
    <div>
      <section className="hero card hero-card" style={{ display: 'flex', flexDirection: 'row', gap: '2rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <h2>CryptoVault Studio</h2>
          <p>
            Python-powered cryptographic algorithms behind a React.js interface. Explore internals,
            attacks, benchmarks, and save your runs in your private vault.
          </p>
          <p className="pill">Explore features and run algorithms.</p>
        </div>
      </section>

      <section className="grid-three" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <article className="card feature-card">
          <h3>Interactive Benchmark Trigger</h3>
          <p>Run a quick benchmark from the dashboard and update the live chart.</p>
          <label>
            Input size
            <input type="number" value={size} min={10} step={10} onChange={(e) => setSize(e.target.value)} />
          </label>
          <div className="lab-actions">
            <button onClick={runDashboardBenchmark} disabled={loadingBench}>
              {loadingBench ? "Running..." : "Run Benchmark"}
            </button>
          </div>
        </article>
        <article className="card feature-card">
          <h3>Average Runtime Chart</h3>
          <p>View rolling average runtime by algorithm from benchmark history.</p>
          <div className="dashboard-chart">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartRows}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.25} />
                <XAxis dataKey="algorithm" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="avgDuration" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="card status-card">
        <strong>API Status:</strong> {status}
      </section>
      {error ? <section className="card error">{error}</section> : null}
    </div>
  );
}

export default Dashboard;
