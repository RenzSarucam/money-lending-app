import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { fmt } from "../utils/calc";
import { btnStyle, inputStyle, labelStyle } from "../utils/theme";
import Avatar from "./Avatar";

export default function UserDetailModal({ user, linkedBorrower, onClose, onSaved }) {
  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || "");
  const [role, setRole] = useState(user?.role || "user");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  if (!user) return null;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const { error } = await supabase
      .from("profiles")
      .update({ first_name: firstName.trim(), last_name: lastName.trim(), full_name: fullName, avatar_url: avatarUrl.trim() || null, role })
      .eq("id", user.id);
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    onSaved();
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit} style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 14, padding: 20, width: "100%", maxWidth: 380, maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: "#f0b429", marginBottom: 14 }}>👤 User Details</div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <Avatar name={`${firstName} ${lastName}`.trim() || user.email} avatarUrl={avatarUrl} size={64} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <div>
            <label style={labelStyle}>First Name</label>
            <input style={inputStyle} value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Juan" />
          </div>
          <div>
            <label style={labelStyle}>Last Name</label>
            <input style={inputStyle} value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="dela Cruz" />
          </div>
        </div>

        <label style={labelStyle}>Avatar Image URL (optional)</label>
        <input style={{ ...inputStyle, marginBottom: 12 }} value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." />

        <label style={labelStyle}>Email</label>
        <input style={{ ...inputStyle, marginBottom: 12, opacity: 0.6 }} value={user.email || ""} disabled />

        <label style={labelStyle}>Role</label>
        <select style={{ ...inputStyle, marginBottom: 12 }} value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        <label style={labelStyle}>Joined</label>
        <input style={{ ...inputStyle, marginBottom: 12, opacity: 0.6 }} value={new Date(user.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })} disabled />

        <label style={labelStyle}>Linked Loan</label>
        <div style={{ background: "#0d1117", border: "1px solid #30363d", borderRadius: 8, padding: 10, marginBottom: 12, fontSize: 13 }}>
          {linkedBorrower ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ color: "#8b949e" }}>Name</span>
                <span style={{ fontWeight: 600 }}>{linkedBorrower.name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ color: "#8b949e" }}>Type</span>
                <span style={{ fontWeight: 600 }}>{linkedBorrower.loan_type}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#8b949e" }}>Total Payable</span>
                <span style={{ fontWeight: 600, color: "#f0b429" }}>{fmt(linkedBorrower.total_amount)}</span>
              </div>
            </>
          ) : (
            <span style={{ color: "#8b949e" }}>Not linked to any loan</span>
          )}
        </div>

        {err && <div style={{ color: "#f85149", fontSize: 14, marginBottom: 10 }}>⚠️ {err}</div>}

        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={onClose} style={{ ...btnStyle, flex: 1, background: "transparent", border: "1px solid #30363d", color: "#8b949e" }}>Cancel</button>
          <button type="submit" disabled={busy} style={{ ...btnStyle, flex: 1, background: "#f0b429", color: "#0d1117" }}>{busy ? "Saving..." : "Save"}</button>
        </div>
      </form>
    </div>
  );
}
