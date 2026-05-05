// src/components/LoginModal.jsx
import { useState } from "react";
import { useAuth } from "../../context/CartContext";

export default function LoginModal({ onClose, onSuccess }) {
  const { login } = useAuth();
  const [mode, setMode] = useState("login");           // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email || !password) { setError("Fill all fields."); return; }
    setLoading(true); setError("");

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();

      if (!res.ok) { setError(data.message || "Something went wrong."); return; }

      login(data.user);                                // ← save user in context
      onSuccess();                                     // ← navigate to checkout

    } catch (err) {
      setError("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          <button
            onClick={() => setMode("login")}
            style={{ flex: 1, fontWeight: mode === "login" ? 700 : 400 }}
          >
            Login
          </button>
          <button
            onClick={() => setMode("signup")}
            style={{ flex: 1, fontWeight: mode === "signup" ? 700 : 400 }}
          >
            Sign Up
          </button>
        </div>

        {/* Fields */}
        {mode === "signup" && (
          <input
            placeholder="Full Name"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
        />

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button onClick={handleSubmit} disabled={loading}>
          {loading ? "Please wait..." : mode === "login" ? "Login" : "Create Account"}
        </button>

        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}