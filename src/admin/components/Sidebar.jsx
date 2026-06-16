import "../components/Sidebar.css";
import { NavLink, useNavigate  } from "react-router-dom";
import { useState, useEffect } from "react";
export default function Sidebar() {
   const navigate = useNavigate();
   const handleLogout = () => {
    localStorage.removeItem("adminToken");  //   clear token
    localStorage.removeItem("adminRole");   //   clear role
    navigate("/admin/login");               //   redirect to login
  };
  const [orders, setOrders] = useState([]);
  const fetchOrders = async () => {
    try {
      // const res = await fetch("http://localhost:5000/api/order/all");
      const res = await fetch("/api/order/all");
      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
    }
  };
  useEffect(() => {
    fetchOrders();
  }, []);
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
          <NavLink to="/admin/products" className={({isActive})=> isActive ? "active" : ""}>Show All Products</NavLink>
        </li>
        <li>
          <NavLink to="/admin/add-product" className={({isActive})=> isActive ? "active" : ""}>Add Products</NavLink>
        </li>
        <li>
          <NavLink to="/admin/orders" className={({isActive})=> isActive ? "active" : ""}>
            Orders <span className="sidebar_order-count">{orders.length}</span>
          </NavLink>
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
