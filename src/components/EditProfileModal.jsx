import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { btnStyle, inputStyle, labelStyle } from "../utils/theme";
import Avatar from "./Avatar";

export default function EditProfileModal({ profile, onClose, onSaved }) {
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  if (!profile) return null;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim(), avatar_url: avatarUrl.trim() || null })
      .eq("id", profile.id);
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    onSaved();
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit} style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 14, padding: 20, width: "100%", maxWidth: 360 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#f0b429", marginBottom: 14 }}>✏️ Edit Profile</div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <Avatar name={fullName || profile.email} avatarUrl={avatarUrl} size={64} />
        </div>

        <label style={labelStyle}>Full Name</label>
        <input style={{ ...inputStyle, marginBottom: 12 }} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Juan dela Cruz" />

        <label style={labelStyle}>Avatar Image URL (optional)</label>
        <input style={{ ...inputStyle, marginBottom: 12 }} value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." />

        <label style={labelStyle}>Email</label>
        <input style={{ ...inputStyle, marginBottom: 12, opacity: 0.6 }} value={profile.email || ""} disabled />

        {err && <div style={{ color: "#f85149", fontSize: 12, marginBottom: 10 }}>⚠️ {err}</div>}

        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={onClose} style={{ ...btnStyle, flex: 1, background: "transparent", border: "1px solid #30363d", color: "#8b949e" }}>Cancel</button>
          <button type="submit" disabled={busy} style={{ ...btnStyle, flex: 1, background: "#f0b429", color: "#0d1117" }}>{busy ? "Saving..." : "Save"}</button>
        </div>
      </form>
    </div>
  );
}
