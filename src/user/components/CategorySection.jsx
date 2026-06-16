import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import "./CategorySection.css";

export const CategorySection = ({ products }) => {
  const [searchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState(
    searchParams.get("category") || "All",
  );
  const { cart, addToCart, removeFromCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setActiveCategory(cat);
  }, [searchParams]);

  const getQty = (productId) => {
    const item = cart.find((i) => i._id === productId);
    return item ? item.quantity : 0;
  };

  const categories = [
    "All",
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];

  const filteredProducts =
    activeCategory === "All"
      ? products
      : products.filter((p) => p.category === activeCategory);

  const categoryImages = {
    All: "../images/cart-icon.png",
    Breakfast: "../images/plain-bread.jpg",
    Cooking: "../images/dalda.jpeg",
    Dairy: "../images/olper1.jpeg",
    Beverages: "../images/olper1.jpeg",
  };
  console.log(categoryImages);

  return (
    <section className="cat_section">
      <div className="cat_tabs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`cat_tab ${activeCategory === cat ? "active" : ""}`}
          >
            <img
              src={categoryImages[cat] || "/images/cart-icon.png"}
              alt={cat}
              className="cat_tab_img"
            />
            <span className="cat_tab_overlay"></span>
            <span className="cat_tab_label">{cat}</span>
          </button>
        ))}
      </div>

      <div className="products-grid">
        {filteredProducts.length === 0 ? (
          <p>No products found</p>
        ) : (
          filteredProducts.map((product) => {
            const qty = getQty(product._id);
            return (
              <div
                className="product-card"
                key={product._id}
                onClick={() => navigate(`/product/${product._id}`)}
                style={{ cursor: "pointer" }}
              >
                <span className="product-img">
                  <img src={product.image} alt={product.name} />
                </span>
                <div className="product-detail">
                  <h3 className="product-name">{product.name}</h3>
                  <div className="product-price-wrapper">
                    <span className="product-price">Rs {product.price} /-</span>
                    {product.originalPrice &&
                      product.originalPrice > product.price && (
                        <span className="product-original-price">
                          Rs {product.originalPrice} /-
                        </span>
                      )}
                  </div>
                  <p
                    className="product-stock"
                    style={{
                      color: product.stock === 0 ? "red" : "inherit",
                      fontWeight: product.stock === 0 ? "bold" : "normal",
                    }}
                  >
                    {product.stock === 0
                      ? "Sold Out"
                      : `Stock: ${product.stock}`}
                  </p>
                  <div
                    className="add_to_card_wrapper"
                    onClick={(e) => e.stopPropagation()}
                  >
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
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
