import "../components/Sidebar.css";
import { Link } from "react-router-dom";
export default function Sidebar(isOpen, onClose) {
  return (
    <div className="sidebar">
      <h2>Admin Panel</h2>
      <ul>
        <li>📊 Dashboard</li>
        <li className="">
          <Link to="/">Show All Products</Link>
        </li>
        <li>
          <Link to="/admin/pages/add-product">Add Products</Link>
        </li>
        <li>📑 Orders</li>
        <li className="">👥 Users</li>
        <li>🚪 Logout</li>
      </ul>
    </div>
  );
}
