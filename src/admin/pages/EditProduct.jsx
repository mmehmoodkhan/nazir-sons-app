import { useEffect, useState } from "react";
// import "./Products.css";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useParams } from "react-router-dom";

export function EditProduct() {
  const [categories, setCategories] = useState([]);
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [errors, setErrors] = useState({}); //  error state
  const [submitting, setSubmitting] = useState(false); //  prevent double submit
  const { id } = useParams();
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
    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setForm({
          name: data.name || "",
          price: data.price || "",
          originalPrice: data.originalPrice ?? "",
          category: data.category || "",
          stock: data.stock || "",
          image: data.image || "",
          description: data.description || "",
        });
      });
  }, [id]);

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
    if (e.target.value === "__new__") {
      setIsNewCategory(true);
      setForm({ ...form, category: "" });
    } else {
      setIsNewCategory(false);
      setForm({ ...form, category: e.target.value });
      setErrors({ ...errors, category: "" }); // ✅ clear error
    }
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

  const handleUpdate = async (e) => {
    e.preventDefault();

    // ✅ Run validation
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
    await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSubmitting(false);
    setErrors({});
    alert("Product Updated ✅");
  };

  const errorStyle = {
    color: "red",
    fontSize: "12px",
    marginTop: "-8px",
    marginBottom: "4px",
  };

  return (
    <div className="main-container-add-product edit-product-container">
      <div className="sidebar_hide">
        <Sidebar />
      </div>
      <div className="admin_outer">
        <div className="db_topbar">
          <Navbar title="Edit Product" />
        </div>
        <form onSubmit={handleUpdate} className="product-form">
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
            value={isNewCategory ? "__new__" : form.category}
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
            <option value="__new__">+ Add New Category</option>
          </select>
          {errors.category && <p style={errorStyle}>{errors.category}</p>}

          {isNewCategory && (
            <>
              <label className="pro-label">New Category Name</label>
              <input
                type="text"
                placeholder="Enter new category"
                className="add-pro-input"
                value={form.category}
                onChange={(e) => {
                  setForm({ ...form, category: e.target.value });
                  setErrors({ ...errors, category: "" });
                }}
                style={{ borderColor: errors.category ? "red" : "" }}
              />
              {errors.category && <p style={errorStyle}>{errors.category}</p>}
            </>
          )}

          <label className="pro-label">Stock Quantity</label>
          <input
            type="number"
            name="stock"
            placeholder="Stock Quantity"
            value={form.stock}
            onChange={handleChange}
            className="add-pro-input"
            style={{ borderColor: errors.stock ? "red" : "" }}
          />
          {errors.stock && <p style={errorStyle}>{errors.stock}</p>}

          <input
            type="file"
            accept="image/*"
            id="imageInput"
            style={{ display: "none" }}
            onChange={handleImageUpload}
          />
          <img
            src={form.image || "https://placehold.co/100x100"}
            alt="Click to change"
            onClick={() => document.getElementById("imageInput").click()}
            style={{
              width: "100px",
              height: "100px",
              objectFit: "cover",
              borderRadius: "8px",
              cursor: "pointer",
              border: errors.image ? "2px dashed red" : "2px dashed #ccc",
            }}
          />
          <p style={{ fontSize: "12px", color: "#888" }}>
            Click image to change
          </p>
          {errors.image && <p style={errorStyle}>{errors.image}</p>}

          <label className="pro-label">Description</label>
          <textarea
            name="description"
            placeholder="Description"
            className="add-pro-input"
            value={form.description}
            onChange={handleChange}
            style={{ borderColor: errors.description ? "red" : "" }}
          />
          {errors.description && <p style={errorStyle}>{errors.description}</p>}

          <button
            className="pro-submit-button"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Updating..." : "Edit Product"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditProduct;
