import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { btnStyle, inputStyle, labelStyle } from "../utils/theme";

export default function ResetPassword() {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (password.length < 6) { setErr("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setErr("Passwords don't match."); return; }
    setErr("");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    setDone(true);
    await supabase.auth.signOut();
    setTimeout(() => navigate("/login"), 2000);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0d1117", color: "#e6edf3", fontFamily: "'Segoe UI', sans-serif", padding: 16 }}>
      <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 14, padding: 24, width: "100%", maxWidth: 360 }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f0b429", margin: 0 }}>💰 MONEY LENDING</h1>
          <p style={{ fontSize: 12, color: "#8b949e", marginTop: 4 }}>Set a new password</p>
        </div>

        {done ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
            <p style={{ fontSize: 14 }}>Password updated! Redirecting you to login...</p>
          </div>
        ) : !ready ? (
          <p style={{ fontSize: 13, color: "#8b949e", textAlign: "center" }}>
            Verifying your reset link... If nothing happens, the link may have expired — request a new one from the Forgot Password page.
          </p>
        ) : (
          <form onSubmit={submit}>
            <label style={labelStyle}>New Password</label>
            <input style={{ ...inputStyle, marginBottom: 12 }} type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Any 6+ characters" />

            <label style={labelStyle}>Confirm Password</label>
            <input style={{ ...inputStyle, marginBottom: 12 }} type="password" required minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Re-enter password" />

            {err && <div style={{ color: "#f85149", fontSize: 12, marginBottom: 10 }}>⚠️ {err}</div>}

            <button type="submit" disabled={busy} style={{ ...btnStyle, background: "#f0b429", color: "#0d1117", width: "100%" }}>
              {busy ? "Saving..." : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
