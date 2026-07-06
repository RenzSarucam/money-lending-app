import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { supabaseConfigured } from "./lib/supabaseClient";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminApp from "./pages/AdminApp";
import UserApp from "./pages/UserApp";

function SetupNeeded() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0d1117", color: "#e6edf3", fontFamily: "'Segoe UI', sans-serif", padding: 16 }}>
      <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 14, padding: 24, maxWidth: 460 }}>
        <h1 style={{ color: "#f0b429", fontSize: 20 }}>⚙️ Setup Required</h1>
        <p style={{ fontSize: 15, color: "#8b949e", lineHeight: 1.6 }}>
          Add the Supabase Project URL and anon key to the <code>.env</code> file (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY),
          then run <code>supabase_schema.sql</code> in the Supabase SQL Editor. Restart the dev server afterwards.
        </p>
      </div>
    </div>
  );
}

function Gate() {
  const { session, profile, loading } = useAuth();

  if (loading) return <div style={{ minHeight: "100vh", background: "#0d1117", color: "#8b949e", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading...</div>;

  return (
    <Routes>
      <Route path="/login" element={session ? <Navigate to="/" /> : <Login />} />
      <Route path="/signup" element={session ? <Navigate to="/" /> : <Signup />} />
      <Route
        path="/"
        element={
          !session ? (
            <Navigate to="/login" />
          ) : profile?.role === "admin" ? (
            <AdminApp />
          ) : (
            <UserApp />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  if (!supabaseConfigured) return <SetupNeeded />;
  return (
    <BrowserRouter>
      <AuthProvider>
        <Gate />
      </AuthProvider>
    </BrowserRouter>
  );
}
