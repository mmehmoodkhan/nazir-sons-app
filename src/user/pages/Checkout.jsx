import { useCart } from "../../context/CartContext";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Checkout.css";
import DeliverySlots from "./DeliverySlots";

const Checkout = () => {
  const { cart, clearCart, user } = useCart();
  const navigate = useNavigate();
  const selectedSlotRef = useRef(null);

  const [firstName,    setFirstName]    = useState(user?.firstName || "");
  const [lastName,     setLastName]     = useState(user?.lastName  || "");
  const [email,        setEmail]        = useState(user?.email     || "");
  const [phone,        setPhone]        = useState(user?.phone     || "");
  const [orderNote,    setOrderNote]    = useState("");
  const [deliveryCode, setDeliveryCode] = useState(["", "", "", ""]);
  const [address,      setAddress]      = useState("");
  const [houseNo,      setHouseNo]      = useState("");
  const [area,         setArea]         = useState("");
  const [city,         setCity]         = useState("");
  const [deliverHere,  setDeliverHere]  = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [paymentMethod,  setPaymentMethod]  = useState("cod");
  const [mobileNumber,   setMobileNumber]   = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [errors,         setErrors]         = useState({});

  const shipCharges = 299;
  const subTotal    = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalPrice  = subTotal + shipCharges;

  const handleCodeChange = (value, index) => {
    const updated = [...deliveryCode];
    updated[index] = value.replace(/\D/, "").slice(-1);
    setDeliveryCode(updated);
    if (value && index < 3) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
    if (errors.deliveryCode) {
      setErrors((prev) => ({ ...prev, deliveryCode: "" }));
    }
  };

  const handleCodeKeyDown = (e, index) => {
    if (e.key === "Backspace" && !deliveryCode[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const clearError = (field) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const newErrors = {};

    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim())  newErrors.lastName  = "Last name is required";

    if (!email.trim())     newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Enter a valid email address";

    if (!phone.trim())     newErrors.phone = "Phone number is required";
    else if (!/^03\d{9}$/.test(phone))
      newErrors.phone = "Enter a valid Pakistani number (03xxxxxxxxx)";

    if (deliveryCode.some((d) => d === ""))
      newErrors.deliveryCode = "Enter all 4 digits of the delivery code";

    if (!address.trim()) newErrors.address = "Address is required";
    if (!area.trim())    newErrors.area    = "Area is required";
    if (!city.trim())    newErrors.city    = "City is required";

    if (!selectedSlotRef.current)
      newErrors.selectedSlot = "Please select a delivery slot and click Confirm";

    if (paymentMethod !== "cod") {
      if (!mobileNumber.trim())
        newErrors.mobileNumber = "Mobile number is required";
      else if (!/^03\d{9}$/.test(mobileNumber))
        newErrors.mobileNumber = "Enter a valid Pakistani number (03xxxxxxxxx)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckout = async () => {
    if (!validate()) {
      document.querySelector(".field-error")?.scrollIntoView({
        behavior: "smooth", block: "center",
      });
      return;
    }

    setPaymentLoading(true);
    const orderId = "ORD-" + Date.now();

    const orderData = {
      orderId,
      userId:        user?._id || "guest",
      customer:      { firstName, lastName, email, phone },
      delivery:      { address, houseNo, area, city, deliverHere },
      deliverySlot:  selectedSlotRef.current,   // ✅ use ref not state
      deliveryCode:  deliveryCode.join(""),
      orderNote,
      items:         cart,
      subTotal,
      shipCharges,
      totalPrice,
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "pending" : "paid",
    };

    try {
      // ── JazzCash ──────────────────────────────────────────
      if (paymentMethod === "jazzcash") {
        const payRes = await fetch("/api/payment/jazzcash", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mobileNumber, amount: totalPrice, orderId }),
        });
        const payData = await payRes.json();
        if (!payData.success) {
          setErrors({ general: payData.message || "JazzCash payment failed" });
          setPaymentLoading(false);
          return;
        }
      }

      // ── EasyPaisa ─────────────────────────────────────────
      if (paymentMethod === "easypaisa") {
        const payRes = await fetch("/api/payment/easypaisa", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mobileNumber, amount: totalPrice, orderId }),
        });
        const payData = await payRes.json();
        if (payData.responseCode !== "0000") {
          setErrors({ general: payData.responseDesc || "EasyPaisa payment failed" });
          setPaymentLoading(false);
          return;
        }
      }

      // ── Save order ────────────────────────────────────────
      const res  = await fetch("/api/order/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      const data = await res.json();

      if (res.ok) {
        clearCart();
        navigate("/order-success", {
          state: {
            orderId:       data.orderId,   // ✅ from backend response
            name:          firstName,
            paymentMethod,
            totalPrice,
          },
        });
      } else {
        setErrors({ general: data.message || "Order failed. Please try again." });
      }
    } catch {
      setErrors({ general: "Something went wrong. Please try again." });
    } finally {
      setPaymentLoading(false);
    }
  };

  const ErrorMsg = ({ field }) =>
    errors[field] ? (
      <span className="field-error" style={{
        color: "#e53e3e", fontSize: 12, marginTop: 4, display: "block",
      }}>
        {errors[field]}
      </span>
    ) : null;

  return (
    <div className="checkout_wrapper">
      <div>
        <span onClick={() => navigate("/cart")} style={{ cursor: "pointer" }}>
          ← Back to Cart
        </span>
      </div>
      <h2>Checkout</h2>

      <div className="checkkout_mian">
        <div className="cart_contact_main">

          {/* ── Contact Information ─────────────────────── */}
          <div className="cart_contact">
            <h2 className="section-title">Contact Information</h2>
            <div className="cart_contacts_inner">
              <div className="form_group">
                <label>First Name <span className="text-danger">*</span></label>
                <input
                  className={`input-field ${errors.firstName ? "input-error" : ""}`}
                  placeholder="First Name" value={firstName}
                  onChange={(e) => { setFirstName(e.target.value); clearError("firstName"); }}
                />
                <ErrorMsg field="firstName" />
              </div>

              <div className="form_group">
                <label>Last Name <span className="text-danger">*</span></label>
                <input
                  className={`input-field ${errors.lastName ? "input-error" : ""}`}
                  placeholder="Last Name" value={lastName}
                  onChange={(e) => { setLastName(e.target.value); clearError("lastName"); }}
                />
                <ErrorMsg field="lastName" />
              </div>

              <div className="form_group">
                <label>Email <span className="text-danger">*</span></label>
                <input
                  className={`input-field ${errors.email ? "input-error" : ""}`}
                  type="email" placeholder="example@email.com" value={email}
                  onChange={(e) => { setEmail(e.target.value); clearError("email"); }}
                />
                <ErrorMsg field="email" />
              </div>

              <div className="form_group">
                <label>Phone <span className="text-danger">*</span></label>
                <input
                  className={`input-field ${errors.phone ? "input-error" : ""}`}
                  type="tel" placeholder="03001234567" value={phone}
                  onChange={(e) => { setPhone(e.target.value); clearError("phone"); }}
                />
                <ErrorMsg field="phone" />
              </div>
            </div>

            {/* OTP */}
            <div className="opt_wrapper">
              <label>Delivery Code <span className="text-danger">*</span></label>
              <div className="opt_wrapper_inner">
                {deliveryCode.map((digit, i) => (
                  <input
                    key={i} id={`otp-${i}`}
                    className={`input-field ${errors.deliveryCode ? "input-error" : ""}`}
                    type="text" inputMode="numeric" maxLength={1} value={digit}
                    onChange={(e) => handleCodeChange(e.target.value, i)}
                    onKeyDown={(e) => handleCodeKeyDown(e, i)}
                  />
                ))}
              </div>
              <ErrorMsg field="deliveryCode" />
              <p>Enter a 4-digit code to receive your order.</p>
            </div>

            <label>Order Note</label>
            <textarea
              className="input-field"
              placeholder="Special instructions for your order"
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
            />
          </div>

          {/* ── Delivery Information ────────────────────── */}
          <div className="cart_contact">
            <h2 className="section-title">Delivery Information</h2>
            <div className="delv_info_wrapper">
              <div className="input_group">
                <label>Address <span className="text-danger">*</span></label>
                <input
                  className={`input-field ${errors.address ? "input-error" : ""}`}
                  type="text" value={address}
                  onChange={(e) => { setAddress(e.target.value); clearError("address"); }}
                />
                <ErrorMsg field="address" />
              </div>

              <div className="input_group">
                <label>House No, Apartment, Suite, etc.</label>
                <input className="input-field" type="text" value={houseNo}
                  onChange={(e) => setHouseNo(e.target.value)} />
              </div>

              <div className="cart_contacts_inner">
                <div className="form_group">
                  <label>Area <span className="text-danger">*</span></label>
                  <input
                    className={`input-field ${errors.area ? "input-error" : ""}`}
                    type="text" value={area}
                    onChange={(e) => { setArea(e.target.value); clearError("area"); }}
                  />
                  <ErrorMsg field="area" />
                </div>
                <div className="form_group">
                  <label>City <span className="text-danger">*</span></label>
                  <input
                    className={`input-field ${errors.city ? "input-error" : ""}`}
                    type="text" value={city}
                    onChange={(e) => { setCity(e.target.value); clearError("city"); }}
                  />
                  <ErrorMsg field="city" />
                </div>
              </div>

              <div>
                <label>We will deliver here</label>
                <input className="input-field" type="text" value={deliverHere}
                  onChange={(e) => setDeliverHere(e.target.value)} />
                <div id="mapContainer"></div>
              </div>
            </div>
          </div>

          {/* ── Delivery Slots ──────────────────────────── */}
          <div className="cart_contact">
            <div className="delv_slots_wrapper">
              <h2 className="section-title">Delivery Slots</h2>
              <h4>Select a date</h4>
              <div className="delv_slots_list">
                <DeliverySlots
                  onConfirm={(slot) => {
                    setSelectedSlot(slot);
                    selectedSlotRef.current = slot;
                    clearError("selectedSlot");
                  }}
                />
              </div>
              <ErrorMsg field="selectedSlot" />
            </div>
          </div>
        </div>

        {/* ── Order Summary + Payment ──────────────────────── */}
        <div className="place_order_area">
          <div className="grand_total">
            <p>Subtotal</p>
            <p>Rs {subTotal.toFixed(2)}</p>
          </div>
          <div className="grand_total">
            <p>Shipping Charges</p>
            <p>Rs {shipCharges}</p>
          </div>
          <hr />
          <div className="net_total">
            <p>Net Total</p>
            <p>Rs {totalPrice.toFixed(2)}</p>
          </div>

          {/* Payment method */}
          <div className="payment_methods">
            <h3>Payment Method</h3>
            {[
              { value: "cod",       label: "Cash on Delivery" },
              { value: "jazzcash",  label: "JazzCash"         },
              { value: "easypaisa", label: "EasyPaisa"        },
            ].map(({ value, label }) => (
              <label key={value}
                className={`payment_option ${paymentMethod === value ? "active" : ""}`}>
                <input type="radio" value={value}
                  checked={paymentMethod === value}
                  onChange={() => { setPaymentMethod(value); clearError("mobileNumber"); }}
                />
                {label}
              </label>
            ))}
          </div>

          {paymentMethod !== "cod" && (
            <div className="form_group" style={{ marginTop: 12 }}>
              <label>Mobile Number <span className="text-danger">*</span></label>
              <input
                className={`input-field ${errors.mobileNumber ? "input-error" : ""}`}
                type="tel" placeholder="03001234567" value={mobileNumber}
                onChange={(e) => { setMobileNumber(e.target.value); clearError("mobileNumber"); }}
              />
              <ErrorMsg field="mobileNumber" />
            </div>
          )}

          {errors.general && (
            <p style={{ color: "#e53e3e", fontSize: 13, marginTop: 8 }}>
              {errors.general}
            </p>
          )}

          <button className="place_order_btn" onClick={handleCheckout}
            disabled={paymentLoading}>
            {paymentLoading ? "Processing..." : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;