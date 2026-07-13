import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anonKey);

export const supabase = supabaseConfigured
  ? createClient(url, anonKey)
  : null;

// Used to create new user accounts from the admin panel without swapping out
// the admin's own logged-in session (a normal signUp() call would do that).
export const createTempClient = () =>
  createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
