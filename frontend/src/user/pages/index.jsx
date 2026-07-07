import Header from "../components/header";
import "./index.css";
import { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import { HeroSlider } from "../components/HeroSlider";
import { CategorySection } from "../components/CategorySection";
import { Footer } from "../components/Footer";

export default function Home() {
  const [products, setProducts] = useState([]);
  const { cart, addToCart, removeFromCart } = useCart();

  useEffect(() => {
    fetch("http://149.104.79.29:5000/api/products")
      .then((res) => {
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        return res.json();
      })
      .then((data) => setProducts(data))
      .catch((err) => console.error("Failed to load products:", err));
  }, []);

  // get quantity of a product already in cart
  const getQty = (productId) => {
    const item = cart.find((i) => i._id === productId);
    return item ? item.quantity : 0;
  };

  return (
    <>
      <Header />
      <HeroSlider />

      <div className="main_page_wrapper">
        <div className="mian_container">
          <h2>Shop by Department</h2>
          <CategorySection products={products} />
        </div>
      </div>
      <Footer />
    </>
  );
}
