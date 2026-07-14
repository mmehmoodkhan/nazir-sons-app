import { useEffect, useState } from "react";
import axios from "axios";
import { useCart } from "../../context/CartContext";
import "./AddProduct.css";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function AddCategory() {
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const { refreshProducts } = useCart();


  // Load categories from backend
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await axios.get(
          "http://149.104.79.29/api/categories"
        );

        setCategories(res.data);

      } catch (error) {
        console.log("Category load error:", error);
      }
    };

    loadCategories();

  }, []);



  // Select image
  const handleImageUpload = (e) => {
    const file = e.target.files[0];

    if (file) {
      setImage(file);
    }
  };



  // Submit category
  const handleSubmit = async (e) => {
    e.preventDefault();


    if (!categoryName.trim()) {
      setErrors({
        categoryName: "Category name is required"
      });
      return;
    }


    // Duplicate check
    const exists = categories.some(
      (cat) =>
        cat.name.toLowerCase() ===
        categoryName.trim().toLowerCase()
    );


    if (exists) {
      setErrors({
        categoryName: "Category already exists"
      });
      return;
    }



    setSubmitting(true);
    setErrors({});


    try {

      const formData = new FormData();

      formData.append(
        "name",
        categoryName.trim()
      );


      formData.append(
        "description",
        description
      );


      if (image) {
        formData.append(
          "image",
          image
        );
      }



      const res = await axios.post(
        "http://149.104.79.29/api/categories",
        formData,
        {
          headers:{
            "Content-Type":"multipart/form-data"
          }
        }
      );


      console.log(
        "Category Added:",
        res.data
      );


      // update list
      setCategories((prev)=>[
        ...prev,
        res.data
      ]);



      alert(
        "Category added successfully"
      );


      // clear form
      setCategoryName("");
      setDescription("");
      setImage(null);


      refreshProducts?.();



    } catch(error){

      console.log(
        "Add category error:",
        error
      );

      alert(
        "Failed to add category"
      );

    }


    setSubmitting(false);

  };



  const errorStyle = {
    color:"red",
    fontSize:"12px",
    marginTop:"-8px",
    marginBottom:"4px"
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



        <form
          onSubmit={handleSubmit}
          className="product-form"
        >


          <label className="pro-label">
            Category Name
          </label>


          <input

            type="text"

            placeholder="Enter category name"

            value={categoryName}

            onChange={(e)=>{

              setCategoryName(
                e.target.value
              );

              setErrors({});

            }}

            className="add-pro-input"

          />



          {
            errors.categoryName &&
            (
              <p style={errorStyle}>
                {errors.categoryName}
              </p>
            )
          }




          <label className="pro-label">
            Description
          </label>



          <textarea

            placeholder="Description"

            value={description}

            onChange={(e)=>
              setDescription(e.target.value)
            }

            className="add-pro-input"

          />





          <label className="pro-label">
            Category Image
          </label>




          <input

            type="file"

            accept="image/*"

            onChange={handleImageUpload}

            className="add-pro-input"

          />




          {
            image &&
            (
              <img

                src={
                  URL.createObjectURL(image)
                }

                alt="preview"

                style={{

                  width:"100px",

                  height:"100px",

                  objectFit:"cover",

                  borderRadius:"8px",

                  marginTop:"10px"

                }}

              />
            )
          }





          <button

            type="submit"

            className="pro-submit-button"

            disabled={submitting}

          >

            {
              submitting
              ? "Adding..."
              : "Add Category"
            }

          </button>




        </form>


      </div>


    </div>

  );

}


export default AddCategory;