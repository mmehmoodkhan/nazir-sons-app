import { Route, Routes } from "react-router-dom";
// import AdminLogin from "./admin/pages/AdminLogin";
// import Dashboard from './admin/pages/Dashboard'
// import Navbar from "./admin/components/Navbar";
import "./App.css";
// import Products from "./admin/pages/Products";
import AddProduct from "./admin/pages/AddProduct";
import EditProduct from "./admin/pages/EditProduct";
import Home from "./user/pages/index";
import { CartProvider } from "./context/CartContext";
import Checkout from "./user/pages/Checkout";
import CartPage from "./user/pages/CartPage";
import OrderSuccess from "./user/pages/OrderSuccess";
import AdminOrders from "./admin/pages/AdminOrders";
function App() {
  return (
    <>
      {/* <Navbar /> */}
      <CartProvider>
        <Routes>
          {/* <Route path='/AdminLogin' element={AdminLogin}></Route> */}
          {/* <Route path='/Dashboard' element={Dashboard}></Route> */}
          <Route path="/admin/products/edit/:id" element={<EditProduct />} />
          {/* <Route path="/" element={<Products />}></Route> */}
          <Route path="/" element={<Home />} />
          <Route path="/admin/add-product" element={<AddProduct />} />
          <Route path="/cart" element={<CartPage />} />
          {/* <Route path="/login" element={<LoginModal />} /> */}
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="*" element={<h1>404 Not Found</h1>}></Route>
          <Route path="/admin/orders" element={<AdminOrders />} />
        </Routes>
      </CartProvider>
    </>
  );
}

export default App;
