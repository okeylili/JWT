import { useEffect, useState } from "react";
import { useAuthState } from "../hooks/useAuth";

export default function HomePage() {
  const { auth, refresh } = useAuthState();
  const [error, setError] = useState("");

  useEffect(() => {
    if (!auth.user) {
      refresh().catch(() => setError("Session not found. Please log in."));
    }
  }, [auth.user, refresh]);

  if (!auth.user) {
    return (
      <div className="panel rounded-3xl p-6">
        <p className="text-slate-200">{error || "Loading secure session..."}</p>
      </div>
    );
  }

  return (
    <section className="grid gap-4 md:grid-cols-3">
      <div className="panel rounded-3xl p-6 md:col-span-2">
        <h1 className="text-2xl font-semibold text-white">Security Dashboard</h1>
        <p className="mt-2 text-slate-300">Welcome back, {auth.user.name || auth.user.email}.</p>
        <p className="mt-4 text-sm text-slate-300">
          This portal is configured with access token expiry, refresh rotation, CSRF protection, and security event tracking.
        </p>
      </div>
      <div className="panel rounded-3xl p-6">
        <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Current Role</p>
        <p className="mt-3 text-2xl font-semibold text-indigo-200">{auth.user.role}</p>
      </div>
    </section>
  );
}
