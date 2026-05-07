// src/components/LoginModal.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
export default function LoginModal({ onClose, onSuccess }) {
  const { login } = useCart();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email || !password) {
      setError("Fill all fields.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const endpoint =
        mode === "login" ? "/api/auth/login" : "/api/auth/register";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong.");
        return;
      }

      console.log("Logged in user:", data.user);
      login(data.user);
      onClose();
      navigate("/");
      onSuccess(data.user); // ← navigate to checkout
    } catch (err) {
      setError("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box">
        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          <button
            className="btn-ghost"
            onClick={() => setMode("login")}
            style={{ flex: 1, fontWeight: mode === "login" ? 700 : 400 }}
          >
            Login
          </button>
          <button
            className="btn-ghost"
            onClick={() => setMode("signup")}
            style={{ flex: 1, fontWeight: mode === "signup" ? 700 : 400 }}
          >
            Sign Up
          </button>
        </div>

        {/* Fields */}
        {mode === "signup" && (
          <input
            className="input-field"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}
        <input
          className="input-field"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="input-field"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button onClick={handleSubmit} disabled={loading}>
          {loading
            ? "Please wait..."
            : mode === "login"
              ? "Login"
              : "Create Account"}
        </button>

        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
