import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./ResetPassword.css";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const emailParam = searchParams.get("email") || "";
    const tokenParam = searchParams.get("token") || "";
    setEmail(emailParam);
    setToken(tokenParam);
  }, [searchParams]);

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!email || !token || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Could not reset your password.");
        return;
      }

      setSuccess(data.message || "Your password has been reset.");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/");
      }, 2200);
    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-page">
      <div className="reset-password-card">
        <h2>Reset Password</h2>
        <p className="reset-password-note">
          Enter the email address linked to your account and choose a new
          password.
        </p>

        <label>Email</label>
        <input
          className="reset-input"
          type="email"
          placeholder="your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Reset token</label>
        <input
          className="reset-input"
          type="text"
          placeholder="Reset token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />

        <label>New password</label>
        <input
          className="reset-input"
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label>Confirm new password</label>
        <input
          className="reset-input"
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />

        {error && <div className="reset-password-error">{error}</div>}
        {success && <div className="reset-password-success">{success}</div>}

        <button
          className="reset-password-btn"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </div>
    </div>
  );
}
