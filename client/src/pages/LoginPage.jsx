import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthState } from "../hooks/useAuth";

export default function LoginPage() {
  const { login } = useAuthState();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await login(form);
      navigate("/");
    } catch (err) {
      if (err.code === "ERR_NETWORK") {
        setError("Cannot reach backend server. Please start server + database + redis.");
      } else {
        setError(err.response?.data?.message || "Login failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
      <div className="panel rounded-3xl p-7">
        <p className="chip inline-flex rounded-full px-3 py-1 text-xs font-semibold">Authentication Hub</p>
        <h1 className="text-main mt-4 text-3xl font-semibold leading-tight">Secure access for your SaaS platform</h1>
        <p className="text-muted-ui mt-3 text-sm">
          Token rotation, account lockout, RBAC controls, and audit logging are enabled by design.
        </p>
      </div>
      <form className="panel space-y-4 rounded-3xl p-7" onSubmit={onSubmit}>
        <h2 className="text-main text-2xl font-semibold">Welcome back</h2>
        <p className="text-muted-ui text-sm">Sign in to continue to your security dashboard.</p>
        <input
          className="field"
          placeholder="Email address"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type={showPassword ? "text" : "password"}
          className="field"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <label className="text-muted-ui flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showPassword}
            onChange={() => setShowPassword((v) => !v)}
          />
          Show password
        </label>
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        <button className="btn btn-primary w-full" type="submit" disabled={submitting}>
          {submitting ? "Signing in..." : "Sign in"}
        </button>
        <Link className="block text-center text-sm text-indigo-200 hover:text-indigo-100" to="/signup">
          Create a new account
        </Link>
      </form>
    </section>
  );
}
