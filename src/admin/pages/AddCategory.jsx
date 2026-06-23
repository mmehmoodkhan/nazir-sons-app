import { useEffect, useState } from "react";
import "./AddProduct.css";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function AddCategory() {
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        const unique = [
          ...new Set(data.map((p) => p.category).filter(Boolean)),
        ];
        setCategories(unique);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      setError("Category name is required");
      return;
    }

    if (categories.includes(categoryName.trim())) {
      setError("This category already exists");
      return;
    }

    setSubmitting(true);
    setError("");

    // Categories are tied to products — save a placeholder product with this category
    await fetch("/api/products/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `${categoryName.trim()} Placeholder`,
        price: 0,
        category: categoryName.trim(),
        stock: 0,
        description: "Auto-created category placeholder",
        image: "",
      }),
    });

    setCategories((prev) => [...prev, categoryName.trim()]);
    alert(`Category "${categoryName.trim()}" added successfully!`);
    setCategoryName("");
    setSubmitting(false);
  };

  const errorStyle = {
    color: "red",
    fontSize: "12px",
    marginTop: "-8px",
    marginBottom: "4px",
  };

  return (
    <div className="main-container-add-product">
      <div className="sidebar_hide">
        <Sidebar />
      </div>
      <div className="admin_outer">
        <div className="db_topbar">
          <Navbar title="Add Category" />
        </div>
        <form onSubmit={handleSubmit} className="product-form">
          <label className="pro-label">Category Name</label>
          <input
            type="text"
            placeholder="Enter category name"
            value={categoryName}
            onChange={(e) => {
              setCategoryName(e.target.value);
              setError("");
            }}
            className="add-pro-input"
            style={{ borderColor: error ? "red" : "" }}
          />
          {error && <p style={errorStyle}>{error}</p>}

          <button
            className="pro-submit-button"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Adding..." : "Add Category"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddCategory;
