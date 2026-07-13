import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { fmt, computeArawanTotals, computePaluwaganTotals } from "../utils/calc";
import { btnStyle, inputStyle, labelStyle } from "../utils/theme";

export default function EditBorrowerModal({ borrower: b, onClose, onSaved }) {
  const isPaluwagan = b.loan_type === "paluwagan";

  const [form, setForm] = useState({
    name: b.name,
    email: b.email || "",
    principal: b.principal,
    interest: b.interest,
    termDays: b.term_days || 60,
    collectDays: b.collection_days || "daily",
    termMonths: b.term_months || 5,
    startDate: b.start_date,
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const termDays = parseFloat(form.termDays) || 0;
  const termMonths = parseFloat(form.termMonths) || 0;

  const arawan = computeArawanTotals(parseFloat(form.principal) || 0, parseFloat(form.interest) || 0, termDays);
  const paluwagan = computePaluwaganTotals(parseFloat(form.principal) || 0, parseFloat(form.interest) || 0, termMonths);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setErr("Enter a name!"); return; }
    if (!form.principal || form.principal <= 0) { setErr("Enter a principal!"); return; }
    if (isPaluwagan) {
      if (!termMonths || termMonths <= 0) { setErr("Enter a valid number of months!"); return; }
    } else {
      if (!termDays || termDays <= 0) { setErr("Enter a valid term!"); return; }
    }
    setErr("");
    setBusy(true);

    const update = isPaluwagan
      ? {
          name: form.name.trim(), email: form.email.trim() || null,
          principal: parseFloat(form.principal), interest: parseFloat(form.interest),
          start_date: form.startDate, total_amount: paluwagan.total,
          term_months: termMonths, monthly_payment: paluwagan.monthly,
        }
      : {
          name: form.name.trim(), email: form.email.trim() || null,
          principal: parseFloat(form.principal), interest: parseFloat(form.interest),
          start_date: form.startDate, total_amount: arawan.total,
          term_days: termDays, collection_days: form.collectDays, daily_payment: arawan.daily,
        };

    const { error } = await supabase.from("borrowers").update(update).eq("id", b.id);
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    onSaved();
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit} style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 14, padding: 20, width: "100%", maxWidth: 420, maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#f0b429" }}>✏️ Edit Borrower</div>
          <span style={{ background: isPaluwagan ? "#2a1a3a" : "#1a2a3a", color: isPaluwagan ? "#c297ff" : "#79c0ff", border: `1px solid ${isPaluwagan ? "#6f42c1" : "#1f6feb"}`, borderRadius: 6, padding: "1px 6px", fontSize: 11, fontWeight: 700 }}>
            {b.loan_type.toUpperCase()}
          </span>
        </div>
        <p style={{ fontSize: 12, color: "#8b949e", marginTop: -8, marginBottom: 12 }}>Loan type can't be changed after creation. {b.payments?.length > 0 && `This borrower already has ${b.payments.length} payment(s) recorded.`}</p>

        <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={labelStyle}>Name</label>
            <input style={inputStyle} value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={labelStyle}>Borrower's Email (optional)</label>
            <input style={inputStyle} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Principal (₱)</label>
            <input style={inputStyle} type="number" value={form.principal} onChange={(e) => set("principal", e.target.value)} />
          </div>

          {isPaluwagan ? (
            <>
              <div>
                <label style={labelStyle}>Interest per Month (%)</label>
                <input style={inputStyle} type="number" value={form.interest} onChange={(e) => set("interest", e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Number of Months</label>
                <input style={inputStyle} type="number" value={form.termMonths} onChange={(e) => set("termMonths", e.target.value)} />
              </div>
            </>
          ) : (
            <>
              <div>
                <label style={labelStyle}>Interest (%)</label>
                <input style={inputStyle} type="number" value={form.interest} onChange={(e) => set("interest", e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Term (Days)</label>
                <input style={inputStyle} type="number" value={form.termDays} onChange={(e) => set("termDays", e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Collection Days</label>
                <select style={inputStyle} value={form.collectDays} onChange={(e) => set("collectDays", e.target.value)}>
                  <option value="daily">Daily (7 days/week)</option>
                  <option value="monsat">Mon–Sat (6 days/week)</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label style={labelStyle}>Start Date</label>
            <input style={inputStyle} type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
          </div>
        </div>

        <div style={{ background: "#0d1117", border: "1px solid #30363d", borderRadius: 8, padding: 10, marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {(isPaluwagan
            ? [["Total", fmt(paluwagan.total)], ["Interest/Month", fmt(paluwagan.monthly)], ["Final Month (+principal)", fmt(paluwagan.monthly + (parseFloat(form.principal) || 0))]]
            : [["Total", fmt(arawan.total)], ["Interest", fmt(arawan.total - (parseFloat(form.principal) || 0))], ["Daily", fmt(arawan.daily)]]
          ).map(([l, v]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#f0b429" }}>{v}</div>
              <div style={{ fontSize: 11, color: "#8b949e", marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>

        {err && <div style={{ color: "#f85149", fontSize: 14, marginTop: 8 }}>⚠️ {err}</div>}

        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <button type="button" onClick={onClose} style={{ ...btnStyle, flex: 1, background: "transparent", border: "1px solid #30363d", color: "#8b949e" }}>Cancel</button>
          <button type="submit" disabled={busy} style={{ ...btnStyle, flex: 1, background: "#f0b429", color: "#0d1117" }}>{busy ? "Saving..." : "Save Changes"}</button>
        </div>
      </form>
    </div>
  );
}
