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

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("/api/auth/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch users.");
      }

      setUsers(data.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
  }, []);

  const toggleBlockUser = async (user) => {
    const isBlocked = !user.isBlocked;
    const action = isBlocked ? "block" : "unblock";

    if (!window.confirm(`Are you sure you want to ${action} ${user.name}?`)) {
      return;
    }

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

      if (!res.ok) {
        throw new Error(data.message || `Failed to ${action} user.`);
      }

      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser._id === user._id ? data.user : currentUser,
        ),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingUserId("");
    }
  };

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;

    return users.filter((user) =>
      [user.name, user.email, user.role, user.provider]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term)),
    );
  }, [search, users]);

  const verifiedCount = users.filter((user) => user.isVerified).length;
  const pendingCount = users.length - verifiedCount;
  const blockedCount = users.filter((user) => user.isBlocked).length;

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

          <div className="users-toolbar">
            <input
              className="users-search"
              type="search"
              placeholder="Search users"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

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
                  filteredUsers.map((user) => (
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
                            user.role === "admin" || updatingUserId === user._id
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
        </section>
      </div>
    </div>
  );
}

export default Users;
