import { useEffect, useState } from "react";
import { deleteSavedRun, fetchMyRuns, updateSavedRun } from "../services/api";
import { useAuth } from "../context/AuthContext";

function MyVault() {
  const { user } = useAuth();
  const [runs, setRuns] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    fetchMyRuns()
      .then((res) => setRuns(res.data.runs || []))
      .catch((err) => setError(err.response?.data?.message || err.message));
  }, [user]);

  async function toggleFavorite(run) {
    const res = await updateSavedRun(run._id, { favorite: !run.favorite, notes: run.notes, tags: run.tags });
    setRuns((prev) => prev.map((r) => (r._id === run._id ? res.data.run : r)));
  }

  async function remove(runId) {
    await deleteSavedRun(runId);
    setRuns((prev) => prev.filter((r) => r._id !== runId));
  }

  if (!user) {
    return <section className="card">Login to use your personal vault.</section>;
  }

  return (
    <section className="card">
      <h2>My Vault</h2>
      {error ? <p className="error">{error}</p> : null}
      {runs.length === 0 ? <p>No saved runs yet. Save one from Algorithm Lab.</p> : null}

      <div className="vault-grid">
        {runs.map((run) => (
          <article key={run._id} className="card vault-item">
            <div className="vault-head">
              <h3>{run.route}</h3>
              <small>{new Date(run.createdAt).toLocaleString()}</small>
            </div>
            <p>Favorite: {run.favorite ? "Yes" : "No"}</p>
            <div className="vault-actions">
              <button onClick={() => toggleFavorite(run)}>{run.favorite ? "Unfavorite" : "Favorite"}</button>
              <button onClick={() => remove(run._id)} className="ghost-button">Delete</button>
            </div>
            <details>
              <summary>View payload</summary>
              <pre>{JSON.stringify({ input: run.input, output: run.output }, null, 2)}</pre>
            </details>
          </article>
        ))}
      </div>
    </section>
  );
}

export default MyVault;
