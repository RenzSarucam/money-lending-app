import { useState } from "react";
import { supabase, createTempClient } from "../lib/supabaseClient";
import { btnStyle, inputStyle, labelStyle } from "../utils/theme";

export default function AddUserModal({ onClose, onSaved }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const temp = createTempClient();
    const { data, error } = await temp.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { first_name: firstName.trim(), last_name: lastName.trim(), full_name: fullName } },
    });

    if (error) {
      setBusy(false);
      setErr(error.message);
      return;
    }

    if (role === "admin" && data.user?.id) {
      const { error: roleErr } = await supabase.from("profiles").update({ role: "admin" }).eq("id", data.user.id);
      if (roleErr) {
        setBusy(false);
        setErr(roleErr.message);
        return;
      }
    }

    setBusy(false);
    onSaved();
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit} style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 14, padding: 20, width: "100%", maxWidth: 380, maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: "#f0b429", marginBottom: 14 }}>➕ Add User</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <div>
            <label style={labelStyle}>First Name</label>
            <input style={inputStyle} required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Juan" />
          </div>
          <div>
            <label style={labelStyle}>Last Name</label>
            <input style={inputStyle} required value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="dela Cruz" />
          </div>
        </div>

        <label style={labelStyle}>Email</label>
        <input style={{ ...inputStyle, marginBottom: 12 }} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />

        <label style={labelStyle}>Password</label>
        <input style={{ ...inputStyle, marginBottom: 12 }} type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Any 6+ characters" />

        <label style={labelStyle}>Role</label>
        <select style={{ ...inputStyle, marginBottom: 12 }} value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        {err && <div style={{ color: "#f85149", fontSize: 14, marginBottom: 10 }}>⚠️ {err}</div>}

        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={onClose} style={{ ...btnStyle, flex: 1, background: "transparent", border: "1px solid #30363d", color: "#8b949e" }}>Cancel</button>
          <button type="submit" disabled={busy} style={{ ...btnStyle, flex: 1, background: "#f0b429", color: "#0d1117" }}>{busy ? "Creating..." : "Create User"}</button>
        </div>
      </form>
    </div>
  );
}
