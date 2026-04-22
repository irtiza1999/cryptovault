import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";
import { useAuth } from "../context/AuthContext";

function Register() {
  const [name, setName] = useState("");
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
      const res = await registerUser({ name, email, password });
      await loginWithToken(res.data.token);
      setMessage("Registration successful");
      navigate("/");
    } catch (error) {
      const errors = error.response?.data?.errors;
      if (Array.isArray(errors) && errors.length > 0) {
        setMessage(errors.map((entry) => entry.msg).join(", "));
      } else {
        setMessage(error.response?.data?.message || "Registration failed");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="card auth-form" onSubmit={submit}>
      <h2>Register</h2>
      <label>
        Name
        <input required value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label>
        Email
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label>
        Password
        <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      <button type="submit" disabled={submitting}>{submitting ? "Creating..." : "Create Account"}</button>
      {message ? <p className="auth-message">{message}</p> : null}
    </form>
  );
}

export default Register;
