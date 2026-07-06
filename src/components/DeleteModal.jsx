import { btnStyle } from "../utils/theme";

export default function DeleteModal({ name, onConfirm, onCancel }) {
  if (!name) return null;
  return (
    <div onClick={onCancel} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 14, padding: 20, width: "100%", maxWidth: 340 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#f85149", marginBottom: 10 }}>🗑️ Delete {name}?</div>
        <p style={{ fontSize: 13, color: "#8b949e", marginBottom: 16 }}>All payment records will be removed. This cannot be undone!</p>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onCancel} style={{ ...btnStyle, flex: 1, background: "transparent", border: "1px solid #30363d", color: "#8b949e" }}>Cancel</button>
          <button onClick={onConfirm} style={{ ...btnStyle, flex: 1, background: "#da3633", color: "#fff" }}>Delete</button>
        </div>
      </div>
    </div>
  );
}
