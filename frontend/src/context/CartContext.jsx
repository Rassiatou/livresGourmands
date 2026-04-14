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
    const ouvrageId = ouvrage.id ?? ouvrage.idOuvrage;
    const normalizedQty = Number(quantity) > 0 ? Number(quantity) : 1;
    const maxStock =
      ouvrage.stock != null && Number(ouvrage.stock) >= 0
        ? Number(ouvrage.stock)
        : null;

    setItems((prev) => {
      const existing = prev.find((p) => p.id === ouvrageId);
      if (existing) {
        const nextQty = existing.quantity + normalizedQty;
        const safeQty = maxStock != null ? Math.min(nextQty, maxStock) : nextQty;
        return prev.map((p) =>
          p.id === ouvrageId
            ? { ...p, quantity: safeQty }
            : p
        );
      }
      const safeInitialQty =
        maxStock != null ? Math.min(normalizedQty, maxStock) : normalizedQty;
      return [...prev, { ...ouvrage, id: ouvrageId, quantity: safeInitialQty }];
    });
  };

  // Supprimer un ouvrage
  const removeFromCart = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Modifier la quantité
  const updateQuantity = (id, quantity) => {
    const nextQty = Number(quantity);
    if (!Number.isFinite(nextQty) || nextQty <= 0) {
      removeFromCart(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity:
                item.stock != null && Number(item.stock) >= 0
                  ? Math.min(nextQty, Number(item.stock))
                  : nextQty,
            }
          : item
      )
    );
  };

  const incrementQuantity = (id) => {
    const current = items.find((item) => item.id === id);
    if (!current) return;
    updateQuantity(id, current.quantity + 1);
  };

  const decrementQuantity = (id) => {
    const current = items.find((item) => item.id === id);
    if (!current) return;
    updateQuantity(id, current.quantity - 1);
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
        incrementQuantity,
        decrementQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);
