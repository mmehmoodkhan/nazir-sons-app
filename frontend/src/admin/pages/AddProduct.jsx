import { useEffect, useState } from "react";
import "./AddProduct.css";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function AddProduct() {
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({}); 
  const [submitting, setSubmitting] = useState(false); //  prevent double submit
  const [form, setForm] = useState({
    name: "",
    price: "",
    originalPrice: "",
    category: "",
    stock: "",
    image: "",
    description: "",
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch("http://149.104.79.29:5000/api/products");
        const data = await res.json();
        const fromProducts = [
          ...new Set(data.map((p) => p.category).filter(Boolean)),
        ];
        const stored = Object.keys(JSON.parse(localStorage.getItem("categoryImages") || "{}"));
        const combined = [...new Set([...fromProducts, ...stored])];
        setCategories(combined);
      } catch (err) {
        const stored = Object.keys(JSON.parse(localStorage.getItem("categoryImages") || "{}"));
        setCategories(stored);
      }
    };

    loadCategories();

    const onCategoriesUpdated = () => loadCategories();
    window.addEventListener("categories:updated", onCategoriesUpdated);
    return () => window.removeEventListener("categories:updated", onCategoriesUpdated);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // ✅ clear error on change
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm({ ...form, image: reader.result });
      setErrors({ ...errors, image: "" }); // ✅ clear image error
    };
    reader.readAsDataURL(file);
  };

  const handleCategoryChange = (e) => {
    setForm({ ...form, category: e.target.value });
    setErrors({ ...errors, category: "" }); // ✅ clear error
  };

  // ✅ Validation function
  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Product name is required";
    if (!form.price || form.price <= 0)
      newErrors.price = "Valid price is required";
    if (!form.category.trim()) newErrors.category = "Category is required";
    if (!form.stock || form.stock < 0)
      newErrors.stock = "Stock quantity is required";
    if (!form.description.trim())
      newErrors.description = "Description is required";
    if (!form.image) newErrors.image = "Product image is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    //  Run validation
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    const payload = {
      ...form,
      originalPrice:
        form.originalPrice !== "" ? Number(form.originalPrice) : null,
    };
    await fetch("/api/products/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload), //  sends null or a number
    });

    alert("Product Added ");
    setErrors({});
    setForm({
      name: "",
      price: "",
      originalPrice: "",
      category: "",
      stock: "",
      image: "",
      description: "",
    });
  };

  // Reusable error message style
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
          <Navbar title="Add Product" />
        </div>
        <form onSubmit={handleSubmit} className="product-form">
          <label className="pro-label">Product Name</label>
          <input
            type="text"
            name="name"
            placeholder="Product Name"
            value={form.name}
            onChange={handleChange}
            className="add-pro-input"
            style={{ borderColor: errors.name ? "red" : "" }}
          />
          {errors.name && <p style={errorStyle}>{errors.name}</p>}

          <label className="pro-label">Price</label>
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={form.price}
            onChange={handleChange}
            className="add-pro-input"
            style={{ borderColor: errors.price ? "red" : "" }}
          />
          {errors.price && <p style={errorStyle}>{errors.price}</p>}
          <label className="pro-label">
            Original Price{" "}
            <span style={{ fontSize: "11px", color: "#999" }}>
              (optional — shows crossed out)
            </span>
          </label>
          <input
            type="number"
            name="originalPrice"
            placeholder="e.g. 1500"
            value={form.originalPrice}
            onChange={handleChange}
            className="add-pro-input"
          />
          <label className="pro-label">Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleCategoryChange}
            className="add-pro-input"
            style={{ borderColor: errors.category ? "red" : "" }}
          >
            <option value="">-- Select Category --</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && <p style={errorStyle}>{errors.category}</p>}
          {/* Inline 'Add New Category' removed. Use Add Category page to create categories. */}

          <label className="pro-label">Stock</label>
          <input
            type="number"
            name="stock"
            placeholder="Stock"
            value={form.stock}
            onChange={handleChange}
            className="add-pro-input"
            style={{ borderColor: errors.stock ? "red" : "" }}
          />
          {errors.stock && <p style={errorStyle}>{errors.stock}</p>}

          <label className="pro-label">Description</label>
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            className="add-pro-input"
            style={{ borderColor: errors.description ? "red" : "" }}
          />
          {errors.description && <p style={errorStyle}>{errors.description}</p>}

          <label className="pro-label">Product Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="add-pro-input"
            style={{ borderColor: errors.image ? "red" : "" }}
          />
          {errors.image && <p style={errorStyle}>{errors.image}</p>}
          {form.image && (
            <img
              src={form.image}
              alt="preview"
              style={{
                width: "100px",
                height: "100px",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />
          )}

          <button
            className="pro-submit-button"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Adding..." : "Add Product"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddProduct;
