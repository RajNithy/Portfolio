"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { AdminDashboard } from "./dashboard";

export default function AdminPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => listener.subscription.unsubscribe();
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setBusy(false);
  }

  if (loading) return <div className="admin-screen">Loading dashboard…</div>;
  if (session) return <AdminDashboard />;

  return (
    <main className="admin-screen">
      <form className="login-card" onSubmit={login}>
        <a href="/" className="admin-brand"><span>R.</span> RAAK EDITZ</a>
        <p className="admin-kicker">PRIVATE CREATOR AREA</p>
        <h1>Welcome back.</h1>
        <p className="admin-muted">Sign in to manage your portfolio projects.</p>
        <label>Email address<input type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="you@example.com"/></label>
        <label>Password<input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="Your password"/></label>
        {error && <p className="admin-error">{error}</p>}
        <button className="admin-primary" disabled={busy}>{busy ? "Signing in…" : "Sign in to dashboard →"}</button>
        <a className="admin-back" href="/">← Back to portfolio</a>
      </form>
    </main>
  );
}
