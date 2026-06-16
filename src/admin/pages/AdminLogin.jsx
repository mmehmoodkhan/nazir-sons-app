import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../pages/AdminLogin.css";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }

      // save token and role
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminRole", data.role);

      navigate("/admin/dashboard"); //   redirect after login
    } catch (err) {
      setError("Server error. Try again.");
      setLoading(false);
    }
  };

  return (
    <div className="admin_login_wrapper">
      <div className="admin_login_left">
        <div className="admin_logo">
          <img src="../images/logo_transparent.png" alt="logo" />
        </div>
        <h2 className="heading_admin">Welcome back</h2>
        <p>Sign in to your admin dashboard</p>
      </div>
      <div className="admin_login_right">
        <form onSubmit={handleSubmit}>
          {" "}
          {/*   added onSubmit */}
          {error && <p className="error-msg">{error}</p>}{" "}
          {/*   error message */}
          <div className="input-group">
            <label>Email</label>
            <input
              className="input-field"
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)} //   controlled
              required
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input
              className="input-field"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} //   controlled
              required
            />
          </div>
          <button className="admin_login_btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign in as Admin"}{" "}
            {/*  loading state */}
          </button>
        </form>
      </div>
    </div>
  );
}
