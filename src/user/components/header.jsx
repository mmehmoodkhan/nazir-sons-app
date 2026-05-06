import { useState } from "react";
import TopNavbar from "./topNavbar";
import "./header.css";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import LoginModal from "./LoginModal";
export default function Header() {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const { cart } = useCart();
  const [page, setPage] = useState("shop"); // "shop" | "cart" | "success"
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const [user, setUser] = useState(null);

  return (
    <div className="header_main_wrapper">
      <TopNavbar />
      <section className="user-navbar_wrapper">
        <nav className="user-navbar">
          <div className="app_logo">
            <img src="../images/logo_transparent.png" alt="Logo" />
          </div>
          <div className="user-search-bar">
            <input
              className="nav_search_input"
              type="text"
              placeholder="Search products..."
            />
          </div>
          <div className="nav-location">
            <span className="nav_location_icon">
              <img src="../images/location-icon.png" alt="Location" />
            </span>
            <div>
              <p className="nav_location_text">Deliver to:</p>
              <div className="loc_city">
                <p>Lahore</p>
              </div>
            </div>
          </div>
          <div>
            <button
              className="btn-ghost"
              onClick={() => {
                navigate("/cart");
              }}
              style={{ position: "relative" }}
            >
              Cart
              {cartCount > 0 && <span className="badge">{cartCount}</span>}
            </button>
            {user ? (
              <span>👤 {user.name}</span>
            ) : (
              <button
                className="btn-ghost"
                style={{ padding: "6px 14px", fontSize: 13 }}
                onClick={() => setShowLogin(true)}
              >
                Sign In
              </button>
            )}
            {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
          </div>
          {/* <div className="nav-location">
            <span className="nav_location_icon">
              <img src="../images/profile-icon.png" alt="profile" />
            </span>
            <div>
              <p className="nav_location_text">Login</p>
              <div className="loc_city">
                <p>Account</p>
              </div>
            </div>
          </div>
          <div className="nav_cart">
            <span className="nav_location_icon">
              <img src="../images/cart-icon.png" alt="cart" />
            </span>
            <div className="cart_info">{cart.length}</div>
          </div> */}
        </nav>
        <nav className="user_navbar2">
          <div className="select-wrapper">Shop By Department</div>
          <ul className="nav_links">
            <li className="nav_item">
              <Link to="/departments">Grocery Foods</Link>
            </li>
            <li className="nav_item">
              <Link to="/shop">Shop</Link>
            </li>
            <li className="nav_item">
              <Link to="/about">About Us</Link>
            </li>
            <li className="nav_item">
              <Link to="/contact">Contact</Link>
            </li>
          </ul>
        </nav>
      </section>
    </div>
  );
}
