import { useCart } from "../../context/CartContext";
import { useState } from "react";

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const [address, setAddress] = useState("");

  const totalPrice = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
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
    <div>
      <h2>Checkout</h2>

      <textarea
        placeholder="Enter Address"
        onChange={(e) => setAddress(e.target.value)}
      />

      <h3>Total: Rs {totalPrice}</h3>

      <button onClick={handleCheckout}>
        Place Order
      </button>
    </div>
  );
};

export default Checkout;