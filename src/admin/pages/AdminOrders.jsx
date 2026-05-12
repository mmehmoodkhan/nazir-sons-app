// src/admin/pages/AdminOrders.jsx
import { useEffect, useState } from "react";

const STATUS_COLORS = {
  pending:   { bg: "#fffbeb", color: "#92400e", border: "#fcd34d" },
  confirmed: { bg: "#eff6ff", color: "#1e40af", border: "#93c5fd" },
  delivered: { bg: "#f0fff4", color: "#065f46", border: "#6ee7b7" },
  cancelled: { bg: "#fff1f2", color: "#9f1239", border: "#fda4af" },
};

const AdminOrders = () => {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("all");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/order/all");
      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ auto-refresh every 30 seconds to catch new orders
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (orderId, status) => {
    await fetch(`/api/order/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchOrders(); // refresh list
  };

  const filtered = filter === "all"
    ? orders
    : orders.filter((o) => o.status === filter);

  if (loading) return <p style={{ padding: 24 }}>Loading orders...</p>;

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>Orders ({orders.length})</h2>
        <button
          onClick={fetchOrders}
          style={{
            padding: "8px 16px", background: "#3b82f6", color: "#fff",
            border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13,
          }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {["all", "pending", "confirmed", "delivered", "cancelled"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "6px 16px", borderRadius: 20, border: "1px solid #e2e8f0",
              background: filter === f ? "#1a202c" : "#fff",
              color:      filter === f ? "#fff"    : "#444",
              cursor: "pointer", fontSize: 13, textTransform: "capitalize",
            }}
          >
            {f} {f !== "all" && `(${orders.filter(o => o.status === f).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p style={{ color: "#888" }}>No orders found.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {filtered.map((order) => {
            const s = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
            return (
              <div key={order.orderId} style={{
                border: "1px solid #e2e8f0", borderRadius: 12,
                padding: 20, background: "#fff",
              }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{order.orderId}</span>
                    <span style={{ marginLeft: 12, color: "#888", fontSize: 12 }}>
                      {new Date(order.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <span style={{
                    padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 500,
                    background: s.bg, color: s.color, border: `1px solid ${s.border}`,
                    textTransform: "capitalize",
                  }}>
                    {order.status}
                  </span>
                </div>

                {/* Customer */}
                <div style={{ marginTop: 12, display: "flex", gap: 24, flexWrap: "wrap" }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 12, color: "#888" }}>Customer</p>
                    <p style={{ margin: 0, fontWeight: 500 }}>
                      {order.customer?.firstName} {order.customer?.lastName}
                    </p>
                    <p style={{ margin: 0, fontSize: 13, color: "#666" }}>{order.customer?.phone}</p>
                    <p style={{ margin: 0, fontSize: 13, color: "#666" }}>{order.customer?.email}</p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 12, color: "#888" }}>Delivery Address</p>
                    <p style={{ margin: 0, fontWeight: 500 }}>{order.delivery?.address}</p>
                    <p style={{ margin: 0, fontSize: 13, color: "#666" }}>
                      {order.delivery?.area}, {order.delivery?.city}
                    </p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 12, color: "#888" }}>Payment</p>
                    <p style={{ margin: 0, fontWeight: 500, textTransform: "uppercase" }}>
                      {order.paymentMethod}
                    </p>
                    <p style={{ margin: 0, fontSize: 13, color: "#666", textTransform: "capitalize" }}>
                      {order.paymentStatus}
                    </p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 12, color: "#888" }}>Total</p>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 16 }}>
                      Rs {order.totalPrice?.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div style={{ marginTop: 12 }}>
                  <p style={{ margin: "0 0 6px", fontSize: 12, color: "#888" }}>
                    Items ({order.items?.length})
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {order.items?.map((item, i) => (
                      <div key={i} style={{
                        display: "flex", justifyContent: "space-between",
                        fontSize: 13, padding: "4px 0",
                        borderBottom: "1px solid #f1f5f9",
                      }}>
                        <span>{item.name} × {item.quantity}</span>
                        <span>Rs {(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Update status */}
                <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 13, color: "#888", alignSelf: "center" }}>
                    Update status:
                  </span>
                  {["pending", "confirmed", "delivered", "cancelled"].map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(order.orderId, s)}
                      disabled={order.status === s}
                      style={{
                        padding: "5px 14px", borderRadius: 6, fontSize: 12,
                        border: "1px solid #e2e8f0", cursor: "pointer",
                        textTransform: "capitalize",
                        background: order.status === s ? "#1a202c" : "#f8fafc",
                        color:      order.status === s ? "#fff"    : "#444",
                        opacity:    order.status === s ? 0.6       : 1,
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;