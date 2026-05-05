import Header from "../components/header";
import "./index.css";
import { useState, useEffect } from "react";

export default function Home() {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, []);
  return (
    <>
      <Header />
      <div className="main_page_wrapper">
        <div className="products-grid">
          {products.map((product) => (
            <div className="product-card" key={product._id}>
              <span className="product-img">
                <img src={product.image} alt={product.name} />
              </span>
              <div className="product-detail">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-price">Price: {product.price} /-</p>
                <p className="product-stock">Stock: {product.stock}</p>
                <div className="add_to_card_wrapper"><button className="btn_add_to">Add to Cart </button></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
