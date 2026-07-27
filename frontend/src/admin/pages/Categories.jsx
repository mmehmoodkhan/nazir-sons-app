import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import "./Categories.css";
import { getImageUrl } from "../../utils/imageUrl";

const UNCATEGORIZED_LABEL = "(Uncategorized)";

function Categories() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");


  // Load products and categories
  const loadData = async () => {
    try {
      const productRes = await fetch("/api/products");
      const productData = await productRes.json();

      setProducts(productData);


      const categoryRes = await fetch("/api/categories");
      const categoryData = await categoryRes.json();

      setCategories(categoryData);

    } catch (error) {
      console.log("Load error:", error);
    }
  };


  useEffect(() => {
    loadData();
  }, []);



  const getProductCategory = (product) =>
    product.category?.trim() || UNCATEGORIZED_LABEL;



  const categoryCounts = products.reduce((acc, product) => {

    const cat = getProductCategory(product);

    acc[cat] = (acc[cat] || 0) + 1;

    return acc;

  }, {});



  const categoryList = categories.map(
    (cat) => cat.name
  );



  // Category image from backend
  const getCatImage = (categoryName) => {

    const category = categories.find(
      (cat) => cat.name === categoryName
    );


    if (!category?.image) {
      return null;
    }


    return getImageUrl(category.image);

  };



  // Rename category
  const handleEditCategory = async (oldName) => {

    const newName = window.prompt(
      "Rename category",
      oldName
    );


    if (
      !newName ||
      newName.trim() === "" ||
      newName === oldName
    ) {
      return;
    }


    try {

      const productsToUpdate = products.filter(
        (p) => getProductCategory(p) === oldName
      );


      await Promise.all(

        productsToUpdate.map((p) =>

          fetch(`/api/products/${p._id}`, {

            method: "PUT",

            headers: {
              "Content-Type": "application/json"
            },

            body: JSON.stringify({
              ...p,
              category: newName
            })

          })

        )

      );


      await loadData();


    } catch (error) {

      console.log(error);
      alert("Failed to rename category");

    }

  };




  // Delete category
  const handleDeleteCategory = async (catName) => {


    const confirmDelete = window.confirm(
      `Delete category "${catName}"?`
    );


    if (!confirmDelete) return;



    try {


      const productsInCategory = products.filter(
        (p) => getProductCategory(p) === catName
      );



      await Promise.all(

        productsInCategory.map((p) =>

          fetch(`/api/products/${p._id}`, {

            method: "PUT",

            headers: {
              "Content-Type": "application/json"
            },

            body: JSON.stringify({
              ...p,
              category: ""
            })

          })

        )

      );



      // Delete category from database

      const category = categories.find(
        (c) => c.name === catName
      );


      if (category) {

        await fetch(
          `/api/categories/${category._id}`,
          {
            method: "DELETE"
          }
        );

      }



      await loadData();



    } catch (error) {

      console.log(error);
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

            <NavLink
              to="/admin/add-category"
              className="add_new_product_btn"
            >

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


                {
                  categoryList.length === 0 &&

                  <tr>

                    <td colSpan="5">
                      No categories
                    </td>

                  </tr>
                }



                {
                  categoryList.map((cat) => (


                    <tr key={cat}>


                      <td>

                        {
                          getCatImage(cat)

                            ?

                            <img

                              src={getCatImage(cat)}

                              alt={cat}

                              style={{

                                width: "48px",
                                height: "48px",
                                objectFit: "cover",
                                borderRadius: "8px"

                              }}

                            />

                            :

                            <div>

                              📁

                            </div>

                        }


                      </td>



                      <td
                        onClick={() =>
                          setActiveCategory(cat)
                        }
                      >

                        {cat}

                      </td>



                      <td>

                        {categoryCounts[cat] || 0}

                      </td>



                      <td>

                        Categorized

                      </td>



                      <td>


                        <button

                          className="edit_cat"

                          onClick={() =>
                            handleEditCategory(cat)
                          }

                        >

                          Edit

                        </button>



                        <button

                          className="delete_cat"

                          onClick={() =>
                            handleDeleteCategory(cat)
                          }

                        >

                          Delete

                        </button>


                      </td>


                    </tr>


                  ))
                }


              </tbody>


            </table>


          </div>


        </section>


      </div>


    </div>

  );

}


export default Categories;
