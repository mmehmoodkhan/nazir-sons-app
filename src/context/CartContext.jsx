// src/context/CartContext.jsx
import { createContext, useContext, useState } from "react";

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
    // try {
    //   return JSON.parse(localStorage.getItem("user")) || null;
    // } catch {
    //   return null;
    // }
  });
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
