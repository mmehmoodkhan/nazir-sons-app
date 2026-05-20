import { Route, Routes, Navigate } from "react-router-dom";
// import AdminLogin from "./admin/pages/AdminLogin";
// import Dashboard from './admin/pages/Dashboard'
// import Navbar from "./admin/components/Navbar";
import "./App.css";
import Products from "./admin/pages/Products";
import AddProduct from "./admin/pages/AddProduct";
import EditProduct from "./admin/pages/EditProduct";
import Home from "./user/pages/index";
import { CartProvider } from "./context/CartContext";
import Checkout from "./user/pages/Checkout";
import CartPage from "./user/pages/CartPage";
import OrderSuccess from "./user/pages/OrderSuccess";
import AdminOrders from "./admin/pages/AdminOrders";
import AdminLogin from "./admin/pages/AdminLogin";
import Dashboard from "./admin/pages/Dashboard";
function App() {
  function ProtectedRoute({ children }) {
  const token = localStorage.getItem("adminToken");
  return token ? children : <Navigate to="/admin/login" />;
}
  return (
    <>
      {/* <Navbar /> */}

      <CartProvider>
        <Routes>
          <Route path="/admin/products/edit/:id" element={<EditProduct />} />
          <Route path="/admin/products" element={<Products />}></Route>
          <Route path="/" element={<Home />} />
          <Route path="/admin/add-product" element={<AddProduct />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          {/* <Route path="/admin/dashboard" element={<Dashboard/> } /> */}
          <Route path="*" element={<h1>404 Not Found</h1>}></Route>

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </CartProvider>
    </>
  );
}

export default App;
