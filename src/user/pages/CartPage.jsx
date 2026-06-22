// // ─── Inline Styles & Fonts ───────────────────────────────────────────────────
// const fontLink = document.createElement("link");
// fontLink.rel = "stylesheet";
// fontLink.href =
//   "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500&display=swap";
// document.head.appendChild(fontLink);

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import Header from "../components/header";
import "./CartPage.css";
import LoginModal from "../components/LoginModal";
import { Footer } from "../components/Footer";
// import { useAuth } from "../../context/AuthContext";
export default function CartPage({ onCheckout }) {
  const { cart = [], setCart, user, removeFromCart } = useCart();
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const hasSoldOut = cart.some((item) => item.stock === 0);
  // const [user, setUser] = useState(null);
  const handleCheckout = () => {
    if (user) {
      navigate("/checkout"); // ← already logged in
    } else {
      setShowLogin(true); // ← not logged in, show modal
    }
  };

  const handleLoginSuccess = async (loggedInUser) => {
    setUser(loggedInUser);
    setShowLogin(false);
    // Merge local cart with server (mirrors mergeCart.jsx)
    await mergeCartWithServer(loggedInUser.userId, cart);
    setCart([]);
    setPage("success");
  };

  const updateQty = (id, delta) => {
    const next = cart
      .map((item) =>
        item._id === id ? { ...item, quantity: item.quantity + delta } : item,
      )
      .filter((item) => item.quantity > 0);
    setCart(next);
    localStorage.setItem("cart", JSON.stringify(next));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (!cart) return null; // or a loading spinner
  if (cart.length === 0) {
    return (
      <>
        <Header />
        <div className="mian_container">
          <div className="empty-cart">
            <div>🛒</div>
            <h3>Your cart is empty</h3>
            <p>Add some items from the shop to get started.</p>
            <div><button className="continue-shop-btn" onClick={()=>navigate('/')}>Continue Shopping</button></div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div>
      <Header />
      <div className="cart-page-main">
        <div className="mian_container">
          <h2 className="heddings">
            Your Cart{" "}
            <span>
              ({cart.length} item{cart.length !== 1 ? "s" : ""})
            </span>
          </h2>
          <div className="cart_inner_main">
            <div className="cart_sub_one">
              {cart.map((item) => {
                const isSoldOut = item.stock === 0; // or item.soldOut === true

                return (
                  <div key={item._id} className="cart-item">
                    <div className="cart_img">
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div>
                      <div className="cart_item_name">{item.name}</div>
                      <div className="cart_price">
                        Rs {item.price.toFixed(2)}
                      </div>

                      {/*  Only show when sold out */}
                      {isSoldOut && (
                        <p className="pro_soldout">
                          <span>Sold Out</span>
                        </p>
                      )}

                      {/*  Disable controls when sold out */}
                      <div
                        className={`qty-controls ${isSoldOut ? "disabled" : ""}`}
                      >
                        <button
                          className="qty-btn"
                          onClick={() => !isSoldOut && updateQty(item._id, -1)}
                          disabled={isSoldOut}
                        >
                          −
                        </button>
                        <span className="cart_qty">{item.quantity}</span>
                        <button
                          className="qty-btn"
                          onClick={() => !isSoldOut && updateQty(item._id, +1)}
                          disabled={isSoldOut}
                        >
                          +
                        </button>
                      </div>

                      <div className="cart_price">
                        Rs {(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>

                    <button
                      className="delete-cart-item"
                      onClick={() => removeFromCart(item._id)}
                    >
                      <img src="../images/delete-icon.jpg" alt="delete" />
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="cart_sub_two">
              <div className="cart_subtotal">
                <p>Subtotal</p>
                <span>Rs {total.toFixed(2)}</span>
              </div>
              <div className="cart_subtotal">
                <p>Shipping</p>
                <span>Calculated at checkout</span>
              </div>
              <div className="cart_subtotal">
                <p>Total</p>
                <span>Rs {total.toFixed(2)}</span>
              </div>
              <button
                className="continue-shop-btn"
                onClick={() => {
                  navigate("/");
                }}
              >
                Continue Shopping
              </button>
              <button
                className="proceed-btn"
                onClick={handleCheckout}
                disabled={hasSoldOut}
                title={hasSoldOut ? "Remove sold out items to continue" : ""}
              >
                Proceed to Checkout →
              </button>
            </div>
          </div>
          {showLogin && (
            <LoginModal
              onClose={() => setShowLogin(false)}
              onSuccess={(loggedInUser) => {
                // ← receive user here
                setUser(loggedInUser); // ← save user in state
                setShowLogin(false);
                navigate("/checkout"); // ← then navigate
              }}
            />
          )}
        </div>
      </div>
       <Footer />
    </div>
  );
}

function OrderSuccess({ user, onContinue }) {
  return (
    <div
      style={{
        textAlign: "center",
        paddingTop: 60,
        maxWidth: 420,
        margin: "0 auto",
      }}
    >
      <div style={{ fontSize: 64, marginBottom: 20 }}>✅</div>
      <h2
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 28,
          marginBottom: 12,
        }}
      >
        Order Placed!
      </h2>
      <p>
        Thanks, <strong style={{ color: "var(--surface)" }}>{user.name}</strong>
        ! Your order has been confirmed. A confirmation will be sent to{" "}
        <strong style={{ color: "var(--surface)" }}>{user.email}</strong>.
      </p>
      <div className="success-banner" style={{ marginBottom: 28 }}>
        🎉 Order #ORD-{Math.floor(Math.random() * 90000 + 10000)} confirmed
      </div>
      <button
        className="btn-primary"
        onClick={onContinue}
        style={{ padding: "13px" }}
      >
        Continue Shopping
      </button>
    </div>
  );
}
