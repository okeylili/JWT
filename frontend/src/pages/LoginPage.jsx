import { useState } from "react";
import api from "../lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    try {
      const res = await api.post("/api/auth/login", { email, password });
      localStorage.setItem("accessToken", res.data.accessToken);
      setResult("Login successful");
    } catch (err) {
      setResult(err.response?.data?.error || "Login failed");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded bg-white p-4 shadow">
      <h1 className="text-xl font-semibold">Login</h1>
      <input className="w-full rounded border p-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input
        className="w-full rounded border p-2"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="rounded bg-slate-900 px-3 py-2 text-white" type="submit">
        Login
      </button>
      <p>{result}</p>
    </form>
  );
}
