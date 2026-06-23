import { useEffect, useState } from "react";
import "./AddProduct.css";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function AddCategory() {
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");

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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // STEP 1: Basic validation
    if (!categoryName.trim()) {
      setErrors({ categoryName: "Category name is required" });
      return;
    }

    // STEP 2: ✅ Save image to localStorage FIRST before any async/return
    const existingImages = JSON.parse(
      localStorage.getItem("categoryImages") || "{}"
    );
    existingImages[categoryName.trim()] = image || "";
    localStorage.setItem("categoryImages", JSON.stringify(existingImages));

    // STEP 3: Duplicate check using already loaded categories state (no re-fetch)
    const normalizedInput = categoryName.trim().toLowerCase();
    if (categories.some((cat) => cat.toLowerCase() === normalizedInput)) {
      setErrors({ categoryName: "This category already exists" });
      return;
    }

    // STEP 4: Submit
    setSubmitting(true);
    setErrors({});

    try {
      await fetch("/api/products/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${categoryName.trim()} Placeholder`,
          price: 0,
          category: categoryName.trim(),
          stock: 0,
          description: description || "Auto-created category placeholder",
          image: image || null,
        }),
      });

      setCategories((prev) => [...prev, categoryName.trim()]);
      alert(`Category "${categoryName.trim()}" added successfully!`);
      setCategoryName("");
      setDescription("");
      setImage("");
    } catch (err) {
      console.error(err);
      alert("Failed to add category");
    }

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
              setErrors({});
            }}
            className="add-pro-input"
            style={{ borderColor: errors.categoryName ? "red" : "" }}
          />
          {errors.categoryName && (
            <p style={errorStyle}>{errors.categoryName}</p>
          )}

          <label className="pro-label">Description</label>
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="add-pro-input"
          />

          <label className="pro-label">Category Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="add-pro-input"
          />
          {image && (
            <img
              src={image}
              alt="preview"
              style={{
                width: "100px",
                height: "100px",
                objectFit: "cover",
                borderRadius: "8px",
                marginTop: "8px",
              }}
            />
          )}

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
