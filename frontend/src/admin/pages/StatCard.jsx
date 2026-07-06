function StatCard({ title, value, icon, color }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <div className="stat-icon" style={{ background: `${color}20` }}>
          <i className={`fa ${icon}`} style={{ color }} />
        </div>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-title">{title}</div>
    </div>
  );
}

export default StatCard;