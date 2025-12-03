"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type CartItem = {
  isResale?: boolean;
  _id: string;
  eventID: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  eventDate?: string;
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  cartTotal: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // 1. Učitaj košaricu tek nakon mountanja (Client side)
  useEffect(() => {
    setIsMounted(true);
    const storedCart = localStorage.getItem("cartItems");
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (error) {
        console.error("Failed to parse cart from local storage");
      }
    }
  }, []);

  // 2. Spremi u localStorage na promjenu
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
    }
  }, [cartItems, isMounted]);

  const addToCart = (item: CartItem) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((i) => i._id === item._id);

      if (existingItem) {
        // --- POPRAVAK: Ako je Resale karta, NE povećavaj količinu ---
        if (existingItem.isResale) {
          // Možemo vratiti iste iteme (ništa se ne mijenja) ili baciti toast poruku
          return prevItems;
        }
        // -----------------------------------------------------------

        return prevItems.map((i) =>
          i._id === item._id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }

      return [...prevItems, item];
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item._id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cartItems");
  };

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // OBRISALI SMO ONAJ IF (!isMounted) RETURN CHILDREN BLOK!
  // Provider se mora renderirati uvijek.

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, clearCart, cartTotal }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart mora se koristiti unutar CartProvider-a");
  }
  return context;
};
