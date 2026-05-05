import React from "react";
import TopNavbar from "./topNavbar";
import "./header.css";
import { Link } from "react-router-dom";
export default function Header() {
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
          <div className="nav-location">
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
            <div className="cart_info">0</div>
          </div>
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
