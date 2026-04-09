import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthState } from "../hooks/useAuth";

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuthState();
  const [form, setForm] = useState({ email: "", name: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const passwordRules = [
    { label: "12+ characters", test: form.password.length >= 12 },
    { label: "Uppercase letter", test: /[A-Z]/.test(form.password) },
    { label: "Lowercase letter", test: /[a-z]/.test(form.password) },
    { label: "Number", test: /\d/.test(form.password) },
    { label: "Special character", test: /[^A-Za-z\d]/.test(form.password) }
  ];

  const isStrongPassword = passwordRules.every((rule) => rule.test);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isStrongPassword) {
      setError("Please create a stronger password that matches all requirements.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await signup(form);
      navigate("/login");
    } catch (err) {
      if (err.code === "ERR_NETWORK") {
        setError("Cannot reach backend server. Please start server + database + redis.");
      } else {
        setError(err.response?.data?.message || "Signup failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-xl">
      <form className="panel space-y-4 rounded-3xl p-7" onSubmit={onSubmit}>
        <h1 className="text-main text-2xl font-semibold">Create your account</h1>
        <p className="text-muted-ui text-sm">Start with a secure identity and role-ready access profile.</p>
        <input
          className="field"
          placeholder="Full name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="field"
          placeholder="Email address"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type={showPassword ? "text" : "password"}
          className="field"
          placeholder="Password (12+ chars)"
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
        <div className="text-muted-ui rounded-xl border border-white/10 bg-white/5 p-3 text-xs">
          <p className="text-main mb-2 font-medium">Password requirements:</p>
          <ul className="space-y-1">
            {passwordRules.map((rule) => (
              <li key={rule.label} className={rule.test ? "text-emerald-300" : "text-slate-300"}>
                {rule.test ? "✓" : "•"} {rule.label}
              </li>
            ))}
          </ul>
        </div>
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        <button className="btn btn-primary w-full" type="submit" disabled={submitting}>
          {submitting ? "Creating account..." : "Create account"}
        </button>
        <Link className="block text-center text-sm text-indigo-200 hover:text-indigo-100" to="/login">
          Already have an account?
        </Link>
      </form>
    </section>
  );
}
