import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import "./Users.css";

const formatDate = (value) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const USERS_PER_PAGE = 5;

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // ── Filter states
  const [filterRole, setFilterRole] = useState("all");       // name/email filtered via search
  const [filterStatus, setFilterStatus] = useState("all");   // verified / pending
  const [filterAccess, setFilterAccess] = useState("all");   // active / blocked

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("/api/auth/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch users.");
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Reset to page 1 whenever any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterRole, filterStatus, filterAccess]);

  const toggleBlockUser = async (user) => {
    const isBlocked = !user.isBlocked;
    const action = isBlocked ? "block" : "unblock";
    if (!window.confirm(`Are you sure you want to ${action} ${user.name}?`)) return;

    setUpdatingUserId(user._id);
    setError("");
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`/api/auth/users/${user._id}/block`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isBlocked }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Failed to ${action} user.`);
      setUsers((currentUsers) =>
        currentUsers.map((u) => (u._id === user._id ? data.user : u)),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingUserId("");
    }
  };

  const clearFilters = () => {
    setSearch("");
    setFilterRole("all");
    setFilterStatus("all");
    setFilterAccess("all");
  };

  const hasActiveFilters =
    search || filterRole !== "all" || filterStatus !== "all" || filterAccess !== "all";

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Search — name or email
      const term = search.trim().toLowerCase();
      if (term) {
        const matches = [user.name, user.email]
          .filter(Boolean)
          .some((v) => v.toLowerCase().includes(term));
        if (!matches) return false;
      }

      // Role filter
      if (filterRole !== "all" && user.role !== filterRole) return false;

      // Status filter (verified / pending)
      if (filterStatus === "verified" && !user.isVerified) return false;
      if (filterStatus === "pending" && user.isVerified) return false;

      // Access filter (active / blocked)
      if (filterAccess === "active" && user.isBlocked) return false;
      if (filterAccess === "blocked" && !user.isBlocked) return false;

      return true;
    });
  }, [search, filterRole, filterStatus, filterAccess, users]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE,
  );

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const verifiedCount = users.filter((u) => u.isVerified).length;
  const pendingCount = users.length - verifiedCount;
  const blockedCount = users.filter((u) => u.isBlocked).length;

  // Unique roles for dropdown
  const roles = ["all", ...new Set(users.map((u) => u.role).filter(Boolean))];

  return (
    <div className="users-wrapper">
      <div className="sidebar_hide">
        <Sidebar />
      </div>
      <div className="admin_outer">
        <div className="db_topbar">
          <Navbar title="Users" />
        </div>

        <section className="users-main">
          <div className="users-header">
            <div>
              <h2 className="users-title">
                Registered Users
                <span className="users-count">{users.length} total</span>
              </h2>
              <div className="users-summary">
                <span>{verifiedCount} verified</span>
                <span>{pendingCount} pending</span>
                <span>{blockedCount} blocked</span>
              </div>
            </div>
            <button className="users-refresh-btn" onClick={fetchUsers}>
              Refresh
            </button>
          </div>

          {/* ── Filter bar ── */}
          <div className="users-filter-bar">
            {/* Search by name / email */}
            <input
              className="users-search"
              type="search"
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {/* Role */}
            <select
              className="users-filter-select"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r === "all" ? "All Roles" : r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </select>

            {/* Status — verified / pending */}
            <select
              className="users-filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
            </select>

            {/* Access — active / blocked */}
            <select
              className="users-filter-select"
              value={filterAccess}
              onChange={(e) => setFilterAccess(e.target.value)}
            >
              <option value="all">All Access</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>

            {/* Clear filters */}
            {hasActiveFilters && (
              <button className="users-clear-btn" onClick={clearFilters}>
                ✕ Clear
              </button>
            )}
          </div>

          {/* Page info */}
          {!loading && !error && filteredUsers.length > 0 && (
            <p className="users-page-info">
              Showing{" "}
              <strong>
                {(currentPage - 1) * USERS_PER_PAGE + 1}–
                {Math.min(currentPage * USERS_PER_PAGE, filteredUsers.length)}
              </strong>{" "}
              of <strong>{filteredUsers.length}</strong> users
            </p>
          )}

          <div className="users-table-wrap">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Provider</th>
                  <th>Status</th>
                  <th>Access</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={8} className="users-state">
                      Loading users...
                    </td>
                  </tr>
                )}
                {!loading && error && (
                  <tr>
                    <td colSpan={8} className="users-state users-error">
                      {error}
                    </td>
                  </tr>
                )}
                {!loading && !error && filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={8} className="users-state">
                      No users found.
                    </td>
                  </tr>
                )}
                {!loading &&
                  !error &&
                  paginatedUsers.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <div className="users-name-cell">
                          <span className="users-avatar">
                            {(user.name || user.email || "U")
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                          <span>{user.name || "N/A"}</span>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td className="users-capitalize">{user.role}</td>
                      <td className="users-capitalize">{user.provider}</td>
                      <td>
                        <span
                          className={`users-badge ${
                            user.isVerified
                              ? "users-badge-verified"
                              : "users-badge-pending"
                          }`}
                        >
                          {user.isVerified ? "Verified" : "Pending"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`users-badge ${
                            user.isBlocked
                              ? "users-badge-blocked"
                              : "users-badge-active"
                          }`}
                        >
                          {user.isBlocked ? "Blocked" : "Active"}
                        </span>
                      </td>
                      <td>{formatDate(user.createdAt)}</td>
                      <td>
                        <button
                          className={`users-action-btn ${
                            user.isBlocked
                              ? "users-unblock-btn"
                              : "users-block-btn"
                          }`}
                          disabled={
                            user.role === "admin" ||
                            updatingUserId === user._id
                          }
                          onClick={() => toggleBlockUser(user)}
                        >
                          {updatingUserId === user._id
                            ? "Saving..."
                            : user.isBlocked
                              ? "Unblock"
                              : "Block"}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          {!loading && !error && totalPages > 1 && (
            <div className="users-pagination">
              <button
                className="users-page-btn"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ← Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`users-page-btn ${
                    currentPage === page ? "users-page-active" : ""
                  }`}
                  onClick={() => goToPage(page)}
                >
                  {page}
                </button>
              ))}

              <button
                className="users-page-btn"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Users;
