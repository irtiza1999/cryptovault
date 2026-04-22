import { useEffect, useState } from "react";
import { fetchSecurity } from "../services/api";

function SecurityAnalysis() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    fetchSecurity().then((res) => setEntries(res.data.entries || []));
  }, []);

  return (
    <section className="card">
      <h2>Security Analysis</h2>
      {entries.map((entry) => (
        <article key={entry.algorithm} className="card nested-card">
          <h3>{entry.algorithm}</h3>
          <p><strong>Strengths:</strong> {entry.strengths.join("; ")}</p>
          <p><strong>Weaknesses:</strong> {entry.weaknesses.join("; ")}</p>
        </article>
      ))}
    </section>
  );
}

export default SecurityAnalysis;
