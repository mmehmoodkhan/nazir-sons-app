import "../components/Sidebar.css";
import { NavLink, useLocation, useNavigate  } from "react-router-dom";
import { useState, useEffect } from "react";

const SEEN_ORDERS_KEY = "adminSeenOrderIds";

const readSeenOrderIds = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(SEEN_ORDERS_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
};

export default function Sidebar() {
   const navigate = useNavigate();
   const location = useLocation();
   const handleLogout = () => {
    localStorage.removeItem("adminToken");  //   clear token
    localStorage.removeItem("adminRole");   //   clear role
    navigate("/admin/login");               //   redirect to login
  };
  const [unseenOrderCount, setUnseenOrderCount] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function loadOrders() {
      try {
        const res = await fetch("/api/order/all");
        const data = await res.json();
        if (ignore || !data.success) return;

        const orderIds = data.orders.map((order) => order._id || order.orderId);

        if (location.pathname === "/admin/orders") {
          localStorage.setItem(SEEN_ORDERS_KEY, JSON.stringify(orderIds));
          setUnseenOrderCount(0);
          return;
        }

        const seenOrderIds = new Set(readSeenOrderIds());
        setUnseenOrderCount(
          orderIds.filter((orderId) => !seenOrderIds.has(orderId)).length,
        );
      } catch (err) {
        console.error("Failed to fetch orders", err);
      }
    }

    loadOrders();
    return () => {
      ignore = true;
    };
  }, [location.pathname]);
  return (
    <div className="sidebar">
      <div className="sidebar_logo">
        <span className="sb_logo">
          <img src="../images/logo_transparent.png" alt="logo" />
        </span>
      </div>
      <ul>
        <li>
          <NavLink to="/admin/dashboard" className={({isActive})=> isActive ? "active" : ""}>Dashboard</NavLink>
        </li>
        <li>
          <NavLink to="/admin/products" className={({isActive})=> isActive ? "active" : ""}>Products</NavLink>
        </li>
        <li>
          <NavLink to="/admin/Categories" className={({isActive})=> isActive ? "active" : ""}>Categories</NavLink>
        </li>
        <li>
          <NavLink to="/admin/orders" className={({isActive})=> isActive ? "active" : ""}>
            Orders <span className="sidebar_order-count">{unseenOrderCount}</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/delivery-slots" className={({isActive})=> isActive ? "active" : ""}>Delivery Slots</NavLink>
        </li>
        <li>
          <NavLink to="/admin/users" className={({isActive})=> isActive ? "active" : ""}>Users</NavLink>
        </li>
        <li>
          <NavLink to="/admin/login" onClick={handleLogout}>Logout</NavLink>
        </li>
      </ul>
    </div>
  );
}
