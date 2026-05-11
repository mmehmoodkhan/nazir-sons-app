import { useCart } from "../../context/CartContext";
import { useState } from "react";
import "./Checkout.css";
const Checkout = () => {
  const { cart, clearCart } = useCart();
  const [name, setName] = useState();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [address, setAddress] = useState();

  const totalPrice = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  const handleCheckout = async () => {
    const res = await fetch("/api/order/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: "guest123", // replace with real user later
        items: cart,
        totalPrice,
        address,
      }),
    });

    const data = await res.json();

    alert(data.message);
    clearCart();
  };

  return (
    <div className="checkout_wrapper">
      <h2>Checkout</h2>
      <div className="checkkout_mian">
        <div className="cart_contact">
          <label>
            First Name <span className="text-danger">*</span>
          </label>
          <input
            className="input-field"
            placeholder="First Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <label>
            Last Name <span className="text-danger">*</span>
          </label>
          <input
            className="input-field"
            placeholder="Last Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <label>
            Email <span className="text-danger">*</span>
          </label>
          <input
            className="input-field"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label>
            Phone <span className="text-danger">*</span>
          </label>
          <input
            className="input-field"
            type="text"
            placeholder="phone"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          <label>Order Note</label>
          <textarea
            className="input-field"
            placeholder="Special Instructions for your order"
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        <div className="place_order_area">
          <h3>Total: Rs {totalPrice}</h3>

          <button onClick={handleCheckout}>Place Order</button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
