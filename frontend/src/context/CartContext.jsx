import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();
const STORAGE_KEY = "lg_cart";

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sauvegarde dans localStorage à chaque changement
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  // Ajouter un ouvrage au panier
  const addToCart = (ouvrage, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.id === ouvrage.id);
      if (existing) {
        return prev.map((p) =>
          p.id === ouvrage.id
            ? { ...p, quantity: p.quantity + quantity }
            : p
        );
      }
      return [...prev, { ...ouvrage, quantity }];
    });
  };

  // Supprimer un ouvrage
  const removeFromCart = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Modifier la quantité
  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  // Vider le panier
  const clearCart = () => setItems([]);

  // Nombre total d’articles
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Total en $
  const cartTotal = items.reduce(
    (sum, item) => sum + item.quantity * parseFloat(item.prix || 0),
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
