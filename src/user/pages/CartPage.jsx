// ─── Inline Styles & Fonts ───────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href =
  "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500&display=swap";
document.head.appendChild(fontLink);

const theme = {
  bg: "#0d0d0d",
  surface: "#161616",
  card: "#1c1c1c",
  border: "#2a2a2a",
  accent: "#e8c96d",
  accentDim: "#b89a45",
  text: "#f0ece4",
  muted: "#7a7570",
  danger: "#e05c5c",
};
const css = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${theme.bg}; color: ${theme.text}; font-family: 'DM Sans', sans-serif; }
  
  .badge {
    background: ${theme.accent};
    color: #000;
    border-radius: 50%;
    width: 18px; height: 18px;
    font-size: 10px;
    font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    position: absolute;
    top: -6px; right: -6px;
  }

  .product-card {
    background: ${theme.card};
    border: 1px solid ${theme.border};
    border-radius: 12px;
    overflow: hidden;
    transition: transform 0.2s, border-color 0.2s;
  }
  .product-card:hover {
    transform: translateY(-4px);
    border-color: ${theme.accent}55;
  }

  .btn-primary {
    background: ${theme.accent};
    color: #000;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s, transform 0.1s;
    width: 100%;
    font-size: 14px;
  }
  .btn-primary:hover { background: ${theme.accentDim}; transform: scale(0.99); }
  .btn-primary:disabled { background: ${theme.border}; color: ${theme.muted}; cursor: not-allowed; }

  .btn-ghost {
    background: transparent;
    color: ${theme.text};
    border: 1px solid ${theme.border};
    padding: 10px 20px;
    border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: border-color 0.2s;
    font-size: 14px;
  }
  .btn-ghost:hover { border-color: ${theme.accent}; color: ${theme.accent}; }

  .input-field {
    background: ${theme.surface};
    border: 1px solid ${theme.border};
    color: ${theme.text};
    padding: 12px 16px;
    border-radius: 8px;
    width: 100%;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;
  }
  .input-field:focus { border-color: ${theme.accent}; }
  .input-field::placeholder { color: ${theme.muted}; }

  .modal-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.75);
    display: flex; align-items: center; justify-content: center;
    z-index: 100;
    backdrop-filter: blur(4px);
    animation: fadeIn 0.2s ease;
  }
  .modal-box {
    background: ${theme.card};
    border: 1px solid ${theme.border};
    border-radius: 16px;
    padding: 40px;
    width: 100%;
    max-width: 420px;
    animation: slideUp 0.25s ease;
  }

  .cart-item {
    display: flex; align-items: center; gap: 16px;
    padding: 16px 0;
    border-bottom: 1px solid ${theme.border};
  }
  .cart-item:last-child { border-bottom: none; }

  .qty-btn {
    width: 28px; height: 28px;
    border-radius: 50%;
    border: 1px solid ${theme.border};
    background: ${theme.surface};
    color: ${theme.text};
    cursor: pointer;
    font-size: 16px;
    display: flex; align-items: center; justify-content: center;
    transition: border-color 0.2s;
  }
  .qty-btn:hover { border-color: ${theme.accent}; color: ${theme.accent}; }

  .tag {
    background: ${theme.surface};
    border: 1px solid ${theme.border};
    border-radius: 6px;
    padding: 2px 8px;
    font-size: 11px;
    color: ${theme.muted};
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .nav-tab {
    padding: 8px 18px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s;
    border: 1px solid transparent;
  }
  .nav-tab.active {
    background: ${theme.accent};
    color: #000;
  }
  .nav-tab:not(.active):hover {
    border-color: ${theme.border};
  }

  .success-banner {
    background: #1a3a2a;
    border: 1px solid #2d6647;
    color: #6fcf97;
    padding: 12px 20px;
    border-radius: 10px;
    font-size: 14px;
    text-align: center;
  }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }
  .pulse { animation: pulse 0.3s ease; }
