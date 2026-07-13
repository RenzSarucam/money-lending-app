import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { btnStyle, inputStyle, labelStyle } from "../utils/theme";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    setSent(true);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0d1117", color: "#e6edf3", fontFamily: "'Segoe UI', sans-serif", padding: 16 }}>
      <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 14, padding: 24, width: "100%", maxWidth: 360 }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f0b429", margin: 0 }}>💰 MONEY LENDING</h1>
          <p style={{ fontSize: 12, color: "#8b949e", marginTop: 4 }}>Reset your password</p>
        </div>

        {sent ? (
          <>
            <div style={{ fontSize: 40, textAlign: "center", marginBottom: 10 }}>✅</div>
            <p style={{ fontSize: 14, marginBottom: 14, textAlign: "center" }}>
              If an account exists for <strong>{email}</strong>, a password reset link is on its way. Click the link in the email to set a new password.
            </p>
            <Link to="/login" style={{ ...btnStyle, background: "#f0b429", color: "#0d1117", width: "100%", display: "block", textAlign: "center", boxSizing: "border-box", textDecoration: "none" }}>Back to Login</Link>
          </>
        ) : (
          <form onSubmit={submit}>
            <label style={labelStyle}>Email</label>
            <input style={{ ...inputStyle, marginBottom: 12 }} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            <p style={{ fontSize: 11, color: "#8b949e", marginTop: -8, marginBottom: 12 }}>
              We'll email you a link to reset your password.
            </p>

            {err && <div style={{ color: "#f85149", fontSize: 12, marginBottom: 10 }}>⚠️ {err}</div>}

            <button type="submit" disabled={busy} style={{ ...btnStyle, background: "#f0b429", color: "#0d1117", width: "100%" }}>
              {busy ? "Sending..." : "Send Reset Link"}
            </button>

            <p style={{ fontSize: 12, color: "#8b949e", textAlign: "center", marginTop: 14 }}>
              <Link to="/login" style={{ color: "#f0b429" }}>Back to Login</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
