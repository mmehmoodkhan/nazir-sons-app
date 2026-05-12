import { useCart } from "../../context/CartContext";
import { useState } from "react";
import "./Checkout.css";
import DeliverySlots from "./DeliverySlots";
const Checkout = () => {
  const { cart, clearCart } = useCart();
  const [name, setName] = useState();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [address, setAddress] = useState();
  const shipCharges = 299;
  const subTotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const totalPrice = subTotal + shipCharges;

  const handleCheckout = async () => {
    const res = await fetch("/api/order/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: "guest123", // replace with real user later
        items: cart,
        subTotal,
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
        <div className="cart_contact_main">
          <div className="cart_contact">
            <h2 className="section-title">Contact Information</h2>
            <div className="cart_contacts_inner">
              <div className="form_group">
                <label>
                  First Name <span className="text-danger">*</span>
                </label>
                <input
                  className="input-field"
                  placeholder="First Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form_group">
                <label>
                  Last Name <span className="text-danger">*</span>
                </label>
                <input
                  className="input-field"
                  placeholder="Last Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form_group">
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
              </div>

              <div className="form_group">
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
              </div>
            </div>

            <div className="opt_wrapper">
              <label>
                Delivery Code <span className="text-danger">*</span>
              </label>
              <div className="opt_wrapper_inner">
                <input className="input-field" type="text" />
                <input className="input-field" type="text" />
                <input className="input-field" type="text" />
                <input className="input-field" type="text" />
              </div>
              <p>Enter a 4-digit code to receive your order.</p>
            </div>
            <label>Order Note</label>
            <textarea
              className="input-field"
              placeholder="Special Instructions for your order"
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div className="cart_contact">
            <h2 className="section-title">Delivery Information</h2>
            <div className="delv_info_wrapper">
              <div className="input_group">
                <label>Address</label>
                <input className="input-field" type="text" name="" id="" />
              </div>
              <div className="input_group">
                <label>House No, Apartment, suite, etc.</label>
                <input className="input-field" type="text" name="" id="" />
              </div>
              <div className="cart_contacts_inner">
                <div className="form_group">
                  <label>Area</label>
                  <input className="input-field" type="tel" name="" id="" />
                </div>
                <div className="form_group">
                  <label>City</label>
                  <input className="input-field" type="text" name="" id="" />
                </div>
              </div>
              <div className="">
                <label>We will deliver here</label>
                <input className="input-field" type="text" name="" id="" />
                <div id="mapContainer"></div>
              </div>
            </div>
          </div>
          <div className="cart_contact">
            <div className="delv_slots_wrapper">
              <h2 className="section-title">Delivery Slots</h2>
              <h4>Select a date</h4>
              <div className="delv_slots_list">
                <DeliverySlots />
              </div>
            </div>
          </div>
        </div>

        <div className="place_order_area">
          <div className="grand_total">
            <p>Subtotal </p>
            <p>Rs {subTotal.toFixed(2)}</p>
          </div>
          <div className="grand_total">
            <p>Shipping Charges</p>
            <p>{shipCharges}</p>
          </div>
          <hr />
          <div className="net_total">
            <p>Net Total </p>
            <p>Rs {totalPrice.toFixed(2)}</p>
          </div>
          <button className="place_order_btn" onClick={handleCheckout}>
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
