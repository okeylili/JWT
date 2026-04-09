import { Link, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";

export default function App() {
  return (
    <div className="min-h-screen">
      <nav className="bg-slate-900 p-4 text-white">
        <div className="mx-auto flex max-w-5xl gap-4">
          <Link to="/">Login</Link>
          <Link to="/signup">Signup</Link>
          <Link to="/admin">Admin</Link>
        </div>
      </nav>
      <main className="mx-auto max-w-5xl p-4">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
    </div>
  );
}
