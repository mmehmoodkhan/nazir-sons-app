import Header from "../components/header";
import "./index.css";
import { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";

export default function Home() {
  const [products, setProducts] = useState([]);
  const { cart, addToCart, removeFromCart } = useCart();

  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, []);

  // get quantity of a product already in cart
  const getQty = (productId) => {
    const item = cart.find((i) => i._id === productId);
    return item ? item.quantity : 0;
  };

  return (
    <>
      <Header />
      <div className="main_page_wrapper">
        <div className="products-grid">
          {products.map((product) => {
            const qty = getQty(product._id);
            return (
              <div className="product-card" key={product._id}>
                <span className="product-img">
                  <img src={product.image} alt={product.name} />
                </span>
                <div className="product-detail">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-price">Rs {product.price} /-</p>
                  <p className="product-stock">Stock: {product.stock}</p>

                  <div className="add_to_card_wrapper">
                    {qty === 0 ? (
                      // ── not in cart — show Add button
                      <button
                        className="btn_add_to"
                        onClick={() => addToCart(product)}
                      >
                        Add to Cart
                      </button>
                    ) : (
                      // ── in cart — show qty controls
                      <div className="qty_controls">
                        <button
                          className="qty_btn"
                          onClick={() => removeFromCart(product._id)}
                        >
                          −
                        </button>
                        <span className="qty_count">{qty}</span>
                        <button
                          className="qty_btn"
                          onClick={() => addToCart(product)}
                          disabled={qty >= product.stock}
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}