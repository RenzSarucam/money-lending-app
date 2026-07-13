import { useState } from "react";
import Avatar from "./Avatar";

const navItems = [
  { key: "dashboard", label: "Dashboard", icon: "📊" },
  { key: "add", label: "Add Borrower", icon: "➕" },
  { key: "collect", label: "Collect", icon: "💵" },
  { key: "reports", label: "Reports", icon: "📈" },
  { key: "users", label: "Monitor Users", icon: "👥" },
];

export default function Sidebar({ tab, setTab, profile, onEditProfile, onLogout, open, onClose, collapsed, onToggleCollapse }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const go = (fn, val) => {
    fn(val);
    onClose?.();
  };

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
    padding: collapsed ? "9px" : "9px 12px",
    justifyContent: collapsed ? "center" : "flex-start",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    marginBottom: 4,
  });

  return (
    <div className={`admin-sidebar${open ? " open" : ""}${collapsed ? " collapsed" : ""}`}>
      <div style={{ marginBottom: 20, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 6 }}>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#f0b429", margin: 0, whiteSpace: "nowrap", overflow: "hidden" }}>{collapsed ? "💰" : "💰 MONEY LENDING"}</h1>
          {!collapsed && <p style={{ fontSize: 13, color: "#8b949e", marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{profile?.full_name || "Admin"}</p>}
        </div>
        <button
          onClick={onToggleCollapse}
          className="admin-sidebar-collapse-btn"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? "›" : "‹"}
        </button>
      </div>

      {!collapsed && (
        <div style={{ fontSize: 12, fontWeight: 700, color: "#8b949e", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
          Menu
        </div>
      )}
      {navItems.map((n) => (
        <button key={n.key} onClick={() => go(setTab, n.key)} style={navBtn(tab === n.key)} title={n.label}>
          <span>{n.icon}</span> {!collapsed && n.label}
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
              minWidth: 180,
              background: "#21262d",
              border: "1px solid #30363d",
              borderRadius: 10,
              padding: 6,
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            }}
          >
            <button
              onClick={() => { setMenuOpen(false); onEditProfile(); onClose?.(); }}
              style={{ display: "block", width: "100%", textAlign: "left", background: "transparent", border: "none", color: "#e6edf3", padding: "8px 10px", borderRadius: 6, cursor: "pointer", fontSize: 15 }}
            >
              ✏️ Edit Profile
            </button>
            <button
              onClick={() => { setMenuOpen(false); onLogout(); }}
              style={{ display: "block", width: "100%", textAlign: "left", background: "transparent", border: "none", color: "#f85149", padding: "8px 10px", borderRadius: 6, cursor: "pointer", fontSize: 15 }}
            >
              🚪 Logout
            </button>
          </div>
        )}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          title={profile?.full_name || "Admin"}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
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
          {!collapsed && (
            <div style={{ textAlign: "left", overflow: "hidden" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#e6edf3", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {profile?.full_name || "Admin"}
              </div>
              <div style={{ fontSize: 12, color: "#8b949e" }}>{profile?.role}</div>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
