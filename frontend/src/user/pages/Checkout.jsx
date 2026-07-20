import { useCart } from "../../context/CartContext";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Checkout.css";
import DeliverySlots from "./DeliverySlots";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Header from "../components/header";
import { Footer } from "../components/Footer";

const isValidPakistaniPhone = (value) => /^03\d{9}$/.test(value.trim());

const Checkout = () => {
  const { cart, clearCart, user } = useCart();
  const navigate = useNavigate();
  const selectedSlotRef = useRef(null);

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [orderNote, setOrderNote] = useState("");
  const [deliveryCode, setDeliveryCode] = useState(["", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");
  const [phoneOtpToken, setPhoneOtpToken] = useState("");
  const [address, setAddress] = useState("");
  const [houseNo, setHouseNo] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("");
  const [deliverHere, setDeliverHere] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [mobileNumber, setMobileNumber] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [coords, setCoords] = useState(null); // { lat, lng }
  const [deliveryPricing, setDeliveryPricing] = useState({
    shippingCharge: 30,
    freeShippingThreshold: 1000,
  });

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const subTotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const shipCharges =
    deliveryPricing.freeShippingThreshold > 0 &&
    subTotal >= deliveryPricing.freeShippingThreshold
      ? 0
      : deliveryPricing.shippingCharge;
  const totalPrice = subTotal + shipCharges;

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
    if (otpVerified) {
      setOtpVerified(false);
      setPhoneOtpToken("");
      setOtpMessage("OTP changed. Please verify again.");
    }
  };
  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      );
      const data = await res.json();
      const addr = data.address || {};

      setAddress(
        [addr.house_number, addr.road].filter(Boolean).join(" ") ||
          data.display_name ||
          "",
      );
      setArea(addr.suburb || addr.neighbourhood || addr.town || "");
      setCity(addr.city || addr.town || addr.county || "");
      setDeliverHere(data.display_name || "");

      clearError("address");
      clearError("area");
      clearError("city");
    } catch {
      setLocationError("Could not fetch address for this location.");
    }
  };
  const handleCodeKeyDown = (e, index) => {
    if (e.key === "Backspace" && !deliveryCode[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const resetPhoneOtp = () => {
    setOtpSent(false);
    setOtpVerified(false);
    setPhoneOtpToken("");
    setOtpMessage("");
    setDeliveryCode(["", "", "", ""]);
  };

  const handleSendOtp = async () => {
    if (!isValidPakistaniPhone(phone)) {
      setErrors((prev) => ({
        ...prev,
        phone: "Enter a valid Pakistani number (03xxxxxxxxx)",
      }));
      return;
    }

    setOtpLoading(true);
    setOtpMessage("");
    setOtpVerified(false);
    setPhoneOtpToken("");

    try {
      const res = await fetch("/api/phone-otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Could not send OTP.");

      setOtpSent(true);
      setDeliveryCode(["", "", "", ""]);
      setOtpMessage(
        data.devOtp
          ? `OTP sent. Dev code: ${data.devOtp}`
          : "OTP sent to your phone.",
      );
      document.getElementById("otp-0")?.focus();
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        deliveryCode: err.message,
      }));
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otp = deliveryCode.join("");
    if (!/^\d{4}$/.test(otp)) {
      setErrors((prev) => ({
        ...prev,
        deliveryCode: "Enter the 4-digit OTP.",
      }));
      return;
    }

    setOtpLoading(true);
    setOtpMessage("");

    try {
      const res = await fetch("/api/phone-otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Invalid OTP.");

      setOtpVerified(true);
      setPhoneOtpToken(data.verificationToken);
      setOtpMessage("Phone number verified.");
      clearError("deliveryCode");
    } catch (err) {
      setOtpVerified(false);
      setPhoneOtpToken("");
      setErrors((prev) => ({
        ...prev,
        deliveryCode: err.message,
      }));
    } finally {
      setOtpLoading(false);
    }
  };

  const clearError = (field) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const newErrors = {};

    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";

    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Enter a valid email address";

    if (!phone.trim()) newErrors.phone = "Phone number is required";
    else if (!isValidPakistaniPhone(phone))
      newErrors.phone = "Enter a valid Pakistani number (03xxxxxxxxx)";

    if (!otpSent)
      newErrors.deliveryCode = "Send an OTP to your phone number first";
    else if (deliveryCode.some((d) => d === ""))
      newErrors.deliveryCode = "Enter the 4-digit OTP";
    else if (!otpVerified || !phoneOtpToken)
      newErrors.deliveryCode = "Verify your phone OTP before placing the order";

    if (!address.trim()) newErrors.address = "Address is required";
    if (!area.trim()) newErrors.area = "Area is required";
    if (!city.trim()) newErrors.city = "City is required";

    if (!selectedSlotRef.current)
      newErrors.selectedSlot =
        "Please select a delivery slot and click Confirm";

    if (paymentMethod !== "cod") {
      if (!mobileNumber.trim())
        newErrors.mobileNumber = "Mobile number is required";
      else if (!isValidPakistaniPhone(mobileNumber))
        newErrors.mobileNumber = "Enter a valid Pakistani number (03xxxxxxxxx)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // const handleUseMyLocation = () => {
  //   if (!navigator.geolocation) {
  //     setLocationError("Geolocation is not supported by your browser.");
  //     return;
  //   }

  //   setLocationLoading(true);
  //   setLocationError("");

  //   navigator.geolocation.getCurrentPosition(
  //     async (position) => {
  //       const { latitude, longitude } = position.coords;
  //       setCoords({ lat: latitude, lng: longitude });
  //       await reverseGeocode(latitude, longitude);
  //       setLocationLoading(false);
  //     },
  //     (err) => {
  //       setLocationLoading(false);
  //       const PERMISSION_DENIED = 1;
  //       const POSITION_UNAVAILABLE = 2;
  //       const TIMEOUT = 3;

  //       if (err.code === PERMISSION_DENIED) {
  //         setLocationError(
  //           "Location permission denied. Please enter address manually.",
  //         );
  //         return;
  //       }

  //       if (err.code === POSITION_UNAVAILABLE) {
  //         setLocationError(
  //           "Location unavailable. Please try again or enter your address manually.",
  //         );
  //         return;
  //       }

  //       if (err.code === TIMEOUT) {
  //         setLocationError(
  //           "Location request timed out. Please try again or enter your address manually.",
  //         );
  //         return;
  //       }

  //       setLocationError(
  //         err.message || "Unable to retrieve your location.",
  //       );
  //     },
  //     { enableHighAccuracy: true, timeout: 10000 },
  //   );
  // };

  useEffect(() => {
    let ignore = false;

    async function fetchDeliveryPricing() {
      try {
        const res = await fetch("/api/delivery-settings");
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Could not load pricing.");

        if (!ignore && data.settings) {
          setDeliveryPricing({
            shippingCharge: Number(data.settings.shippingCharge || 0),
            freeShippingThreshold: Number(
              data.settings.freeShippingThreshold || 0,
            ),
          });
        }
      } catch {
        if (!ignore) {
          setDeliveryPricing({
            shippingCharge: 30,
            freeShippingThreshold: 1000,
          });
        }
      }
    }

    fetchDeliveryPricing();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!coords || !mapContainerRef.current) return;

    if (!mapRef.current) {
      // Initialize map
      mapRef.current = L.map(mapContainerRef.current).setView(
        [coords.lat, coords.lng],
        16,
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(mapRef.current);

      markerRef.current = L.marker([coords.lat, coords.lng], {
        draggable: true,
      }).addTo(mapRef.current);

      markerRef.current.on("dragend", (e) => {
        const { lat, lng } = e.target.getLatLng();
        setCoords({ lat, lng });
        reverseGeocode(lat, lng);
      });
    } else {
      // Update existing map/marker position
      mapRef.current.setView([coords.lat, coords.lng], 16);
      markerRef.current.setLatLng([coords.lat, coords.lng]);
    }
  }, [coords]);

  // Cleanup map on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const handleCheckout = async () => {
    if (!validate()) {
      document.querySelector(".field-error")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    setPaymentLoading(true);
    const orderId = "ORD-" + Date.now();

    const orderData = {
      orderId,
      userId: user?._id || user?.userId || "guest",
      customer: { firstName, lastName, email, phone },
      delivery: { address, houseNo, area, city, deliverHere },
      deliverySlot: selectedSlotRef.current, //  use ref not state
      deliveryCode: deliveryCode.join(""),
      orderNote,
      items: cart,
      subTotal,
      shipCharges,
      totalPrice,
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "pending" : "paid",
      phoneOtpToken,
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
          setErrors({
            general: payData.responseDesc || "EasyPaisa payment failed",
          });
          setPaymentLoading(false);
          return;
        }
      }

      // ── Save order ────────────────────────────────────────
      const res = await fetch("/api/order/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // body: JSON.stringify(orderData),
        body: JSON.stringify({
          ...orderData,
          deliverySlot: selectedSlot, //  { dateLabel, time, type }
        }),
      });
      const data = await res.json();

      if (res.ok) {
        clearCart();
        navigate("/order-success", {
          state: {
            orderId: data.orderId,
            name: firstName,
            paymentMethod,
            totalPrice,
          },
        });
      } else {
        setErrors({
          general: data.message || "Order failed. Please try again.",
        });
      }
    } catch {
      setErrors({ general: "Something went wrong. Please try again." });
    } finally {
      setPaymentLoading(false);
    }
  };

  const ErrorMsg = ({ field }) =>
    errors[field] ? <span className="field-error">{errors[field]}</span> : null;

  return (
    <>
      <Header />

      <div className="checkout_wrapper">
        <div className="mian_container">
          <div>
            <button
              className="back_to"
              type="button"
              onClick={() => navigate("/cart")}
            >
              ← Back to Cart
            </button>
          </div>
          <h2>Checkout</h2>

          <div className="checkkout_mian">
            <div className="cart_contact_main">
              {/* ── Contact Information ─────────────────────── */}
              <div className="cart_contact">
                <h2 className="section-title">Contact Information</h2>

                <div className="cart_contacts_inner">
                  <div className="form_group">
                    <label>
                      First Name <span className="text-danger">*</span>
                    </label>
                    <input
                      className={`input-field ${errors.firstName ? "input-error" : ""}`}
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        clearError("firstName");
                      }}
                    />
                    <ErrorMsg field="firstName" />
                  </div>

                  <div className="form_group">
                    <label>
                      Last Name <span className="text-danger">*</span>
                    </label>
                    <input
                      className={`input-field ${errors.lastName ? "input-error" : ""}`}
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                        clearError("lastName");
                      }}
                    />
                    <ErrorMsg field="lastName" />
                  </div>

                  <div className="form_group">
                    <label>
                      Email <span className="text-danger">*</span>
                    </label>
                    <input
                      className={`input-field ${errors.email ? "input-error" : ""}`}
                      type="email"
                      placeholder="example@email.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        clearError("email");
                      }}
                    />
                    <ErrorMsg field="email" />
                  </div>

                  <div className="form_group">
                    <label>
                      Phone <span className="text-danger">*</span>
                    </label>
                    <input
                      className={`input-field ${errors.phone ? "input-error" : ""}`}
                      type="tel"
                      placeholder="03001234567"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        resetPhoneOtp();
                        clearError("phone");
                        clearError("deliveryCode");
                      }}
                    />
                    <ErrorMsg field="phone" />
                  </div>
                </div>

                {/* OTP */}
                <div className="opt_wrapper">
                  <label>
                    Phone OTP <span className="text-danger">*</span>
                  </label>
                  <div className="otp_actions">
                    <button
                      type="button"
                      className="otp_action_btn"
                      onClick={handleSendOtp}
                      disabled={otpLoading || !isValidPakistaniPhone(phone)}
                    >
                      {otpSent ? "Resend OTP" : "Send OTP"}
                    </button>
                    {otpVerified && (
                      <span className="otp_verified">Verified</span>
                    )}
                  </div>
                  <div className="opt_wrapper_inner">
                    {deliveryCode.map((digit, i) => (
                      <input
                        key={i}
                        id={`otp-${i}`}
                        className={`input-field ${errors.deliveryCode ? "input-error" : ""}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        disabled={!otpSent || otpVerified}
                        onChange={(e) => handleCodeChange(e.target.value, i)}
                        onKeyDown={(e) => handleCodeKeyDown(e, i)}
                      />
                    ))}
                  </div>
                  {otpSent && !otpVerified && (
                    <button
                      type="button"
                      className="otp_verify_btn"
                      onClick={handleVerifyOtp}
                      disabled={
                        otpLoading || deliveryCode.some((digit) => !digit)
                      }
                    >
                      {otpLoading ? "Checking..." : "Verify OTP"}
                    </button>
                  )}
                  <ErrorMsg field="deliveryCode" />
                  {otpMessage && (
                    <p
                      className={
                        otpVerified ? "otp_success_text" : "otp_hint_text"
                      }
                    >
                      {otpMessage}
                    </p>
                  )}
                  <p>
                    Verify your Pakistani mobile number before placing the
                    order.
                  </p>
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

                 {/* <button
                type="button"
                className="use-location-btn"
                onClick={handleUseMyLocation}
                disabled={locationLoading}
              >
                📍{" "}
                {locationLoading
                  ? "Detecting location..."
                  : "Use my current location"}
              </button>  */}
                {locationError && (
                  <span className="field-error">{locationError}</span>
                )}

                <div className="delv_info_wrapper">
                  {/* ...existing Address, House No, Area, City fields unchanged */}
                  <div className="input_group">
                    <label>
                      Address <span className="text-danger">*</span>
                    </label>
                    <input
                      className={`input-field ${errors.address ? "input-error" : ""}`}
                      type="text"
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        clearError("address");
                      }}
                    />
                    <ErrorMsg field="address" />
                  </div>

                  <div className="input_group">
                    <label>House No, Apartment, Suite, etc.</label>
                    <input
                      className="input-field"
                      type="text"
                      value={houseNo}
                      onChange={(e) => setHouseNo(e.target.value)}
                    />
                  </div>

                  <div className="cart_contacts_inner">
                    <div className="form_group">
                      <label>
                        Area <span className="text-danger">*</span>
                      </label>
                      <input
                        className={`input-field ${errors.area ? "input-error" : ""}`}
                        type="text"
                        value={area}
                        onChange={(e) => {
                          setArea(e.target.value);
                          clearError("area");
                        }}
                      />
                      <ErrorMsg field="area" />
                    </div>
                    <div className="form_group">
                      <label>
                        City <span className="text-danger">*</span>
                      </label>
                      <input
                        className={`input-field ${errors.city ? "input-error" : ""}`}
                        type="text"
                        value={city}
                        onChange={(e) => {
                          setCity(e.target.value);
                          clearError("city");
                        }}
                      />
                      <ErrorMsg field="city" />
                    </div>
                  </div>
                  <div>
                    <label>We will deliver here</label>
                    <input
                      className="input-field"
                      type="text"
                      value={deliverHere}
                      onChange={(e) => setDeliverHere(e.target.value)}
                    />
                    {coords && (
                      <>
                        <div
                          ref={mapContainerRef}
                          className="checkout-map"
                        ></div>
                        <p className="map-hint">
                          Drag the pin to set your exact delivery location.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Delivery Slots ──────────────────────────── */}
              <div className="cart_contact">
                <div className="delv_slots_wrapper">
                  <h2 className="section-title">Delivery Timings</h2>
                  <div className="express_delivery">
                    <h4>9:00 AM - 12:00 PM</h4>
                    <p className="delv_time">
                      We will deliver your order within 10-15 Minuts.
                    </p>
                    <div className="delivery_section">
                      <div className="how_to_delvery">
                        <h2 className="section-title">How to Order</h2>
                        <div className="d-felx-delvery">
                          <div className="count_div">1</div>
                          <div>
                            <h3>Call or whatsApp</h3>
                            <p>
                              Reach us at +92 3013827812 with your order
                              details.
                            </p>
                          </div>
                        </div>
                        <div className="d-felx-delvery">
                          <div className="count_div">2</div>
                          <div>
                            <h3>Confirm Your Order</h3>
                            <p>
                              Once we receive your order, we will confirm it via
                              call or WhatsApp.
                            </p>
                          </div>
                        </div>
                        <div className="d-felx-delvery">
                          <div className="count_div">3</div>
                          <div>
                            <h3>Fast Delivery</h3>
                            <p>
                              We will deliver your order within{" "}
                              <b>10-15 Minuts.</b>
                            </p>
                          </div>
                        </div>
                        <div className="d-felx-delvery">
                          <div className="count_div">4</div>
                          <div>
                            <h3>Receive at Your Door</h3>
                            <p>
                              Sit back and relax. Your order will be delivered
                              promptly.
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="delv_charge">
                        <h2 className="section-title">Delivery Charges</h2>
                        <div className="d-felx-delvery">
                          <div className="count_div">✓</div>
                          <p>
                            Express Delivery Charges only <b>Rs. 30</b>
                          </p>
                        </div>
                        <div className="d-felx-delvery">
                          <div className="count_div">✓</div>
                          <p>
                            <b>FREE</b> delivery on orders above{" "}
                            <b>Rs. 1,000</b>
                          </p>
                        </div>
                        <div className="d-felx-delvery">
                          <div className="count_div">✓</div>
                          <p>
                            Minimum order: <b>Rs. 500</b>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <h2 className="slot-section-title">
                    Select a Date and Time Slot
                  </h2>
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
                <p className="payment_methods_title">Payment method</p>

                <div className="payment_grid">
                  {[
                    {
                      value: "cod",
                      label: "Cash on delivery",
                      sub: "Pay at door",
                      logo: null,
                      emoji: "💵",
                    },
                    {
                      value: "jazzcash",
                      label: "JazzCash",
                      sub: "Mobile wallet",
                      logo: "../images/jazzcash-logo.png",
                      emoji: "📱",
                    },
                    {
                      value: "easypaisa",
                      label: "EasyPaisa",
                      sub: "Mobile wallet",
                      logo: "../images/easypaisa-logo.png",
                      emoji: "📲",
                    },
                  ].map(({ value, label, sub, logo, emoji }) => {
                    const active = paymentMethod === value;
                    return (
                      <label
                        key={value}
                        className={`payment_card ${active ? "active" : ""}`}
                        onClick={() => {
                          setPaymentMethod(value);
                          clearError("mobileNumber");
                        }}
                      >
                        <input
                          type="radio"
                          value={value}
                          checked={active}
                          onChange={() => {}}
                        />

                        {active && <div className="payment_checkmark">✓</div>}

                        <div className={`payment_icon_wrap ${value}`}>
                          {logo ? (
                            <img
                              src={logo}
                              alt={label}
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "block";
                              }}
                            />
                          ) : (
                            <span>{emoji}</span>
                          )}
                        </div>

                        <span className="payment_card_label">{label}</span>
                        <span className="payment_card_sub">{sub}</span>
                      </label>
                    );
                  })}
                </div>

                {/* Mobile number field for wallets */}
                {paymentMethod !== "cod" && (
                  <div className="payment_mobile_field">
                    <label>
                      Mobile number <span style={{ color: "#e53e3e" }}>*</span>
                    </label>
                    <input
                      className={`input-field ${errors.mobileNumber ? "input-error" : ""}`}
                      type="tel"
                      placeholder="03001234567"
                      value={mobileNumber}
                      onChange={(e) => {
                        setMobileNumber(e.target.value);
                        clearError("mobileNumber");
                      }}
                    />
                    <p className="payment_mobile_hint">
                      Enter the number linked to your wallet
                    </p>
                    <ErrorMsg field="mobileNumber" />
                  </div>
                )}
              </div>

              {/* payment end  */}

              {errors.general && (
                <p style={{ color: "#e53e3e", fontSize: 13, marginTop: 8 }}>
                  {errors.general}
                </p>
              )}

              <button
                className="place_order_btn"
                onClick={handleCheckout}
                disabled={paymentLoading}
              >
                {paymentLoading ? "Processing..." : "Place Order"}
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </>
  );
};

export default Checkout;
