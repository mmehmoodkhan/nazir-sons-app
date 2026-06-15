import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import "./ProfilePage.css";
import Header from "../components/header";

const TABS = ["Account", "Edit Profile", "Address", "Orders", "Payment"];

export default function ProfilePage() {
  const { user, logout, login, clearCart } = useCart();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Account");

  // Edit Profile state
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [editLoading, setEditLoading] = useState(false);
  const [editMsg, setEditMsg] = useState("");

  // Address state
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });
  const [addressMsg, setAddressMsg] = useState("");

  // Orders state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Payment state
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === "Orders") fetchOrders();
  }, [activeTab]);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/order/my-orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrders(data.orders || []);
    } catch {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleEditProfile = async () => {
    setEditLoading(true);
    setEditMsg("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/auth/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditMsg(data.message || "Update failed.");
        return;
      }
      setEditMsg("Profile updated successfully!");
      login(data.user);
    } catch {
      setEditMsg("Server error.");
    } finally {
      setEditLoading(false);
    }
  };
  const handleAddressSave = () => {
    localStorage.setItem("userAddress", JSON.stringify(address));
    setAddressMsg("Address saved!");
    setTimeout(() => setAddressMsg(""), 2000);
  };

  useEffect(() => {
    const saved = localStorage.getItem("userAddress");
    if (saved) setAddress(JSON.parse(saved));
  }, []);

  const handleLogout = () => {
    clearCart(); // empty the cart
    logout(); // clear user from context
    localStorage.removeItem("user"); // clear stored user
    localStorage.removeItem("cart"); // clear stored cart
    navigate("/");
  };

  return (
    <>
      <Header />

      <div className="profile-page">
        {/* Sidebar */}
        <aside className="profile-sidebar">
          <div className="profile-avatar">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <h3 className="profile-username">{user?.name || "User"}</h3>
          <p className="profile-email">{user?.email}</p>

          <nav className="profile-nav">
            {TABS.map((tab) => (
              <button
                key={tab}
                className={`profile-nav-btn ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "Account" && "👤 "}
                {tab === "Edit Profile" && "✏️ "}
                {tab === "Address" && "📍 "}
                {tab === "Orders" && "📦 "}
                {tab === "Payment" && "💳 "}
                {tab}
              </button>
            ))}
          </nav>

          <button className="profile-logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </aside>

        {/* Main Content */}
        <main className="profile-main">
          {/* ── Account ── */}
          {activeTab === "Account" && (
            <div className="profile-card">
              <h2 className="profile-card-title">Account Details</h2>
              <div className="profile-detail-row">
                <span className="profile-detail-label">Full Name</span>
                <span className="profile-detail-value">
                  {user?.name || "—"}
                </span>
              </div>
              <div className="profile-detail-row">
                <span className="profile-detail-label">Email</span>
                <span className="profile-detail-value">
                  {user?.email || "—"}
                </span>
              </div>
              <div className="profile-detail-row">
                <span className="profile-detail-label">Account Type</span>
                <span className="profile-detail-value">
                  {user?.provider === "google"
                    ? "🔵 Google"
                    : user?.provider === "facebook"
                      ? "🔷 Facebook"
                      : "📧 Email"}
                </span>
              </div>
              <div className="profile-detail-row">
                <span className="profile-detail-label">Verified</span>
                <span className="profile-detail-value">
                  {user?.isVerified ? "✅ Yes" : "❌ No"}
                </span>
              </div>
            </div>
          )}

          {/* ── Edit Profile ── */}
          {activeTab === "Edit Profile" && (
            <div className="profile-card">
              <h2 className="profile-card-title">Edit Profile</h2>
              <div className="profile-form-group">
                <label>Full Name</label>
                <input
                  className="profile-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                />
              </div>
              <div className="profile-form-group">
                <label>Email</label>
                <input
                  className="profile-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  type="email"
                />
              </div>
              {editMsg && (
                <p
                  className={
                    editMsg.includes("success")
                      ? "profile-success"
                      : "profile-error"
                  }
                >
                  {editMsg}
                </p>
              )}
              <button
                className="profile-save-btn"
                onClick={handleEditProfile}
                disabled={editLoading}
              >
                {editLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}

          {/* ── Address ── */}
          {activeTab === "Address" && (
            <div className="profile-card">
              <h2 className="profile-card-title">My Address</h2>
              {["street", "city", "state", "zip", "country"].map((field) => (
                <div className="profile-form-group" key={field}>
                  <label>
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  <input
                    className="profile-input"
                    value={address[field]}
                    onChange={(e) =>
                      setAddress({ ...address, [field]: e.target.value })
                    }
                    placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  />
                </div>
              ))}
              {addressMsg && <p className="profile-success">{addressMsg}</p>}
              <button className="profile-save-btn" onClick={handleAddressSave}>
                Save Address
              </button>
            </div>
          )}

          {/* ── Orders ── */}
          {activeTab === "Orders" && (
            <div className="profile-card">
              <h2 className="profile-card-title">Order History</h2>
              {ordersLoading ? (
                <p className="profile-info">Loading orders...</p>
              ) : orders.length === 0 ? (
                <p className="profile-info">No orders yet.</p>
              ) : (
                <div className="orders-list">
                  {orders.map((order) => (
                    <div className="order-item" key={order._id}>
                      <div className="order-item-header">
                        <span className="order-id">
                          #{order._id.slice(-6).toUpperCase()}
                        </span>
                        <span
                          className={`order-status order-status--${order.status}`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <p className="order-date">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>

                      <div className="order-items-list">
                        {order.items?.map((item, idx) => (
                          <div className="order-line-item" key={idx}>
                            <span>
                              {item.name} × {item.quantity}
                            </span>
                            <span>Rs. {item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                      <p className="order-subtotal">
                        Subtotal: Rs. {order.subTotal}
                      </p>
                      <p className="order-shipping">
                        Shipping: Rs. {order.shipCharges}
                      </p>
                      <p className="order-total">
                        Total: Rs. {order.totalPrice}
                      </p>
                      <p className="order-payment">
                        Payment: {order.paymentMethod} ({order.paymentStatus})
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Payment ── */}
          {activeTab === "Payment" && (
            <div className="profile-card">
              <h2 className="profile-card-title">Payment Methods</h2>
              {payments.length === 0 ? (
                <div className="profile-empty">
                  <p className="profile-info">No payment methods saved.</p>
                  <button className="profile-save-btn">
                    + Add Payment Method
                  </button>
                </div>
              ) : (
                payments.map((p, i) => (
                  <div className="payment-item" key={i}>
                    <span>💳 {p.cardNumber}</span>
                    <span>{p.expiry}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
