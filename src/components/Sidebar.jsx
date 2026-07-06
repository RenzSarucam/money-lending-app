import { useState } from "react";
import Avatar from "./Avatar";

const navItems = [
  { key: "dashboard", label: "Dashboard", icon: "📊" },
  { key: "add", label: "Add Borrower", icon: "➕" },
  { key: "collect", label: "Collect", icon: "💵" },
  { key: "users", label: "Monitor Users", icon: "👥" },
];

const loanFilters = [
  { key: "all", label: "All Loans", icon: "📁" },
  { key: "arawan", label: "Arawan", icon: "☀️" },
  { key: "paluwagan", label: "Paluwagan", icon: "🤝" },
];

export default function Sidebar({ tab, setTab, loanFilter, setLoanFilter, profile, onEditProfile, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navBtn = (active) => ({
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
    textAlign: "left",
    background: active ? "#f0b429" : "transparent",
    color: active ? "#0d1117" : "#8b949e",
    border: "none",
    borderRadius: 8,
    padding: "9px 12px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    marginBottom: 4,
  });

  return (
    <div
      style={{
        width: 230,
        flexShrink: 0,
        background: "#161b22",
        borderRight: "1px solid #30363d",
        height: "100vh",
        position: "sticky",
        top: 0,
        display: "flex",
        flexDirection: "column",
        padding: 16,
        boxSizing: "border-box",
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#f0b429", margin: 0 }}>💰 MONEY LENDING</h1>
        <p style={{ fontSize: 11, color: "#8b949e", marginTop: 4 }}>Admin Panel</p>
      </div>

      <div style={{ fontSize: 10, fontWeight: 700, color: "#8b949e", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
        Loan Type
      </div>
      {loanFilters.map((f) => (
        <button key={f.key} onClick={() => setLoanFilter(f.key)} style={navBtn(loanFilter === f.key)}>
          <span>{f.icon}</span> {f.label}
        </button>
      ))}

      <div style={{ fontSize: 10, fontWeight: 700, color: "#8b949e", textTransform: "uppercase", letterSpacing: 1, margin: "16px 0 8px" }}>
        Menu
      </div>
      {navItems.map((n) => (
        <button key={n.key} onClick={() => setTab(n.key)} style={navBtn(tab === n.key)}>
          <span>{n.icon}</span> {n.label}
        </button>
      ))}

      <div style={{ flex: 1 }} />

      <div style={{ position: "relative" }}>
        {menuOpen && (
          <div
            style={{
              position: "absolute",
              bottom: "calc(100% + 8px)",
              left: 0,
              right: 0,
              background: "#21262d",
              border: "1px solid #30363d",
              borderRadius: 10,
              padding: 6,
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            }}
          >
            <button
              onClick={() => { setMenuOpen(false); onEditProfile(); }}
              style={{ display: "block", width: "100%", textAlign: "left", background: "transparent", border: "none", color: "#e6edf3", padding: "8px 10px", borderRadius: 6, cursor: "pointer", fontSize: 13 }}
            >
              ✏️ Edit Profile
            </button>
            <button
              onClick={() => { setMenuOpen(false); onLogout(); }}
              style={{ display: "block", width: "100%", textAlign: "left", background: "transparent", border: "none", color: "#f85149", padding: "8px 10px", borderRadius: 6, cursor: "pointer", fontSize: 13 }}
            >
              🚪 Logout
            </button>
          </div>
        )}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: "100%",
            background: "#0d1117",
            border: "1px solid #30363d",
            borderRadius: 10,
            padding: 8,
            cursor: "pointer",
          }}
        >
          <Avatar name={profile?.full_name || profile?.email} avatarUrl={profile?.avatar_url} size={32} />
          <div style={{ textAlign: "left", overflow: "hidden" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#e6edf3", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {profile?.full_name || "Admin"}
            </div>
            <div style={{ fontSize: 10, color: "#8b949e" }}>{profile?.role}</div>
          </div>
        </button>
      </div>
    </div>
  );
}
