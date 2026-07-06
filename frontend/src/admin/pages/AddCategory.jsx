import { useEffect, useState } from "react";
import { useCart } from "../../context/CartContext";
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
  const { refreshProducts } = useCart();
  const [lastSavedPreview, setLastSavedPreview] = useState("");

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        const fromProducts = [
          ...new Set(data.map((p) => p.category).filter(Boolean)),
        ];
        const stored = Object.keys(
          JSON.parse(localStorage.getItem("categoryImages") || "{}"),
        );
        const combined = [...new Set([...fromProducts, ...stored])];
        setCategories(combined);
      } catch (err) {
        setCategories(
          Object.keys(
            JSON.parse(localStorage.getItem("categoryImages") || "{}"),
          ),
        );
      }
    };

    loadCategories();

    const onCategoriesUpdated = () => loadCategories();
    window.addEventListener("categories:updated", onCategoriesUpdated);
    return () =>
      window.removeEventListener("categories:updated", onCategoriesUpdated);
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

    // STEP 3: Duplicate check using already loaded categories state (no re-fetch)
    const normalizedInput = categoryName.trim().toLowerCase();
    if (categories.some((cat) => cat.toLowerCase() === normalizedInput)) {
      setErrors({ categoryName: "This category already exists" });
      return;
    }

    // STEP 4: Persist category image mapping and update UI (don't create placeholder product)
    setSubmitting(true);
    setErrors({});

    try {
      const existingImages = JSON.parse(
        localStorage.getItem("categoryImages") || "{}",
      );
      existingImages[categoryName.trim()] = image || "";
      try {
        localStorage.setItem("categoryImages", JSON.stringify(existingImages));
        // debug: read back and expose preview for troubleshooting
        const readBack = localStorage.getItem("categoryImages");
        console.log("categoryImages saved:", readBack);
        setLastSavedPreview(readBack || "");
      } catch (err) {
        console.error("Failed to write categoryImages to localStorage:", err);
        alert("Failed to save category image locally.");
        setSubmitting(false);
        return;
      }

      setCategories((prev) => [...prev, categoryName.trim()]);
      alert(`Category "${categoryName.trim()}" added successfully!`);
      setCategoryName("");
      setDescription("");
      setImage("");

      // Notify other components in same tab
      try {
        refreshProducts?.();
      } catch {}
      window.dispatchEvent(new Event("categories:updated"));
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
