import { Route, Routes, Navigate, useLocation } from "react-router-dom";
// import AdminLogin from "./admin/pages/AdminLogin";
// import Dashboard from './admin/pages/Dashboard'
// import Navbar from "./admin/components/Navbar";
import "./App.css";
import Products from "./admin/pages/Products";
import AddProduct from "./admin/pages/AddProduct";
import EditProduct from "./admin/pages/EditProduct";
import Home from "./user/pages/index";
import About from "./user/pages/About";
import Contact from "./user/pages/Contact";
import ReturnRefundPolicy from "./user/pages/ReturnRefundPolicy";
import ResetPassword from "./user/pages/ResetPassword";
import { CartProvider } from "./context/CartContext";
import WhatsAppChat from "./user/components/WhatsAppChat";
import Checkout from "./user/pages/Checkout";
import CartPage from "./user/pages/CartPage";
import OrderSuccess from "./user/pages/OrderSuccess";
import AdminOrders from "./admin/pages/AdminOrders";
import AdminLogin from "./admin/pages/AdminLogin";
import Dashboard from "./admin/pages/Dashboard";
import ProfilePage from "./user/pages/ProfilePage";
import ProductDetailPage from "./user/pages/ProductDetailPage";
import Categories from "./admin/pages/Categories";
import Users from "./admin/pages/Users";
import AdminProfile from "./admin/pages/AdminProfile";
import DeliverySlotSettings from "./admin/pages/DeliverySlotSettings";
import AddCategory from "./admin/pages/AddCategory";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("adminToken");
  return token ? children : <Navigate to="/admin/login" />;
}

function App() {
  const location = useLocation();
  const showWhatsApp = !location.pathname.startsWith("/admin");

  return (
    <>
      {/* <Navbar /> */}

      <CartProvider>
        <Routes>
          <Route path="/admin/products/edit/:id" element={<EditProduct />} />
          <Route path="/admin/products" element={<Products />}></Route>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/return-refund-policy" element={<ReturnRefundPolicy />} />
          <Route path="/admin/add-product" element={<AddProduct />} />
          <Route path="/admin/Categories" element={<Categories />} />
          <Route path="/admin/Add-category" element={<AddCategory />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route
            path="/admin/delivery-slots"
            element={
              <ProtectedRoute>
                <DeliverySlotSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute>
                <AdminProfile />
              </ProtectedRoute>
            }
          />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
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
        {showWhatsApp && <WhatsAppChat />}
      </CartProvider>
    </>
  );
}

export default App;
