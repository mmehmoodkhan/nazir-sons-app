import { useEffect, useState } from "react";
import "./AdminOrders.css";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const STATUS_COLORS = {
  pending: "badge-pending",
  confirmed: "badge-confirmed",
  delivered: "badge-delivered",
  cancelled: "badge-cancelled",
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/order/all");
      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };
  //  auto refresh order page
  useEffect(() => {
    fetchOrders();
    // const interval = setInterval(fetchOrders, 30000);
    // return () => clearInterval(interval);
  }, []);

  const updateStatus = async (orderId, status) => {
    await fetch(`/api/order/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchOrders();
  };

  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  // if (loading) return <p className="ao-loading">Loading orders...</p>;

  return (
    <div className="ao-wrapper">
      <div className="sidebar_hide">
        <Sidebar />
      </div>
      <div className="admin_outer">
        <div className="db_topbar">
          <Navbar title="Orders" />
        </div>

        <div className="ao_main_inner">
          {/* ── Header */}
          <div className="ao-header">
            <h2 className="ao-title">
              Orders
              <span className="ao-count">{orders.length} total</span>
            </h2>
            <button className="ao-btn-refresh" onClick={fetchOrders}>
              ↻ Refresh
            </button>
          </div>

          {/* ── Filter tabs */}
          <div className="ao-filters">
            {["all", "pending", "confirmed", "delivered", "cancelled"].map(
              (f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`ao-filter-btn ${filter === f ? "active" : ""}`}
                >
                  {f}
                  {f !== "all" && (
                    <span className="ao-filter-count">
                      {orders.filter((o) => o.status === f).length}
                    </span>
                  )}
                </button>
              ),
            )}
          </div>

          {/* ── Orders */}
          {filtered.length === 0 ? (
            <p className="ao-empty">No orders found.</p>
          ) : (
            filtered.map((order) => (
              <div key={order.orderId} className="ao-card">
                {/* Card header */}
                <div className="ao-card-header">
                  <div>
                    <div className="ao-order-id">{order.orderId}</div>
                    <div className="ao-order-time">
                      {new Date(order.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <span
                    className={`ao-badge ${STATUS_COLORS[order.status] || "badge-pending"}`}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Info grid */}
                <div className="ao-info-grid">
                  <div className="ao-info-block">
                    <label>Customer</label>
                    <p>
                      {order.customer?.firstName} {order.customer?.lastName}
                    </p>
                    <p className="muted">{order.customer?.phone}</p>
                    <p className="muted">{order.customer?.email}</p>
                  </div>

                  <div className="ao-info-block">
                    <label>Delivery address</label>
                    <p>{order.delivery?.address}</p>
                    <p className="muted">
                      {order.delivery?.area}, {order.delivery?.city}
                    </p>
                  </div>

                  <div className="ao-info-block">
                    <label>Payment</label>
                    <p className="uppercase">{order.paymentMethod}</p>
                    <p className="muted capitalize">{order.paymentStatus}</p>
                  </div>

                  {/* ── Delivery slot */}
                  <div className="ao-info-block">
                    <label>Delivery slot</label>
                    {order.deliverySlot ? (
                      <>
                        <p>{order.deliverySlot.dateLabel}</p>
                        <p className="muted">{order.deliverySlot.time}</p>
                        <span
                          className={`ao-slot-pill ${order.deliverySlot.type === "express" ? "slot-express" : "slot-free"}`}
                        >
                          {order.deliverySlot.type === "express"
                            ? "⚡ Express"
                            : "✓ Free"}
                        </span>
                      </>
                    ) : (
                      <p className="muted">Not selected</p>
                    )}
                  </div>

                  <div className="ao-info-block">
                    <label>Total</label>
                    <p className="ao-total">
                      Rs {order.totalPrice?.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div className="ao-items">
                  <div className="ao-items-label">
                    Items ({order.items?.length})
                  </div>
                  {order.items?.map((item, i) => (
                    <div key={i} className="ao-item-row">
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <span className="ao-item-price">
                        Rs {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Status update */}
                <div className="ao-status-row">
                  <span className="ao-status-label">Update status:</span>
                  {["pending", "confirmed", "delivered", "cancelled"].map(
                    (s) => (
                      <button
                        key={s}
                        onClick={() => updateStatus(order.orderId, s)}
                        disabled={order.status === s}
                        className={`ao-status-btn ${order.status === s ? "current" : ""}`}
                      >
                        {s}
                      </button>
                    ),
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
