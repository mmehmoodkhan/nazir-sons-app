import { useState, useRef, useEffect } from "react";
import "./LoginModal.css"; // reuse existing modal styles
import "./EmailVerificationModal.css";

export default function EmailVerificationModal({ email, onClose, onVerified }) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef([]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // digits only
    const updated = [...code];
    updated[index] = value;
    setCode(updated);
    setError("");

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter") handleSubmit();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const updated = [...code];
    pasted.split("").forEach((char, i) => {
      updated[i] = char;
    });
    setCode(updated);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleSubmit = async () => {
    const fullCode = code.join("");
    if (fullCode.length < 6) {
      setError("Enter all 6 digits.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: fullCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid code. Try again.");
        return;
      }

      setSuccess("Email verified!");
      setTimeout(() => {
        onVerified?.(data.user);
        onClose();
      }, 800);
    } catch {
      setError("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setResending(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Could not resend. Try again.");
        return;
      }

      setSuccess("A new code was sent.");
      setCountdown(60);
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch {
      setError("Server error. Try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="login_mode_main">
        <div className="modal-box">
          <div className="admin_login">
            {/* Header */}
            <div className="verification-header">
              <div className="verification-icon">✉</div>
              <h2 className="verification-title">Check your email</h2>
              <p className="verification-subtitle">
                We sent a 6-digit code to <strong>{email}</strong>
              </p>
            </div>

            {/* Code inputs */}
            <div className="code-inputs" onPaste={handlePaste}>
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  className={`code-box ${digit ? "code-box--filled" : ""} ${error ? "code-box--error" : ""}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  autoFocus={i === 0}
                />
              ))}
            </div>

            {/* Feedback */}
            {error && <p className="verification-error">{error}</p>}
            {success && <p className="verification-success">{success}</p>}

            {/* Verify button */}
            <button
              onClick={handleSubmit}
              disabled={loading || !!success}
              className="loged_btn"
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>

            {/* Resend */}
            <div className="resend-row">
              <span className="resend-label">Didn't receive a code?</span>
              <button
                className={`resend-btn ${countdown > 0 ? "resend-btn--disabled" : ""}`}
                onClick={handleResend}
                disabled={countdown > 0 || resending}
              >
                {resending
                  ? "Sending..."
                  : countdown > 0
                    ? `Resend in ${countdown}s`
                    : "Resend code"}
              </button>
            </div>

            <button onClick={onClose} className="cancel_btn">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
