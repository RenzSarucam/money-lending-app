import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { btnStyle, inputStyle, labelStyle } from "../utils/theme";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    navigate("/");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0d1117", color: "#e6edf3", fontFamily: "'Segoe UI', sans-serif", padding: 16 }}>
      <form onSubmit={submit} style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 14, padding: 24, width: "100%", maxWidth: 360 }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f0b429", margin: 0 }}>💰 MONEY LENDING</h1>
          <p style={{ fontSize: 12, color: "#8b949e", marginTop: 4 }}>Log in to your account</p>
        </div>

        <label style={labelStyle}>Email</label>
        <input style={{ ...inputStyle, marginBottom: 12 }} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />

        <label style={labelStyle}>Password</label>
        <input style={{ ...inputStyle, marginBottom: 8 }} type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        <div style={{ textAlign: "right", marginBottom: 12 }}>
          <Link to="/forgot-password" style={{ color: "#8b949e", fontSize: 11 }}>Forgot password?</Link>
        </div>

        {err && <div style={{ color: "#f85149", fontSize: 12, marginBottom: 10 }}>⚠️ {err}</div>}

        <button type="submit" disabled={busy} style={{ ...btnStyle, background: "#f0b429", color: "#0d1117", width: "100%" }}>
          {busy ? "Logging in..." : "Login"}
        </button>

        <p style={{ fontSize: 12, color: "#8b949e", textAlign: "center", marginTop: 14 }}>
          Don't have an account? <Link to="/signup" style={{ color: "#f0b429" }}>Sign up</Link>
        </p>
      </form>
    </div>
  );
}
