import "./LoginModal.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import EmailVerificationModal from "../components/EmailVerificationModal";
import { GoogleLogin } from "@react-oauth/google";
export default function LoginModal({ onClose, onSuccess }) {
  const { login } = useCart();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showVerify, setShowVerify] = useState(false);

  // Inside your modal JSX, replace the old button with:

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

      if (mode === "signup") {
        // Show verification modal instead of closing
        setShowVerify(true);
        return;
      }

      // Login flow
      localStorage.setItem("token", data.token);
      login(data.user);
      onClose();
      navigate("/");

    } catch (err) {
      console.error("Full error:", err);
      setError("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show verification modal after signup
  if (showVerify) {
    return (
      <EmailVerificationModal
        email={email}
        onClose={onClose}
        onVerified={(user) => {
          login(user);
          onClose();
          navigate("/");
          if (typeof onSuccess === "function") {
            onSuccess(user);
          }
        }}
      />
    );
  }

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="login_mode_main">
        <div className="modal-box">
          <div className="admin_login">
            {/* Tabs */}
            <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
              <button
                className="loged_btn"
                onClick={() => setMode("login")}
                style={{ flex: 1, fontWeight: mode === "login" ? 700 : 400 }}
              >
                Login
              </button>
              <button
                className="loged_btn"
                onClick={() => setMode("signup")}
                style={{ flex: 1, fontWeight: mode === "signup" ? 700 : 400 }}
              >
                Sign Up
              </button>
            </div>

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

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="loged_btn"
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                  ? "Login"
                  : "Create Account"}
            </button>

            {/*  Divider */}
            <div
              style={{ textAlign: "center", margin: "12px 0", color: "#999" }}
            >
              or
            </div>

            {/* Google Login Button — NOW INSIDE RETURN */}
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                console.log(credentialResponse);
                try {
                  const res = await fetch("/api/auth/google", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      token: credentialResponse.credential,
                    }),
                  });

                  const data = await res.json();

                  if (!res.ok) {
                    setError(data.message || "Google login failed.");
                    return;
                  }

                  localStorage.setItem("token", data.token);
                  login(data.user);
                  onClose();
                  navigate("/");
                  onSuccess?.(data.user);
                } catch {
                  setError("Server error. Try again.");
                }
              }}
              onError={() => setError("Google login failed.")}
              width="100%"
              text="continue_with"
              shape="rectangular"
              theme="outline"
            />

            <button onClick={onClose} className="cancel_btn not_login">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
