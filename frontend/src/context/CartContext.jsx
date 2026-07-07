// src/context/CartContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cart")) || [];
    } catch {
      return [];
    }
  });

  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [products, setProducts] = useState([]);

  //  NEW — fetch fresh products from backend
  const refreshProducts = async () => {
    try {
      const res = await fetch("http://149.104.79.29:5000/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Failed to refresh products:", err);
    }
  };

  //  Load products on app start
  useEffect(() => {
    refreshProducts();
  }, []);

  // Refresh user from server if token exists (keeps isVerified up-to-date)
  useEffect(() => {
    const refreshUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch("/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          // invalid token or session expired
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
          return;
        }
        const data = await res.json();
        if (data?.user) {
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        }
      } catch (err) {
        console.error("Failed to refresh user profile:", err);
      }
    };

    refreshUser();
  }, []);

  //  Validate cart against backend on every load
  useEffect(() => {
    const validateCart = async () => {
      const stored = JSON.parse(localStorage.getItem("cart") || "[]");
      if (stored.length === 0) return;

      try {
        const ids = stored.map((item) => item._id).join(",");
        const res = await fetch(`/api/products?ids=${ids}`);
        const freshProducts = await res.json();

        const updated = stored
          .map((cartItem) => {
            const fresh = freshProducts.find((p) => p._id === cartItem._id);

            if (!fresh) return null; // deleted from admin → remove silently

            return {
              ...cartItem,
              price: fresh.price,
              image: fresh.image,
              stock: fresh.stock ?? cartItem.stock,
              soldOut: fresh.stock === 0,
            };
          })
          .filter(Boolean);

        setCart(updated);
        localStorage.setItem("cart", JSON.stringify(updated));
      } catch (err) {
        console.error("Cart validation failed:", err);
        // Keep existing cart if fetch fails (no internet etc.)
      }
    };

    validateCart();
  }, []); // runs once on app load

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // const logout = () => {
  //   setUser(null);
  //   setCart([]);
  //   localStorage.removeItem("user");
  //   localStorage.removeItem("cart");
  // };
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      const next = existing
        ? prev.map((item) =>
            item._id === product._id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          )
        : [...prev, { ...product, quantity: 1 }];
      localStorage.setItem("cart", JSON.stringify(next));
      return next;
    });
  };

  const removeFromCart = (productId) => {
    setCart(
      (prev) =>
        prev
          .map((item) =>
            item._id === productId
              ? { ...item, quantity: item.quantity - 1 }
              : item,
          )
          .filter((item) => item.quantity > 0), // remove when qty hits 0
    );
  };

  // const removeFromCart = (id) => {
  //   setCart((prev) => {
  //     const next = prev.filter((item) => item._id !== id);
  //     localStorage.setItem("cart", JSON.stringify(next));
  //     return next;
  //   });
  // };
  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        clearCart,
        addToCart,
        removeFromCart,
        login,
        logout,
        user,
        products,
        refreshProducts,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
