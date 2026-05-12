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

  // ✅ Validate cart against backend on every load
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

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
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

  const removeFromCart = (id) => {
    setCart((prev) => {
      const next = prev.filter((item) => item._id !== id);
      localStorage.setItem("cart", JSON.stringify(next));
      return next;
    });
  };

  return (
    <CartContext.Provider
      value={{ cart, setCart, addToCart, removeFromCart, login, logout, user }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}