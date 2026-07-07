import "../components/Navbar.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

const SNAPSHOT_KEY = "adminNotificationSnapshot";

const readSnapshot = () => {
  try {
    return JSON.parse(localStorage.getItem(SNAPSHOT_KEY));
  } catch {
    return null;
  }
};

const buildNotifications = (current, saved) => {
  if (!saved) return [];

  const notifications = [];
  const newOrders = current.totalOrders - (saved.totalOrders || 0);
  const newUsers = current.totalUsers - (saved.totalUsers || 0);

  if (newOrders > 0) {
    notifications.push({
      id: "orders",
      title: "New order",
      message: `${newOrders} new order${newOrders > 1 ? "s" : ""} created`,
      count: newOrders,
      path: "/admin/orders",
    });
  }

  if (newUsers > 0) {
    notifications.push({
      id: "users",
      title: "New user",
      message: `${newUsers} new user${newUsers > 1 ? "s" : ""} registered`,
      count: newUsers,
      path: "/admin/users",
    });
  }

  return notifications;
};

export default function Navbar({ title }) {
  const [sidebarOpen, setsidebarOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [snapshot, setSnapshot] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchData, setSearchData] = useState({
    products: [],
    orders: [],
    users: [],
  });
  const [searchLoaded, setSearchLoaded] = useState(false);
  const navigate = useNavigate();
  const unreadCount = notifications.reduce(
    (total, notification) => total + notification.count,
    0,
  );

  const fetchNotificationStats = useCallback(async () => {
    try {
      const res = await fetch(`/api/stats?ts=${Date.now()}`, {
        cache: "no-store",
      });
      const data = await res.json();

      if (!res.ok) return;

      const current = {
        totalOrders: data.totalOrders || 0,
        totalUsers: data.totalUsers || 0,
      };
      const saved = readSnapshot();

      if (!saved) {
        localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(current));
        setNotifications([]);
      } else {
        setNotifications(buildNotifications(current, saved));
      }

      setSnapshot(current);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotificationStats();
    const interval = setInterval(fetchNotificationStats, 30000);

    return () => clearInterval(interval);
  }, [fetchNotificationStats]);

  const markNotificationsRead = () => {
    if (!snapshot) return;

    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot));
    setNotifications([]);
  };

  const openNotification = (path) => {
    markNotificationsRead();
    setNotificationOpen(false);
    navigate(path);
  };

  const loadSearchData = async () => {
    if (searchLoaded || searchLoading) return;

    setSearchLoading(true);
    setSearchError("");

    try {
      const token = localStorage.getItem("adminToken");
      const [productsRes, ordersRes, usersRes] = await Promise.all([
       fetch("http://149.104.79.29:5000/api/products"),
        fetch(`/api/order/all?ts=${Date.now()}`, { cache: "no-store" }),
        fetch("/api/auth/users", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const [products, orders, users] = await Promise.all([
        productsRes.json(),
        ordersRes.json(),
        usersRes.json(),
      ]);

      if (!productsRes.ok || !ordersRes.ok || !usersRes.ok) {
        throw new Error("Search data could not be loaded.");
      }

      setSearchData({
        products: Array.isArray(products) ? products : [],
        orders: orders.orders || [],
        users: users.users || [],
      });
      setSearchLoaded(true);
    } catch (err) {
      console.error("Failed to load admin search", err);
      setSearchError(err.message || "Search data could not be loaded.");
    } finally {
      setSearchLoading(false);
    }
  };

  const searchResults = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return [];

    const productResults = searchData.products
      .filter((product) =>
        [product.name, product.category]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(term)),
      )
      .slice(0, 4)
      .map((product) => ({
        id: `product-${product._id}`,
        label: product.name,
        meta: product.category || "Product",
        type: "Product",
        path: "/admin/products",
      }));

    const orderResults = searchData.orders
      .filter((order) => {
        const customerName = `${order.customer?.firstName || ""} ${
          order.customer?.lastName || ""
        }`;

        return [order.orderId, customerName, order.customer?.email]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(term));
      })
      .slice(0, 4)
      .map((order) => ({
        id: `order-${order._id || order.orderId}`,
        label: order.orderId,
        meta:
          `${order.customer?.firstName || ""} ${
            order.customer?.lastName || ""
          }`.trim() || "Order",
        type: "Order",
        path: "/admin/orders",
      }));

    const userResults = searchData.users
      .filter((user) =>
        [user.name, user.email]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(term)),
      )
      .slice(0, 4)
      .map((user) => ({
        id: `user-${user._id}`,
        label: user.name || user.email,
        meta: user.email,
        type: "User",
        path: "/admin/users",
      }));

    return [...orderResults, ...userResults, ...productResults].slice(0, 8);
  }, [searchData, searchTerm]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setSearchOpen(true);
    loadSearchData();
  };

  const openSearchResult = (path) => {
    setSearchOpen(false);
    setSearchTerm("");
    navigate(path);
  };

  return (
    <>
      <div className="navbar">
        <div className="nav-left">
          <button
            className="menu-btn"
            onClick={() => setsidebarOpen(!sidebarOpen)}
            type="button"
          >
            {sidebarOpen ? "X" : "☰"}
          </button>
          <h2 className="db_title">{title}</h2>
        </div>

        <div className="nav-right">
          <div className="tb-search">
            <span className="tb-icon"><img src="../images/search-icon.png" alt="search" /></span>
            <input
              className="input-field"
              type="text"
              placeholder="Search anything..."
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => {
                setSearchOpen(true);
                loadSearchData();
              }}
            />
            {searchOpen && searchTerm.trim() && (
              <div className="admin-search-dropdown">
                {searchLoading ? (
                  <p className="admin-search-state">Searching...</p>
                ) : searchError ? (
                  <p className="admin-search-state admin-search-error">
                    {searchError}
                  </p>
                ) : searchResults.length === 0 ? (
                  <p className="admin-search-state">No results found</p>
                ) : (
                  searchResults.map((result) => (
                    <button
                      key={result.id}
                      type="button"
                      className="admin-search-item"
                      onClick={() => openSearchResult(result.path)}
                    >
                      <span>
                        <strong>{result.label}</strong>
                        <small>{result.meta}</small>
                      </span>
                      <em>{result.type}</em>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="notification-wrap">
            <button
              className="nav-icon tb-icon notification-btn"
              onClick={() => setNotificationOpen((open) => !open)}
              aria-label="Notifications"
              type="button"
            >
              <span className="notification-bell" aria-hidden="true"></span>
              {unreadCount > 0 && (
                <span className="notification-count">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {notificationOpen && (
              <div className="notification-dropdown">
                <div className="notification-head">
                  <h3>Notifications</h3>
                  {notifications.length > 0 && (
                    <button type="button" onClick={markNotificationsRead}>
                      Mark read
                    </button>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <p className="notification-empty">No new notifications</p>
                ) : (
                  notifications.map((notification) => (
                    <button
                      key={notification.id}
                      className="notification-item"
                      type="button"
                      onClick={() => openNotification(notification.path)}
                    >
                      <strong>{notification.title}</strong>
                      <span>{notification.message}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="profile" onClick={() => navigate("/admin/profile")}>
            <span className="profile-avatar" aria-hidden="true">
              A
            </span>
            {/* <div className="profile-name">Admin</div> */}
          </div>
        </div>
      </div>

      {sidebarOpen && <Sidebar />}
    </>
  );
}
