import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await loginUser({ email, password });
      await loginWithToken(res.data.token);
      setMessage("Login successful");
      navigate("/");
    } catch (error) {
      const errors = error.response?.data?.errors;
      if (Array.isArray(errors) && errors.length > 0) {
        setMessage(errors.map((entry) => entry.msg).join(", "));
      } else {
        setMessage(error.response?.data?.message || "Login failed");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="card auth-form" onSubmit={submit}>
      <h2>Login</h2>
      <label>
        Email
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label>
        Password
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      <button type="submit" disabled={submitting}>{submitting ? "Signing in..." : "Login"}</button>
      {message ? <p className="auth-message">{message}</p> : null}
    </form>
  );
}

export default Login;
