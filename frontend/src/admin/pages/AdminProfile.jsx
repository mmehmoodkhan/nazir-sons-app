import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import "./AdminProfile.css";

const formatDate = (value) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

function AdminProfile() {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchAdminProfile = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("/api/auth/admin-profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load admin profile.");
      }

      setAdmin(data.admin);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAdminProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminRole");
    navigate("/admin/login");
  };

  const initials = (admin?.name || admin?.email || "Admin")
    .charAt(0)
    .toUpperCase();

  return (
    <div className="admin-profile-wrapper">
      <div className="sidebar_hide">
        <Sidebar />
      </div>
      <div className="admin_outer">
        <div className="db_topbar">
          <Navbar title="Admin Profile" />
        </div>

        <section className="admin-profile-main">
          {loading ? (
            <p className="admin-profile-state">Loading profile...</p>
          ) : error ? (
            <p className="admin-profile-state admin-profile-error">{error}</p>
          ) : (
            <>
              <div className="admin-profile-hero">
                <span className="admin-profile-avatar">{initials}</span>
                <div>
                  <h2>{admin?.name || "Admin"}</h2>
                  <p>{admin?.email}</p>
                </div>
                <span className="admin-profile-role">{admin?.role}</span>
              </div>

              <div className="admin-profile-grid">
                <div className="admin-profile-panel">
                  <h3>Account Details</h3>
                  <div className="admin-profile-row">
                    <span>Name</span>
                    <strong>{admin?.name || "N/A"}</strong>
                  </div>
                  <div className="admin-profile-row">
                    <span>Email</span>
                    <strong>{admin?.email || "N/A"}</strong>
                  </div>
                  <div className="admin-profile-row">
                    <span>Role</span>
                    <strong className="admin-profile-capitalize">
                      {admin?.role || "N/A"}
                    </strong>
                  </div>
                  <div className="admin-profile-row">
                    <span>Provider</span>
                    <strong className="admin-profile-capitalize">
                      {admin?.provider || "local"}
                    </strong>
                  </div>
                </div>

                <div className="admin-profile-panel">
                  <h3>Status</h3>
                  <div className="admin-profile-row">
                    <span>Email status</span>
                    <strong>
                      <span
                        className={`admin-profile-badge ${
                          admin?.isVerified
                            ? "admin-profile-badge-active"
                            : "admin-profile-badge-pending"
                        }`}
                      >
                        {admin?.isVerified ? "Verified" : "Pending"}
                      </span>
                    </strong>
                  </div>
                  <div className="admin-profile-row">
                    <span>Access</span>
                    <strong>
                      <span
                        className={`admin-profile-badge ${
                          admin?.isBlocked
                            ? "admin-profile-badge-blocked"
                            : "admin-profile-badge-active"
                        }`}
                      >
                        {admin?.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </strong>
                  </div>
                  <div className="admin-profile-row">
                    <span>Joined</span>
                    <strong>{formatDate(admin?.createdAt)}</strong>
                  </div>
                  <div className="admin-profile-row">
                    <span>Last updated</span>
                    <strong>{formatDate(admin?.updatedAt)}</strong>
                  </div>
                </div>
              </div>

              <div className="admin-profile-actions">
                <button type="button" onClick={fetchAdminProfile}>
                  Refresh Profile
                </button>
                <button
                  type="button"
                  className="admin-profile-logout"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default AdminProfile;
