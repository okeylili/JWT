import { Link } from "react-router-dom";
import { useAuthState } from "../hooks/useAuth";
import { useTheme } from "../context/ThemeContext";

export default function Layout({ children }) {
  const { auth, logout } = useAuthState();
  const { mode, setMode, accent, setAccent } = useTheme();
  const userInitial = auth.user?.email?.[0]?.toUpperCase() || "G";

  return (
    <div className="min-h-screen px-4 pb-10 pt-6 md:px-8">
      <header className="mx-auto mb-6 max-w-6xl">
        <nav className="panel flex items-center justify-between rounded-2xl px-4 py-3 md:px-6">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-indigo-200">
              SecureAuth
            </div>
            <Link className="text-main text-sm transition opacity-85 hover:opacity-100" to="/">
              Dashboard
            </Link>
            <Link className="text-main text-sm transition opacity-85 hover:opacity-100" to="/admin">
              Admin Console
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <select
              className="field !w-28 !py-2 !text-xs"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="custom">Custom</option>
            </select>
            {mode === "custom" ? (
              <input
                type="color"
                value={accent}
                aria-label="Pick custom accent color"
                onChange={(e) => setAccent(e.target.value)}
                className="h-9 w-11 cursor-pointer rounded border border-white/25 bg-transparent p-1"
              />
            ) : null}
            <div className="text-main flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xs font-semibold">
              {userInitial}
            </div>
            <span className="text-muted-ui hidden text-sm md:inline">{auth.user?.email || "Guest Session"}</span>
            {auth.user ? (
              <button className="btn btn-secondary text-sm" onClick={logout}>
                Logout
              </button>
            ) : null}
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl">{children}</main>
    </div>
  );
}