`;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
// import { useAuth } from "../../context/AuthContext";
export default function CartPage({ onCheckout }) {
  const { cart = [], setCart } = useCart();
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState(null);
  const handleCheckout = () => {
    if (user) {
      navigate("/checkout"); // ← already logged in
    } else {
      setShowLogin(true); // ← not logged in, show modal
    }
  };
  const handleLoginSuccess = async (loggedInUser) => {
    setUser(loggedInUser);
    setShowLogin(false);
    // Merge local cart with server (mirrors mergeCart.jsx)
    await mergeCartWithServer(loggedInUser.userId, cart);
    setCart([]);
    setPage("success");
  };

  const updateQty = (id, delta) => {
    const next = cart
      .map((item) =>
        item._id === id ? { ...item, quantity: item.quantity + delta } : item,
      )
      .filter((item) => item.quantity > 0);
    setCart(next);
    localStorage.setItem("cart", JSON.stringify(next));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (!cart) return null; // or a loading spinner
  if (cart.length === 0) {
    return (
      <div style={{ textAlign: "center", paddingTop: 80 }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>🛒</div>
        <h3
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 24,
            marginBottom: 10,
          }}
        >
          Your cart is empty
        </h3>
        <p style={{ color: theme.muted, fontSize: 14 }}>
          Add some items from the shop to get started.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <h2
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 28,
          marginBottom: 28,
        }}
      >
        Your Cart{" "}
        <span style={{ color: theme.muted, fontSize: 18 }}>
          ({cart.length} item{cart.length !== 1 ? "s" : ""})
        </span>
      </h2>

      <div
        style={{
          background: theme.card,
          border: `1px solid ${theme.border}`,
          borderRadius: 12,
          padding: "8px 24px",
          marginBottom: 24,
        }}
      >
        {cart.map((item) => (
          <div key={item._id} className="cart-item">
            <div style={{ fontSize: 36 }}>{item.image}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, marginBottom: 2 }}>
                {item.name}
              </div>
              <div style={{ color: theme.muted, fontSize: 12 }}>
                {item.category}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button
                className="qty-btn"
                onClick={() => updateQty(item._id, -1)}
              >
                −
              </button>
              <span
                style={{ minWidth: 20, textAlign: "center", fontWeight: 500 }}
              >
                {item.quantity}
              </span>
              <button
                className="qty-btn"
                onClick={() => updateQty(item._id, +1)}
              >
                +
              </button>
            </div>
            <div style={{ minWidth: 70, textAlign: "right" }}>
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: theme.accent,
                }}
              >
                ${(item.price * item.quantity).toFixed(2)}
              </div>
              <div style={{ color: theme.muted, fontSize: 11 }}>
                ${item.price} ea
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          background: theme.card,
          border: `1px solid ${theme.border}`,
          borderRadius: 12,
          padding: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 8,
            color: theme.muted,
            fontSize: 14,
          }}
        >
          <span>Subtotal</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 8,
            color: theme.muted,
            fontSize: 14,
          }}
        >
          <span>Shipping</span>
          <span>Calculated at checkout</span>
        </div>
        <div
          style={{ height: 1, background: theme.border, margin: "16px 0" }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <span style={{ fontWeight: 500 }}>Total</span>
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 22,
              color: theme.accent,
            }}
          >
            ${total.toFixed(2)}
          </span>
        </div>
        <button
          className="btn-primary"
          onClick={handleCheckout}
          style={{ fontSize: 15, padding: "14px" }}
        >
          Proceed to Checkout →
        </button>
      </div>
      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSuccess={() => {
            setShowLogin(false);
            navigate("/checkout"); // ← after login, go checkout
          }}
        />
      )}
    </div>
  );
}

function LoginModal({ onClose, onSuccess }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email || !password) {
      setError("Please fill all fields.");
      return;
    }
    setError("");
    setLoading(true);
    // Simulate API call — replace with your actual auth endpoint
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    // On success, call onSuccess with the userId
    onSuccess({
      userId: "user_" + Date.now(),
      email,
      name: name || email.split("@")[0],
    });
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box">
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔐</div>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 26,
              marginBottom: 8,
            }}
          >
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h2>
          <p style={{ color: theme.muted, fontSize: 13 }}>
            {mode === "login"
              ? "Sign in to complete your purchase"
              : "Register to continue checkout"}
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {["login", "register"].map((m) => (
            <button
              key={m}
              className={`nav-tab ${mode === m ? "active" : ""}`}
              style={{ flex: 1 }}
              onClick={() => {
                setMode(m);
                setError("");
              }}
            >
              {m === "login" ? "Sign In" : "Register"}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {mode === "register" && (
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
            placeholder="Email address"
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
          {error && (
            <div style={{ color: theme.danger, fontSize: 12 }}>{error}</div>
          )}
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={loading}
            style={{ marginTop: 4, padding: "13px" }}
          >
            {loading
              ? "Please wait…"
              : mode === "login"
                ? "Sign In & Checkout"
                : "Create Account"}
          </button>
          <button className="btn-ghost" onClick={onClose}>
            Continue Shopping
          </button>
        </div>

        <p
          style={{
            textAlign: "center",
            color: theme.muted,
            fontSize: 11,
            marginTop: 20,
          }}
        >
          Your cart is saved. You won't lose anything.
        </p>
      </div>
    </div>
  );
}

function OrderSuccess({ user, onContinue }) {
  return (
    <div
      style={{
        textAlign: "center",
        paddingTop: 60,
        maxWidth: 420,
        margin: "0 auto",
      }}
    >
      <div style={{ fontSize: 64, marginBottom: 20 }}>✅</div>
      <h2
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 28,
          marginBottom: 12,
        }}
      >
        Order Placed!
      </h2>
      <p style={{ color: theme.muted, marginBottom: 24, lineHeight: 1.6 }}>
        Thanks, <strong style={{ color: theme.text }}>{user.name}</strong>! Your
        order has been confirmed. A confirmation will be sent to{" "}
        <strong style={{ color: theme.accent }}>{user.email}</strong>.
      </p>
      <div className="success-banner" style={{ marginBottom: 28 }}>
        🎉 Order #ORD-{Math.floor(Math.random() * 90000 + 10000)} confirmed
      </div>
      <button
        className="btn-primary"
        onClick={onContinue}
        style={{ padding: "13px" }}
      >
        Continue Shopping
      </button>
    </div>
  );
}
