"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface CartItem {
  id: number; // product id
  variant_id: number; // variant id (unique per size/color)
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextProps {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (variant_id: number) => void;
  clearCart: () => void;
  updateQuantity: (variant_id: number, quantity: number) => void;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: CartItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.variant_id === item.variant_id);

      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.variant_id === item.variant_id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }

      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (variant_id: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.variant_id !== variant_id));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  const updateQuantity = (variant_id: number, quantity: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.variant_id === variant_id ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, clearCart, updateQuantity }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
