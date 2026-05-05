import "../components/Navbar.css";
import { useState } from "react";
import Sidebar from "./Sidebar";
export default function Navbar() {
  const [sidebarOpen, setsidebarOpen] = useState(false);

  return (
    <>
      <div className="navbar">
        {/* <!-- Left --> */}
        <div className="nav-left">
          <button
            className="menu-btn"
            onClick={() => setsidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? "❌" : "☰"}
          </button>
          <div className="logo">Admin Dashboard</div>
        </div>

        {/* <!-- Right --> */}
        <div className="nav-right">
          <div className="nav-icon">
            🔔
            <span>3</span>
          </div>

          <div className="nav-icon">
            ✉️
            <span>5</span>
          </div>

          <div className="profile">
            {/* <img src="https://via.placeholder.com/35" alt="profile"/> */}
            👤
            <div className="profile-name">Admin</div>
          </div>
        </div>
      </div>

      {sidebarOpen && <Sidebar />}
    </>
  );
}
