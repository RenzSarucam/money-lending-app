import { useState } from "react";
import { btnStyle, inputStyle, labelStyle } from "../utils/theme";

export default function DeleteModal({ name, impact, onConfirm, onCancel }) {
  const [typed, setTyped] = useState("");
  if (!name) return null;
  const matches = typed.trim().toLowerCase() === name.trim().toLowerCase();

  return (
    <div onClick={onCancel} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 14, padding: 20, width: "100%", maxWidth: 360 }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: "#f85149", marginBottom: 10 }}>🗑️ Delete {name}?</div>
        <p style={{ fontSize: 15, color: "#8b949e", marginBottom: 12 }}>{impact || "This cannot be undone!"}</p>

        <label style={labelStyle}>Type "{name}" to confirm</label>
        <input style={{ ...inputStyle, marginBottom: 16 }} value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={name} autoFocus />

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onCancel} style={{ ...btnStyle, flex: 1, background: "transparent", border: "1px solid #30363d", color: "#8b949e" }}>Cancel</button>
          <button onClick={onConfirm} disabled={!matches} style={{ ...btnStyle, flex: 1, background: "#da3633", color: "#fff", opacity: matches ? 1 : 0.5, cursor: matches ? "pointer" : "not-allowed" }}>Delete</button>
        </div>
      </div>
    </div>
  );
}
