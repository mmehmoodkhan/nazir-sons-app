import { useState } from "react";
import { useCart } from "../../context/CartContext";
import "./CategorySection.css";

export const CategorySection = ({ products }) => {
  const [activeCategory, setActiveCategory] = useState("All");
  const { cart, addToCart, removeFromCart } = useCart(); //  same cart context

  const getQty = (productId) => {
    const item = cart.find((i) => i._id === productId);
    return item ? item.quantity : 0;
  };

  // Get unique categories from products
  const categories = [
    "All",
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];

  // Filter products by selected category
  const filteredProducts =
    activeCategory === "All"
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <section className="cat_section">
      {/* ── Category Filter Tabs */}
      <div className="cat_tabs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`cat_tab ${activeCategory === cat ? "active" : ""}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Products Grid */}
      <div className="products-grid">
        {filteredProducts.length === 0 ? (
          <p>No products found</p>
        ) : (
          filteredProducts.map((product) => {
            const qty = getQty(product._id);
            return (
              <div className="product-card" key={product._id}>
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
                  <div className="add_to_card_wrapper">
                    {product.stock === 0 ? (
                      // ✅ Show Sold Out when stock is 0
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
                          disabled={qty >= product.stock} // already stops at stock limit
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                  {/* <div className="add_to_card_wrapper">
                    {qty === 0 ? (
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
                  </div> */}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
