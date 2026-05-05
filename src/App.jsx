import { Route, Routes } from "react-router-dom";
import AdminLogin from "./admin/pages/AdminLogin";
// import Dashboard from './admin/pages/Dashboard'
import Navbar from "./admin/components/Navbar";
import "./App.css";
import Products from "./admin/pages/Products";
import AddProduct from './admin/pages/AddProduct';
import EditProduct from "./admin/pages/EditProduct";
import Home from "./user/pages/index";
function App() {
  return (
    <>
      {/* <Navbar /> */}
      <Routes>
        {/* <Route path='/AdminLogin' element={AdminLogin}></Route> */}
        {/* <Route path='/Dashboard' element={Dashboard}></Route> */}
        <Route path="/admin/products/edit/:id" element={<EditProduct />} />
        {/* <Route path="/" element={<Products />}></Route> */}
        <Route path="/" element={<Home />} />
        <Route path="/admin/pages/add-product" element={<AddProduct />} />
        <Route path="*" element={<h1>404 Not Found</h1>}></Route>
      </Routes>
    </>
  );
}

export default App;
