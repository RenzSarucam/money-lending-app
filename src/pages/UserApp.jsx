import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { calcBorrower, fmt } from "../utils/calc";
import { btnStyle, cardStyle } from "../utils/theme";

export default function UserApp() {
  const { session, signOut } = useAuth();
  const [borrowers, setBorrowers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("borrowers")
        .select("*, payments(*)")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: true });
      setBorrowers(data || []);
      setLoading(false);
    })();
  }, [session.user.id]);

  if (loading) return <div style={{ minHeight: "100vh", background: "#0d1117", color: "#8b949e", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading...</div>;

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: "#0d1117", color: "#e6edf3", minHeight: "100vh" }}>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 0 16px" }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#f0b429", letterSpacing: 1, margin: 0 }}>💰 My Loan</h1>
            <p style={{ fontSize: 12, color: "#8b949e", marginTop: 4 }}>{session.user.email}</p>
          </div>
          <button onClick={signOut} style={{ ...btnStyle, background: "transparent", border: "1px solid #30363d", color: "#8b949e", fontSize: 12 }}>Logout</button>
        </div>

        {!borrowers.length ? (
          <div style={{ textAlign: "center", padding: "48px 20px", color: "#8b949e" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <p style={{ fontSize: 14 }}>No loan account linked here yet. Ask your lender to link your account using this email.</p>
          </div>
        ) : (
          borrowers.map((b) => {
            const c = calcBorrower(b);
            const status = c.isDone ? "done" : c.isLate ? "late" : "active";
            const badgeMap = {
              done: { bg: "#1a2a3a", color: "#79c0ff", border: "#1f6feb", text: "✔ DONE" },
              late: { bg: "#3a1a1a", color: "#f85149", border: "#da3633", text: "⚠️ LATE" },
              active: { bg: "#1a3a1e", color: "#3fb950", border: "#238636", text: "🟢 ACTIVE" },
            };
            const badge = badgeMap[status];
            const sortedPayments = [...b.payments].sort((x, y) => new Date(y.date) - new Date(x.date));
            return (
              <div key={b.id} style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{b.loan_type === "paluwagan" ? "🤝 Paluwagan" : "☀️ Arawan"} Loan</div>
                    <div style={{ fontSize: 11, color: "#8b949e", marginTop: 2 }}>
                      Started: {new Date(b.start_date).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                  </div>
                  <span style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`, borderRadius: 20, padding: "3px 9px", fontSize: 10, fontWeight: 700, whiteSpace: "nowrap" }}>{badge.text}</span>
                </div>

                {[
                  ["Principal", fmt(b.principal), null],
                  ["Total Payable", fmt(b.total_amount), "#f0b429"],
                  b.loan_type === "paluwagan"
                    ? ["Monthly Payment", `${fmt(b.monthly_payment)}/month`, null]
                    : ["Daily Payment", `${fmt(b.daily_payment)}/day`, null],
                  ["Paid So Far", fmt(c.paid), "#3fb950"],
                  ["Remaining Balance", fmt(c.remaining), c.remaining > 0 ? "#f0b429" : "#3fb950"],
                  ...(c.isLate && !c.isDone ? [["Short", `-${fmt(c.deficit)}`, "#f85149"]] : []),
                ].map(([k, v, col], i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, margin: "4px 0" }}>
                    <span style={{ color: "#8b949e" }}>{k}</span>
                    <span style={{ fontWeight: 600, color: col || "#e6edf3" }}>{v}</span>
                  </div>
                ))}

                <div style={{ background: "#21262d", borderRadius: 20, height: 8, margin: "10px 0", overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 20, width: `${c.progress}%`, background: c.isLate ? "linear-gradient(90deg,#f0b429,#e0a420)" : "linear-gradient(90deg,#238636,#3fb950)" }} />
                </div>
                <div style={{ textAlign: "right", fontSize: 11, color: "#8b949e", marginBottom: 10 }}>{c.progress.toFixed(1)}% done</div>

                <div style={{ fontSize: 11, fontWeight: 700, color: "#8b949e", textTransform: "uppercase", letterSpacing: 1, margin: "12px 0 8px" }}>
                  Payment History
                </div>
                {sortedPayments.length === 0 ? (
                  <p style={{ color: "#8b949e", fontSize: 13, textAlign: "center", padding: 12 }}>No payments recorded yet</p>
                ) : (
                  <div style={{ maxHeight: 220, overflowY: "auto" }}>
                    {sortedPayments.map((p) => (
                      <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #21262d" }}>
                        <span style={{ fontSize: 12, color: "#8b949e" }}>{new Date(p.date).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#3fb950" }}>{fmt(p.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
