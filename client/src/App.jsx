import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import { useAuthState } from "./hooks/useAuth";
import AdminPage from "./pages/AdminPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";

function Protected({ children }) {
  const { auth } = useAuthState();
  return auth.user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/" element={<Protected><HomePage /></Protected>} />
        <Route path="/admin" element={<Protected><AdminPage /></Protected>} />
      </Routes>
    </Layout>
  );
}
