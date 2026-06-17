import { useEffect, useState } from "react";
import "./Products.css";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import "./Categories.css";

const UNCATEGORIZED_LABEL = "(Uncategorized)";

function Categories() {
  const [products, refreshProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => refreshProducts(data));
  }, []);

  const getProductCategory = (product) =>
    product.category?.trim() || UNCATEGORIZED_LABEL;

  // Get unique categories from products
  const categories = [
    "All",
    ...new Set(products.map((p) => getProductCategory(p))),
  ];

  // Build category counts
  const categoryCounts = products.reduce((acc, p) => {
    const cat = getProductCategory(p);
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const categoryList = [...new Set(Object.keys(categoryCounts))];

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

      // update local state
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
    if (!window.confirm(`Are you sure you want to remove category '${catName}' from all products?`))
      return;
    const toUpdate = products.filter((p) => getProductCategory(p) === catName);
    try {
      await Promise.all(
        toUpdate.map((p) =>
          fetch(`/api/products/${p._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...p, category: "" }),
          }),
        ),
      );

      const updated = products.map((p) =>
        getProductCategory(p) === catName ? { ...p, category: "" } : p,
      );
      refreshProducts(updated);
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
          <div className="admin_cat_inner">
            <table className="admin_cat_table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Count</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categoryList.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding: "8px" }}>
                      No categories
                    </td>
                  </tr>
                )}
                {categoryList.map((cat) => (
                  <tr key={cat}>
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
                      <button className="delete_cat" onClick={() => handleDeleteCategory(cat)}>
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
