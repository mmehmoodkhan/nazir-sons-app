import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
// import "../../admin/pages/Products.css";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import "./Categories.css";

const UNCATEGORIZED_LABEL = "(Uncategorized)";

const loadCategoryImages = () => {
  try {
    return JSON.parse(localStorage.getItem("categoryImages") || "{}");
  } catch {
    return {};
  }
};

const saveCategoryImages = (images) => {
  localStorage.setItem("categoryImages", JSON.stringify(images));
};

function Categories() {
  const [products, refreshProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [categoryImages, setCategoryImages] = useState({});

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => refreshProducts(data));
  }, []);

  useEffect(() => {
    const readImages = () => {
      const imgs = loadCategoryImages();
      setCategoryImages(imgs);
    };
    readImages();
    window.addEventListener("focus", readImages);
    return () => window.removeEventListener("focus", readImages);
  }, []);

  const getProductCategory = (product) =>
    product.category?.trim() || UNCATEGORIZED_LABEL;

  const categoryCounts = products.reduce((acc, p) => {
    const cat = getProductCategory(p);
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const categoryList = [...new Set(Object.keys(categoryCounts))];

  const getCatImage = (cat) => {
    const key = Object.keys(categoryImages).find(
      (k) => k.toLowerCase() === cat.toLowerCase()
    );
    return key ? categoryImages[key] : null;
  };

  const handleEditCategory = async (oldName) => {
    const newName = window.prompt("Rename category", oldName);
    if (!newName || newName.trim() === "" || newName === oldName) return;

    const toUpdate = products.filter((p) => getProductCategory(p) === oldName);
    try {
      await Promise.all(
        toUpdate.map((p) =>
          fetch(`/api/products/${p._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...p, category: newName }),
          }),
        ),
      );

      const updatedImages = { ...categoryImages };
      if (updatedImages[oldName]) {
        updatedImages[newName] = updatedImages[oldName];
        delete updatedImages[oldName];
        saveCategoryImages(updatedImages);
        setCategoryImages(updatedImages);
      }

      const updated = products.map((p) =>
        getProductCategory(p) === oldName ? { ...p, category: newName } : p,
      );
      refreshProducts(updated);
    } catch (err) {
      console.error(err);
      alert("Failed to rename category");
    }
  };

  const handleDeleteCategory = async (catName) => {
    const productsInCategory = products.filter(
      (p) => getProductCategory(p) === catName
    );

    // Ask user what they want to do
    const choice = window.confirm(
      `Category "${catName}" has ${productsInCategory.length} product(s).\n\nClick OK to DELETE all products in this category.\nClick Cancel to just UNASSIGN them (keep products, remove category).`
    );

    try {
      if (choice) {
        // ✅ DELETE all products in this category
        await Promise.all(
          productsInCategory.map((p) =>
            fetch(`/api/products/${p._id}`, {
              method: "DELETE",
            })
          )
        );

        // Remove deleted products from local state
        const updated = products.filter(
          (p) => getProductCategory(p) !== catName
        );
        refreshProducts(updated);
      } else {
        // ✅ UNASSIGN — keep products but remove their category
        await Promise.all(
          productsInCategory.map((p) =>
            fetch(`/api/products/${p._id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...p, category: "" }),
            })
          )
        );

        // Update local state — move to uncategorized
        const updated = products.map((p) =>
          getProductCategory(p) === catName ? { ...p, category: "" } : p
        );
        refreshProducts(updated);
      }

      // Remove category image from localStorage either way
      const updatedImages = { ...categoryImages };
      delete updatedImages[catName];
      saveCategoryImages(updatedImages);
      setCategoryImages(updatedImages);

    } catch (err) {
      console.error(err);
      alert("Failed to delete category");
    }
  };

  return (
    <div className="all-pro-wrapper">
      <div className="sidebar_hide">
        <Sidebar />
      </div>
      <div className="admin_outer">
        <div className="db_topbar">
          <Navbar title="Categories" />
        </div>
        <section className="admin_Categories_main">
          <div className="add_pro_div">
            <NavLink to="/admin/add-category" className="add_new_product_btn">
              <span>+</span> Add Category
            </NavLink>
          </div>
          <div className="admin_cat_inner">
            <table className="admin_cat_table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Category</th>
                  <th>Count</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categoryList.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: "8px" }}>
                      No categories
                    </td>
                  </tr>
                )}
                {categoryList.map((cat) => (
                  <tr key={cat}>
                    <td>
                      {getCatImage(cat) ? (
                        <img
                          src={getCatImage(cat)}
                          alt={cat}
                          style={{
                            width: "48px",
                            height: "48px",
                            objectFit: "cover",
                            borderRadius: "8px",
                            border: "1px solid #e5e7eb",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "8px",
                            background: "#f3f4f6",
                            border: "1px dashed #d1d5db",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "20px",
                          }}
                        >
                          📁
                        </div>
                      )}
                    </td>
                    <td onClick={() => setActiveCategory(cat)}>{cat}</td>
                    <td>{categoryCounts[cat] || 0}</td>
                    <td>
                      {cat === UNCATEGORIZED_LABEL
                        ? "Uncategorized"
                        : "Categorized"}
                    </td>
                    <td>
                      <button
                        onClick={() => handleEditCategory(cat)}
                        className="edit_cat"
                      >
                        Edit
                      </button>
                      <button
                        className="delete_cat"
                        onClick={() => handleDeleteCategory(cat)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Categories;
