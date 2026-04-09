import { useState } from "react";
import api from "../lib/api";

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [message, setMessage] = useState("");

  async function loadData() {
    try {
      const token = localStorage.getItem("accessToken");
      const headers = { Authorization: `Bearer ${token}` };
      const [usersRes, logsRes] = await Promise.all([
        api.get("/api/admin/users", { headers }),
        api.get("/api/admin/audit-logs", { headers })
      ]);
      setUsers(usersRes.data);
      setLogs(logsRes.data.slice(0, 20));
      setMessage("Loaded admin data");
    } catch (err) {
      setMessage(err.response?.data?.error || "Admin load failed");
    }
  }

  return (
    <div className="space-y-4">
      <button className="rounded bg-slate-900 px-3 py-2 text-white" onClick={loadData}>
        Load Users & Logs
      </button>
      <p>{message}</p>
      <section className="rounded bg-white p-4 shadow">
        <h2 className="font-semibold">Users</h2>
        <pre className="overflow-auto text-xs">{JSON.stringify(users, null, 2)}</pre>
      </section>
      <section className="rounded bg-white p-4 shadow">
        <h2 className="font-semibold">Audit Logs</h2>
        <pre className="overflow-auto text-xs">{JSON.stringify(logs, null, 2)}</pre>
      </section>
    </div>
  );
}
