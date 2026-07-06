// src/pages/OrderSuccess.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const OrderSuccess = () => {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const [count, setCount] = useState(20);

  // auto redirect to home after 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev === 1) {
          clearInterval(timer);
          navigate("/");
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", flexDirection: "column", gap: 16,
      fontFamily: "sans-serif", textAlign: "center", padding: 24,
    }}>
      {/* Success icon */}
      <div style={{
        width: 80, height: 80, borderRadius: "50%",
        background: "#f0fff4", border: "2px solid #38a169",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 36,
      }}>
        ✓
      </div>

      <h2 style={{ fontSize: 26, margin: 0 }}>Order Placed!</h2>
      <p style={{ color: "#666", margin: 0 }}>
        Thank you <strong>{state?.name}</strong>! Your order has been received.
      </p>

      <div style={{
        background: "#f7fafc", border: "1px solid #e2e8f0",
        borderRadius: 10, padding: "16px 32px", marginTop: 8,
      }}>
        <p style={{ margin: 0, fontSize: 13, color: "#888" }}>Order ID</p>
        <p style={{ margin: 0, fontWeight: 600, fontSize: 16 }}>
          {state?.orderId}
        </p>
      </div>

      <div style={{
        background: "#fffbeb", border: "1px solid #f6e05e",
        borderRadius: 10, padding: "12px 24px", marginTop: 4,
      }}>
        <p style={{ margin: 0, fontSize: 14, color: "#744210" }}>
          💵 Payment: <strong>Cash on Delivery</strong>
        </p>
        <p style={{ margin: 0, fontSize: 13, color: "#888", marginTop: 4 }}>
          Please keep exact change ready at delivery.
        </p>
      </div>

      <p style={{ color: "#888", fontSize: 13 }}>
        Redirecting to home in <strong>{count}</strong> seconds...
      </p>

      <button
        onClick={() => navigate("/")}
        style={{
          padding: "12px 32px", background: "#38a169", color: "#fff",
          border: "none", borderRadius: 8, fontSize: 15, cursor: "pointer",
        }}
      >
        Continue Shopping
      </button>
    </div>
  );
};

export default OrderSuccess;