export default function Dashboard() {
  return (
    <section className="dashboard-main">
      {/* <!-- Sidebar --> */}
      <div className="sidebar">
        <h2>Admin Panel</h2>
        <ul>
          <li>📊 Dashboard</li>
          <li>📦 Products</li>
          <li>📑 Orders</li>
          <li className="">👥 Users</li>
          <li>🚪 Logout</li>
        </ul>
      </div>

      {/* <!-- Main Content --> */}
      <div className="main">
        <div className="header">Welcome Admin 👋</div>

        <div className="cards">
          <div className="card">
            <h3>Total Products</h3>
            <p>120</p>
          </div>

          <div className="card">
            <h3>Total Orders</h3>
            <p>45</p>
          </div>

          <div className="card">
            <h3>Revenue</h3>
            <p>Rs 50,000</p>
          </div>
        </div>
      </div>
    </section>
  );
}
