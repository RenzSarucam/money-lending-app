export const fmt = (n) =>
  "₱" +
  parseFloat(n || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const today = () => new Date().toISOString().split("T")[0];

function baseCalc(b, paid) {
  const remaining = Math.max(0, b.total_amount - paid);
  const progress = Math.min(100, (paid / b.total_amount) * 100);
  const isDone = remaining < 0.5;
  return { paid, remaining, progress, isDone };
}

function elapsedCollectionDays(startDate, collectionDays, termDays) {
  const start = new Date(startDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  let elapsed = 0;
  let d = new Date(start);
  while (d <= now) {
    const dow = d.getDay();
    if (collectionDays === "daily" || (collectionDays === "monsat" && dow !== 0)) elapsed++;
    d.setDate(d.getDate() + 1);
  }
  return Math.min(elapsed, termDays);
}

function elapsedMonths(startDate, termMonths) {
  const start = new Date(startDate);
  const now = new Date();
  let months =
    (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  if (now.getDate() < start.getDate()) months -= 1;
  return Math.min(Math.max(0, months + 1), termMonths);
}

export function calcBorrower(b) {
  const paid = (b.payments || []).reduce((s, p) => s + p.amount, 0);
  const base = baseCalc(b, paid);

  if (b.loan_type === "paluwagan") {
    const elapsed = elapsedMonths(b.start_date, b.term_months);
    const expectedPaid = elapsed * b.monthly_payment;
    const deficit = Math.max(0, expectedPaid - paid);
    const isLate = deficit > 0.5;
    return { ...base, elapsed, expectedPaid, deficit, isLate, unit: "buwan" };
  }

  const elapsed = elapsedCollectionDays(b.start_date, b.collection_days, b.term_days);
  const expectedPaid = elapsed * b.daily_payment;
  const deficit = Math.max(0, expectedPaid - paid);
  const isLate = deficit > 0.5;
  return { ...base, elapsed, expectedPaid, deficit, isLate, unit: "araw" };
}

export function computeArawanTotals(principal, interestPct, termDays) {
  const total = principal + principal * (interestPct / 100);
  const daily = termDays > 0 ? total / termDays : 0;
  return { total, daily: parseFloat(daily.toFixed(2)) };
}

export function computePaluwaganTotals(principal, monthlyInterestPct, termMonths) {
  const total = principal + principal * (monthlyInterestPct / 100) * termMonths;
  const monthly = termMonths > 0 ? total / termMonths : 0;
  return { total, monthly: parseFloat(monthly.toFixed(2)) };
}
