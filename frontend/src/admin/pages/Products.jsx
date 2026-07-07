import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
// import "../../admin/pages/Products.css";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function Products() {
  const [products, refreshProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const navigate = useNavigate();



  useEffect(() => {
    fetch("http://149.104.79.29:5000/api/products")
      .then((res) => res.json())
      .then((data) => refreshProducts(data));
  }, []);

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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    await fetch(`/api/products/${id}`, {
      method: "DELETE",
    });
    refreshProducts(products.filter((p) => p._id !== id));
  };

  return (
    <div className="all-pro-wrapper">
      <div className="sidebar_hide">
        <Sidebar />
      </div>
      <div className="admin_outer">
        <div className="db_topbar">
          <Navbar title="All Products" />
        </div>

        <section className="All-pro-main">
          {/* Category Tabs */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              margin: "20px 0",
            }}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "20px",
                  border: "none",
                  cursor: "pointer",
                  background: activeCategory === cat ? "#4CAF50" : "#eee",
                  color: activeCategory === cat ? "white" : "black",
                  fontWeight: activeCategory === cat ? "bold" : "normal",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="add_pro_div">
            <NavLink to="/admin/add-product" className="add_new_product_btn">
              <span>+</span> Add Products
            </NavLink>
          </div>
          {/* Products Grid */}
          <div className="products-grid">
            {filteredProducts.length === 0 ? (
              <p>No products found</p>
            ) : (
              filteredProducts.map((product) => (
                // Replace the product-card div with this:
                <div className="product-card" key={product._id}>
                  <span className="product-img">
                    {product.image ? (
                      <img src={product.image} alt={product.name} />
                    ) : (
                      <div className="no-image-placeholder">No Image</div>
                    )}
                    {product.stock === 0 && (
                      <span className="soldout-badge">Sold Out</span>
                    )}
                  </span>
                  <div className="product-detail">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-price">Price: {product.price}</p>

                    <p
                      className="product-stock"
                      style={{
                        color:
                          product.stock === 0
                            ? "red"
                            : product.stock <= 5
                              ? "orange"
                              : "green",
                        fontWeight: "bold",
                      }}
                    >
                      {product.stock === 0
                        ? "Sold Out"
                        : `Stock: ${product.stock}`}
                      {product.stock > 0 && product.stock <= 5 && " ⚠️ Low"}
                    </p>

                    <div>
                      <button
                        className="edit-btn"
                        onClick={() =>
                          navigate(`/admin/products/edit/${product._id}`)
                        }
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(product._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Products;
