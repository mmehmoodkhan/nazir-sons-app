import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import Header from "../components/header";
import "./ProductDetailPage.css";
import { Footer } from "../components/Footer";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cart, addToCart, removeFromCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => setProduct(data))
      .finally(() => setLoading(false));
  }, [id]);

  const getQty = () => {
    const item = cart.find((i) => i._id === id);
    return item ? item.quantity : 0;
  };

  if (loading)
    return (
      <>
        <Header />
        <p className="product-detail-loading">Loading...</p>
      </>
    );

  if (!product || !product._id)
    return (
      <>
        <Header />
        <p className="product-detail-loading">Product not found.</p>
      </>
    );

  const qty = getQty();

  return (
    <>
      <Header />
      <div className="mian_container">
        <div className="product-detail-page">
          {/* <h2 className="heddings">Product Detail</h2> */}
          <div className="product-detail-image">
            <span className="pro-detail-img">
              <img src={product.image} alt={product.name} />
            </span>
          </div>
          <div className="product-detail-info">
            <h1 className="product-detail-name">{product.name}</h1>
            {product.category && (
              <p className="product-detail-category">
                Category: {product.category}
              </p>
            )}
            <div className="product-detail-price-wrapper">
              <span className="product-detail-price">
                Rs {product.price} /-
              </span>
              {product.originalPrice &&
                product.originalPrice > product.price && (
                  <span className="product-detail-original-price">
                    Rs {product.originalPrice} /-
                  </span>
                )}
            </div>
            {product.description && (
              <p className="product-detail-description">
                {product.description}
              </p>
            )}
            <p
              className="product-detail-stock"
              style={{
                color: product.stock === 0 ? "red" : "inherit",
                fontWeight: product.stock === 0 ? "bold" : "normal",
              }}
            >
              {product.stock === 0 ? "Sold Out" : `Stock: ${product.stock}`}
            </p>

            <div className="add_to_card_wrapper">
              {product.stock === 0 ? (
                <button className="btn_soldout" disabled>
                  Sold Out
                </button>
              ) : qty === 0 ? (
                <button
                  className="btn_add_to"
                  onClick={() => addToCart(product)}
                >
                  Add to Cart
                </button>
              ) : (
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

            <button className="back-btn" onClick={() => navigate(-1)}>
              ← Back
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
