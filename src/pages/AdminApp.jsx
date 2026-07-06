import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { calcBorrower, fmt, today, computeArawanTotals, computePaluwaganTotals } from "../utils/calc";
import { btnStyle, inputStyle, labelStyle, cardStyle } from "../utils/theme";
import Toast from "../components/Toast";
import DeleteModal from "../components/DeleteModal";
import PaymentModal from "../components/PaymentModal";

// ── Dashboard tab ────────────────────────────────────────────────────────────
function Dashboard({ borrowers, onDelete, onViewPayments }) {
  if (!borrowers.length)
    return (
      <div style={{ textAlign: "center", padding: "48px 20px", color: "#8b949e" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
        <p style={{ fontSize: 14 }}>No borrowers yet. Add your first one!</p>
      </div>
    );

  const totalCollected = borrowers.reduce(
    (s, b) => s + b.payments.reduce((ps, p) => ps + p.amount, 0),
    0
  );
  const lateCount = borrowers.filter((b) => {
    const c = calcBorrower(b);
    return c.isLate && !c.isDone;
  }).length;

  const sorted = [...borrowers].sort((a, b) => {
    const ca = calcBorrower(a), cb = calcBorrower(b);
    if (ca.isLate && !ca.isDone && !(cb.isLate && !cb.isDone)) return -1;
    if (!(ca.isLate && !ca.isDone) && cb.isLate && !cb.isDone) return 1;
    return 0;
  });

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
        {[
          { val: borrowers.length, lbl: "Borrowers" },
          { val: fmt(totalCollected), lbl: "Collected", small: true },
          { val: lateCount, lbl: "Late", color: lateCount > 0 ? "#f85149" : "#3fb950" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 10, padding: "14px 8px", textAlign: "center" }}>
            <div style={{ fontSize: s.small ? 14 : 22, fontWeight: 700, color: s.color || "#f0b429" }}>{s.val}</div>
            <div style={{ fontSize: 11, color: "#8b949e", marginTop: 3 }}>{s.lbl}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11, fontWeight: 700, color: "#8b949e", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
        All Borrowers
      </div>

      {sorted.map((b) => {
        const c = calcBorrower(b);
        const status = c.isDone ? "done" : c.isLate ? "late" : "active";
        const badgeMap = {
          done: { bg: "#1a2a3a", color: "#79c0ff", border: "#1f6feb", text: "✔ DONE" },
          late: { bg: "#3a1a1a", color: "#f85149", border: "#da3633", text: "⚠️ LATE" },
          active: { bg: "#1a3a1e", color: "#3fb950", border: "#238636", text: "🟢 ACTIVE" },
        };
        const badge = badgeMap[status];
        const typeBadge = b.loan_type === "paluwagan"
          ? { bg: "#2a1a3a", color: "#c297ff", border: "#6f42c1", text: "PALUWAGAN" }
          : { bg: "#1a2a3a", color: "#79c0ff", border: "#1f6feb", text: "ARAWAN" };
        return (
          <div key={b.id} style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 15, fontWeight: 700 }}>{b.name}</span>
                  <span style={{ background: typeBadge.bg, color: typeBadge.color, border: `1px solid ${typeBadge.border}`, borderRadius: 6, padding: "1px 6px", fontSize: 9, fontWeight: 700 }}>{typeBadge.text}</span>
                </div>
                <div style={{ fontSize: 11, color: "#8b949e", marginTop: 2 }}>
                  Started: {new Date(b.start_date).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                  {b.email ? ` • ${b.email}` : ""}
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
              ["Collected", fmt(c.paid), "#3fb950"],
              ["Remaining to Collect", fmt(c.remaining), c.remaining > 0 ? "#f0b429" : "#3fb950"],
              ...(c.isLate && !c.isDone ? [["Short", `-${fmt(c.deficit)}`, "#f85149"]] : []),
            ].map(([k, v, col], i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, margin: "3px 0" }}>
                <span style={{ color: "#8b949e" }}>{k}</span>
                <span style={{ fontWeight: 600, color: col || "#e6edf3" }}>{v}</span>
              </div>
            ))}

            <div style={{ background: "#21262d", borderRadius: 20, height: 8, margin: "8px 0", overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 20, width: `${c.progress}%`, background: c.isLate ? "linear-gradient(90deg,#f0b429,#e0a420)" : "linear-gradient(90deg,#238636,#3fb950)", transition: "width 0.3s" }} />
            </div>
            <div style={{ textAlign: "right", fontSize: 11, color: "#8b949e" }}>{c.progress.toFixed(1)}% done • {b.payments.length} payments</div>

            <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
              <button onClick={() => onViewPayments(b.id)} style={{ ...btnStyle, background: "transparent", border: "1px solid #30363d", color: "#8b949e", fontSize: 11, padding: "6px 12px" }}>📋 Payments</button>
              <button onClick={() => onDelete(b.id)} style={{ ...btnStyle, background: "#da3633", color: "#fff", fontSize: 11, padding: "6px 12px" }}>🗑️ Delete</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Add Borrower tab ─────────────────────────────────────────────────────────
function AddBorrower({ onAdd }) {
  const [form, setForm] = useState({
    name: "", email: "", loanType: "arawan",
    principal: 20000, interest: 15,
    termSel: "60", customDays: "", collectDays: "daily",
    termMonths: 5, monthlyInterest: 5,
    startDate: today(),
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const [err, setErr] = useState("");

  const isPaluwagan = form.loanType === "paluwagan";
  const termDays = form.termSel === "custom" ? parseFloat(form.customDays) || 0 : parseFloat(form.termSel) || 0;
  const termMonths = parseFloat(form.termMonths) || 0;

  const arawan = computeArawanTotals(parseFloat(form.principal) || 0, parseFloat(form.interest) || 0, termDays);
  const paluwagan = computePaluwaganTotals(parseFloat(form.principal) || 0, parseFloat(form.monthlyInterest) || 0, termMonths);

  const submit = () => {
    if (!form.name.trim()) { setErr("Enter a name!"); return; }
    if (!form.principal || form.principal <= 0) { setErr("Enter a principal!"); return; }
    if (isPaluwagan) {
      if (!termMonths || termMonths <= 0) { setErr("Enter a valid number of months!"); return; }
    } else {
      if (!termDays || termDays <= 0) { setErr("Enter a valid term!"); return; }
    }
    setErr("");

    if (isPaluwagan) {
      onAdd({
        name: form.name.trim(), email: form.email.trim() || null, loan_type: "paluwagan",
        principal: parseFloat(form.principal), interest: parseFloat(form.monthlyInterest),
        start_date: form.startDate, total_amount: paluwagan.total,
        term_months: termMonths, monthly_payment: paluwagan.monthly,
      });
    } else {
      onAdd({
        name: form.name.trim(), email: form.email.trim() || null, loan_type: "arawan",
        principal: parseFloat(form.principal), interest: parseFloat(form.interest),
        start_date: form.startDate, total_amount: arawan.total,
        term_days: termDays, collection_days: form.collectDays, daily_payment: arawan.daily,
      });
    }
  };

  return (
    <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 12, padding: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#f0b429", marginBottom: 14 }}>➕ New Borrower</div>

      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {[["arawan", "☀️ Arawan"], ["paluwagan", "🤝 Paluwagan"]].map(([val, label]) => (
          <button key={val} onClick={() => set("loanType", val)} style={{ ...btnStyle, flex: 1, background: form.loanType === val ? "#f0b429" : "#0d1117", color: form.loanType === val ? "#0d1117" : "#8b949e", border: form.loanType === val ? "none" : "1px solid #30363d" }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ gridColumn: "1/-1" }}>
          <label style={labelStyle}>Name</label>
          <input style={inputStyle} placeholder="Juan dela Cruz" value={form.name} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div style={{ gridColumn: "1/-1" }}>
          <label style={labelStyle}>Borrower's Email (optional)</label>
          <input style={inputStyle} type="email" placeholder="so they can log in and view their account" value={form.email} onChange={(e) => set("email", e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Principal (₱)</label>
          <input style={inputStyle} type="number" value={form.principal} onChange={(e) => set("principal", e.target.value)} />
        </div>

        {isPaluwagan ? (
          <>
            <div>
              <label style={labelStyle}>Interest per Month (%)</label>
              <input style={inputStyle} type="number" value={form.monthlyInterest} onChange={(e) => set("monthlyInterest", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Number of Months</label>
              <input style={inputStyle} type="number" placeholder="5" value={form.termMonths} onChange={(e) => set("termMonths", e.target.value)} />
            </div>
          </>
        ) : (
          <>
            <div>
              <label style={labelStyle}>Interest (%)</label>
              <input style={inputStyle} type="number" value={form.interest} onChange={(e) => set("interest", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Term</label>
              <select style={inputStyle} value={form.termSel} onChange={(e) => set("termSel", e.target.value)}>
                <option value="60">2 Months (60 days)</option>
                <option value="52">2 Months Mon–Sat (52)</option>
                <option value="30">1 Month (30 days)</option>
                <option value="26">1 Month Mon–Sat (26)</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Collection Days</label>
              <select style={inputStyle} value={form.collectDays} onChange={(e) => set("collectDays", e.target.value)}>
                <option value="daily">Daily (7 days/week)</option>
                <option value="monsat">Mon–Sat (6 days/week)</option>
              </select>
            </div>
            {form.termSel === "custom" && (
              <div>
                <label style={labelStyle}>Number of Days</label>
                <input style={inputStyle} type="number" placeholder="60" value={form.customDays} onChange={(e) => set("customDays", e.target.value)} />
              </div>
            )}
          </>
        )}

        <div>
          <label style={labelStyle}>Start Date</label>
          <input style={inputStyle} type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
        </div>
      </div>

      <div style={{ background: "#0d1117", border: "1px solid #30363d", borderRadius: 8, padding: 12, marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {(isPaluwagan
          ? [["Total", fmt(paluwagan.total)], ["Interest", fmt(paluwagan.total - (parseFloat(form.principal) || 0))], ["Monthly", paluwagan.monthly > 0 ? fmt(paluwagan.monthly) : "—"]]
          : [["Total", fmt(arawan.total)], ["Interest", fmt(arawan.total - (parseFloat(form.principal) || 0))], ["Daily", arawan.daily > 0 ? fmt(arawan.daily) : "—"]]
        ).map(([l, v]) => (
          <div key={l} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#f0b429" }}>{v}</div>
            <div style={{ fontSize: 10, color: "#8b949e", marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>

      {err && <div style={{ color: "#f85149", fontSize: 12, marginTop: 8 }}>⚠️ {err}</div>}

      <button onClick={submit} style={{ ...btnStyle, background: "#f0b429", color: "#0d1117", width: "100%", marginTop: 14, padding: "11px" }}>
        💾 Save Borrower
      </button>
    </div>
  );
}

// ── Collect tab ──────────────────────────────────────────────────────────────
function Collect({ borrowers, onRecord }) {
  const [amounts, setAmounts] = useState({});
  const active = borrowers.filter((b) => !calcBorrower(b).isDone);

  if (!active.length)
    return (
      <div style={{ textAlign: "center", padding: "48px 20px", color: "#8b949e" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
        <p style={{ fontSize: 14 }}>All done!</p>
      </div>
    );

  const todayStr = today();

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#8b949e", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
        Record Payment — {new Date().toLocaleDateString("en-PH", { weekday: "long", month: "long", day: "numeric" })}
      </div>
      {active.map((b) => {
        const c = calcBorrower(b);
        const perPayment = b.loan_type === "paluwagan" ? b.monthly_payment : b.daily_payment;
        const todayPaid = b.payments.filter((p) => p.date === todayStr).reduce((s, p) => s + p.amount, 0);
        const hasPaidToday = todayPaid >= perPayment - 0.5;
        const amt = amounts[b.id] ?? perPayment.toFixed(2);
        return (
          <div key={b.id} style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{b.name}</div>
                <div style={{ fontSize: 11, color: "#8b949e" }}>
                  {b.loan_type === "paluwagan" ? "Monthly" : "Daily"}: {fmt(perPayment)}
                </div>
              </div>
              {hasPaidToday ? (
                <span style={{ background: "#1a2a3a", color: "#79c0ff", border: "1px solid #1f6feb", borderRadius: 20, padding: "3px 9px", fontSize: 10, fontWeight: 700 }}>✔ PAID</span>
              ) : c.isLate ? (
                <span style={{ background: "#3a1a1a", color: "#f85149", border: "1px solid #da3633", borderRadius: 20, padding: "3px 9px", fontSize: 10, fontWeight: 700 }}>⚠️ LATE</span>
              ) : (
                <span style={{ background: "#1a3a1e", color: "#3fb950", border: "1px solid #238636", borderRadius: 20, padding: "3px 9px", fontSize: 10, fontWeight: 700 }}>🟢 PENDING</span>
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: "#8b949e" }}>Remaining to Collect</span>
              <span style={{ fontWeight: 600, color: "#f0b429" }}>{fmt(c.remaining)}</span>
            </div>
            {c.deficit > 0.5 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: "#8b949e" }}>Still Short</span>
                <span style={{ fontWeight: 600, color: "#f85149" }}>-{fmt(c.deficit)}</span>
              </div>
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "flex-end" }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Amount</label>
                <input style={inputStyle} type="number" value={amt} onChange={(e) => setAmounts((a) => ({ ...a, [b.id]: e.target.value }))} />
              </div>
              <button onClick={() => { onRecord(b.id, parseFloat(amt)); setAmounts((a) => ({ ...a, [b.id]: perPayment.toFixed(2) })); }} style={{ ...btnStyle, background: "#f0b429", color: "#0d1117", height: 38, fontSize: 12, whiteSpace: "nowrap" }}>
                💵 Record
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Admin App ────────────────────────────────────────────────────────────────
export default function AdminApp() {
  const { signOut } = useAuth();
  const [tab, setTab] = useState("dashboard");
  const [borrowers, setBorrowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ type: null, id: null });
  const [toast, setToast] = useState({ msg: "", color: "" });

  const showToast = (msg, color = "#238636") => {
    setToast({ msg, color });
    setTimeout(() => setToast({ msg: "", color: "" }), 2500);
  };

  const loadBorrowers = async () => {
    const { data, error } = await supabase
      .from("borrowers")
      .select("*, payments(*)")
      .order("created_at", { ascending: true });
    if (error) { showToast(error.message, "#da3633"); return; }
    setBorrowers(data || []);
    setLoading(false);
  };

  useEffect(() => { loadBorrowers(); }, []);

  const addBorrower = async (b) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("borrowers").insert({ ...b, created_by: user.id });
    if (error) { showToast(error.message, "#da3633"); return; }
    showToast(`✅ ${b.name} added!`);
    setTab("dashboard");
    loadBorrowers();
  };

  const deleteBorrower = async (id) => {
    const b = borrowers.find((x) => x.id === id);
    const { error } = await supabase.from("borrowers").delete().eq("id", id);
    setModal({ type: null, id: null });
    if (error) { showToast(error.message, "#da3633"); return; }
    showToast(`${b?.name || "Borrower"} deleted`, "#da3633");
    loadBorrowers();
  };

  const recordPayment = async (id, amount) => {
    if (!amount || amount <= 0) { showToast("Enter an amount!", "#da3633"); return; }
    const b = borrowers.find((x) => x.id === id);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("payments").insert({ borrower_id: id, amount, date: today(), recorded_by: user.id });
    if (error) { showToast(error.message, "#da3633"); return; }
    showToast(`✅ ${fmt(amount)} recorded for ${b?.name}!`);
    loadBorrowers();
  };

  const deletePayment = async (borrowerId, paymentId) => {
    const { error } = await supabase.from("payments").delete().eq("id", paymentId);
    if (error) { showToast(error.message, "#da3633"); return; }
    showToast("Payment deleted", "#da3633");
    loadBorrowers();
  };

  const modalBorrower = borrowers.find((b) => b.id === modal.id);

  const tabs = [
    { key: "dashboard", label: "📊 Dashboard" },
    { key: "add", label: "➕ Add Borrower" },
    { key: "collect", label: "💵 Collect" },
  ];

  if (loading) return <div style={{ minHeight: "100vh", background: "#0d1117", color: "#8b949e", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading...</div>;

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: "#0d1117", color: "#e6edf3", minHeight: "100vh" }}>
      <style>{`@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } } input[type=date]::-webkit-calendar-picker-indicator { filter: invert(1); }`}</style>
      <div style={{ maxWidth: 880, margin: "0 auto", padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 0 16px" }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f0b429", letterSpacing: 1, margin: 0 }}>💰 MONEY LENDING</h1>
            <p style={{ fontSize: 12, color: "#8b949e", marginTop: 4 }}>Admin • Arawan &amp; Paluwagan Manager</p>
          </div>
          <button onClick={signOut} style={{ ...btnStyle, background: "transparent", border: "1px solid #30363d", color: "#8b949e", fontSize: 12 }}>Logout</button>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{ ...btnStyle, flex: 1, background: tab === t.key ? "#f0b429" : "#161b22", color: tab === t.key ? "#0d1117" : "#8b949e", border: tab === t.key ? "none" : "1px solid #30363d", fontSize: 12 }}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "dashboard" && <Dashboard borrowers={borrowers} onDelete={(id) => setModal({ type: "delete", id })} onViewPayments={(id) => setModal({ type: "payments", id })} />}
        {tab === "add" && <AddBorrower onAdd={addBorrower} />}
        {tab === "collect" && <Collect borrowers={borrowers} onRecord={recordPayment} />}
      </div>

      {modal.type === "payments" && <PaymentModal borrower={modalBorrower} canDelete onClose={() => setModal({ type: null, id: null })} onDeletePayment={deletePayment} />}
      {modal.type === "delete" && <DeleteModal name={modalBorrower?.name} onConfirm={() => deleteBorrower(modal.id)} onCancel={() => setModal({ type: null, id: null })} />}

      <Toast msg={toast.msg} color={toast.color} />
    </div>
  );
}
