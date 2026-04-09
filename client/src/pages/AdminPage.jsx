import { useEffect, useState } from "react";
import { useAuthState } from "../hooks/useAuth";
import { api } from "../services/api";

export default function AdminPage() {
  const { auth } = useAuthState();
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const headers = { Authorization: `Bearer ${auth.accessToken}` };

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const csrf = await api.get("/api/csrf-token", { headers });
      const csrfHeader = { ...headers, "csrf-token": csrf.data.csrfToken };
      const [usersRes, logsRes] = await Promise.all([
        api.get("/api/admin/users", { headers: csrfHeader }),
        api.get("/api/admin/logs", { headers: csrfHeader })
      ]);
      setUsers(usersRes.data);
      setLogs(logsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const changeRole = async (userId, role) => {
    const csrf = await api.get("/api/csrf-token", { headers });
    await api.patch(`/api/admin/users/${userId}/role`, { role }, { headers: { ...headers, "csrf-token": csrf.data.csrfToken } });
    await load();
  };

  const unlock = async (userId) => {
    const csrf = await api.get("/api/csrf-token", { headers });
    await api.patch(`/api/admin/users/${userId}/unlock`, {}, { headers: { ...headers, "csrf-token": csrf.data.csrfToken } });
    await load();
  };

  useEffect(() => {
    if (auth.accessToken) {
      load();
    }
  }, [auth.accessToken]);

  return (
    <div className="space-y-5">
      {error ? (
        <div className="panel rounded-2xl border border-rose-500/40 p-4 text-rose-200">
          {error}
        </div>
      ) : null}

      <div className="panel rounded-3xl p-5">
        <h2 className="mb-4 text-lg font-semibold text-white">Users</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400">
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4">Role</th>
                <th className="pb-3 pr-4">Failed Attempts</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-white/10 text-slate-200">
                  <td className="py-3 pr-4">{u.email}</td>
                  <td className="py-3 pr-4">{u.role}</td>
                  <td className="py-3 pr-4">{u.failedLoginAttempts}</td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-2">
                      <button className="btn btn-primary text-xs" onClick={() => changeRole(u.id, "MODERATOR")}>
                        Make MODERATOR
                      </button>
                      <button className="btn btn-secondary text-xs" onClick={() => changeRole(u.id, "USER")}>
                        Make USER
                      </button>
                      <button className="btn btn-danger text-xs" onClick={() => unlock(u.id)}>
                        Unlock
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!users.length && !loading ? (
            <p className="py-8 text-sm text-slate-400">No user records found.</p>
          ) : null}
          {loading ? <p className="py-5 text-sm text-slate-300">Loading users...</p> : null}
        </div>
      </div>

      <div className="panel rounded-3xl p-5">
        <h2 className="mb-4 text-lg font-semibold text-white">Audit Logs</h2>
        <div className="max-h-[420px] space-y-2 overflow-y-auto pr-2 text-sm">
          {logs.map((l) => (
            <div key={l.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-slate-200">
              <p className="font-medium text-indigo-200">{l.action}</p>
              <p className="mt-1 text-slate-300">
                {l.ipAddress || "n/a"} | {new Date(l.createdAt).toLocaleString()}
              </p>
              {l.details ? <p className="mt-1 text-slate-400">{l.details}</p> : null}
            </div>
          ))}
          {!logs.length && !loading ? (
            <p className="py-6 text-sm text-slate-400">No audit events available.</p>
          ) : null}
          {loading ? <p className="py-2 text-sm text-slate-300">Loading logs...</p> : null}
        </div>
      </div>
    </div>
  );
}
