import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useState, useEffect } from "react";
import "./Dashboard.css";
import StatCard from "./StatCard";
export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
  fetch("http://localhost:5000/api/stats")
    .then(res => {
      if (!res.ok) throw new Error(`Server error: ${res.status}`); //  catch 404
      return res.json();
    })
    .then(data => {
      setStats(data);
      setLoading(false);
    })
    .catch(err => {
      setError(err.message);  //  store error
      setLoading(false);
    });
}, []);

if (loading) return <p>Loading...</p>;
if (error) return <p>Error: {error}</p>;  //  show error
if (!stats) return null;                  //  guard against null

  return (
    <div className="dashboard_wrapper">
      <div className="sidebar_hide">
        <Sidebar title="" />
      </div>
      <div className="dashboar_inner">
        <div className="db_topbar">
          <Navbar title="Dashboard Overview" />
        </div>
        <div className="db_inner_main">
          <div className="stats-grid">
            <StatCard
              title="Total Revenue"
              value={`Rs ${stats.totalRevenue.toLocaleString()}`}
              icon="fa-dollar-sign"
              color="#4CAF50"
            />
            <StatCard
              title="Total Orders"
              value={stats.totalOrders}
              icon="fa-shopping-cart"
              color="#2196F3"
            />
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon="fa-users"
              color="#9C27B0"
            />
            <StatCard
              title="Pending Payments"
              value={`Rs ${stats.pendingPayments.toLocaleString()}`}
              icon="fa-clock"
              color="#FF9800"
            />
          
          </div>
        </div>
      </div>
    </div>
  );
}
