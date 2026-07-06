import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { btnStyle, inputStyle, labelStyle } from "../utils/theme";

export default function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    setDone(true);
  };

  if (done) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0d1117", color: "#e6edf3", fontFamily: "'Segoe UI', sans-serif", padding: 16 }}>
        <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 14, padding: 24, width: "100%", maxWidth: 360, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
          <p style={{ fontSize: 14, marginBottom: 14 }}>Sign up complete! Check your email in case you need to confirm it, then log in.</p>
          <button onClick={() => navigate("/login")} style={{ ...btnStyle, background: "#f0b429", color: "#0d1117", width: "100%" }}>Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0d1117", color: "#e6edf3", fontFamily: "'Segoe UI', sans-serif", padding: 16 }}>
      <form onSubmit={submit} style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 14, padding: 24, width: "100%", maxWidth: 360 }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f0b429", margin: 0 }}>💰 MONEY LENDING</h1>
          <p style={{ fontSize: 12, color: "#8b949e", marginTop: 4 }}>Create a new account</p>
        </div>

        <label style={labelStyle}>Full Name</label>
        <input style={{ ...inputStyle, marginBottom: 12 }} required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Juan dela Cruz" />

        <label style={labelStyle}>Email</label>
        <input style={{ ...inputStyle, marginBottom: 12 }} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        <p style={{ fontSize: 11, color: "#8b949e", marginTop: -8, marginBottom: 12 }}>
          Use the same email you gave your lender so your account gets linked automatically.
        </p>

        <label style={labelStyle}>Password</label>
        <input style={{ ...inputStyle, marginBottom: 12 }} type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Any 6+ characters" />

        {err && <div style={{ color: "#f85149", fontSize: 12, marginBottom: 10 }}>⚠️ {err}</div>}

        <button type="submit" disabled={busy} style={{ ...btnStyle, background: "#f0b429", color: "#0d1117", width: "100%" }}>
          {busy ? "Creating..." : "Create Account"}
        </button>

        <p style={{ fontSize: 12, color: "#8b949e", textAlign: "center", marginTop: 14 }}>
          Already have an account? <Link to="/login" style={{ color: "#f0b429" }}>Login</Link>
        </p>
      </form>
    </div>
  );
}
