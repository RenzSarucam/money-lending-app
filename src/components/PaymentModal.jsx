import { calcBorrower, fmt } from "../utils/calc";
import { btnStyle } from "../utils/theme";

export default function PaymentModal({ borrower, onClose, onDeletePayment, canDelete }) {
  if (!borrower) return null;
  const c = calcBorrower(borrower);
  const sorted = [...borrower.payments].sort((a, z) => new Date(z.date) - new Date(a.date));
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 14, padding: 20, width: "100%", maxWidth: 380 }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: "#f0b429", marginBottom: 12 }}>📋 {borrower.name} — Payments</div>
        {[["Total Collected", fmt(c.paid), "#3fb950"], ["Remaining", fmt(c.remaining), "#f0b429"]].map(([k, v, col]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, margin: "3px 0" }}>
            <span style={{ color: "#8b949e" }}>{k}</span>
            <span style={{ fontWeight: 600, color: col }}>{v}</span>
          </div>
        ))}
        <div style={{ background: "#21262d", borderRadius: 20, height: 8, margin: "10px 0", overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 20, width: `${c.progress}%`, background: "linear-gradient(90deg,#238636,#3fb950)" }} />
        </div>
        <div style={{ maxHeight: 280, overflowY: "auto" }}>
          {sorted.length === 0 ? (
            <p style={{ color: "#8b949e", fontSize: 15, textAlign: "center", padding: 16 }}>No payments yet</p>
          ) : (
            sorted.map((p) => (
              <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid #21262d" }}>
                <span style={{ fontSize: 14, color: "#8b949e" }}>{new Date(p.date).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#3fb950" }}>{fmt(p.amount)}</span>
                  {canDelete && (
                    <button onClick={() => onDeletePayment(borrower.id, p.id)} style={{ background: "#3a1a1a", color: "#f85149", border: "1px solid #da3633", borderRadius: 6, padding: "2px 8px", fontSize: 12, cursor: "pointer" }}>✕</button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        <button onClick={onClose} style={{ ...btnStyle, background: "transparent", border: "1px solid #30363d", color: "#8b949e", width: "100%", marginTop: 12 }}>Close</button>
      </div>
    </div>
  );
}
