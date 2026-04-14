import { useState } from "react";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosClient";

function CartPage() {
  const {
    items,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    removeFromCart,
    clearCart,
    cartTotal,
  } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutSuccess, setCheckoutSuccess] = useState("");

  const handleQuantityChange = (id, val) => {
    const qty = parseInt(val || "0", 10);
    updateQuantity(id, qty);
  };

  const handleCheckout = async () => {
    setCheckoutError("");
    setCheckoutSuccess("");
    if (!isAuthenticated || !user) {
      navigate("/login", { state: { from: { pathname: "/panier" } } });
      return;
    }
    if (!items.length) return;

    const payload = {
      user_id: user.id ?? user.idUser,
      items: items.map((item) => ({
        ouvrage_id: item.id ?? item.idOuvrage,
        quantite: Number(item.quantity || 1),
        prix_unitaire: Number(item.prix || 0),
      })),
    };

    try {
      setIsSubmitting(true);
      const cmdRes = await api.post("/commandes", payload);
      const idCommande = cmdRes.data?.idCommande || cmdRes.data?.id;
      const payRes = await api.post(`/commandes/${idCommande}/checkout-session`);
      const checkoutUrl = payRes.data?.checkout_url;
      if (!checkoutUrl) {
        throw new Error("URL Stripe manquante");
      }
      setCheckoutSuccess("Redirection vers la page de paiement sécurisée...");
      window.location.assign(checkoutUrl);
    } catch (err) {
      setCheckoutError(
        err.response?.data?.error ||
          "Impossible de passer la commande pour le moment."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container">
      <h1 className="mb-4">Mon panier</h1>

      {!items.length ? (
        <div className="empty-state text-center">
          <h2 className="h5 mb-2">Votre panier est vide</h2>
          <p className="text-muted mb-0">
            Ajoutez quelques ouvrages pour commencer votre commande.
          </p>
        </div>
      ) : (
        <>
          {checkoutError && (
            <div className="alert alert-danger">{checkoutError}</div>
          )}
          {checkoutSuccess && (
            <div className="alert alert-success">{checkoutSuccess}</div>
          )}
          <div className="table-responsive mb-3">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Ouvrage</th>
                  <th className="text-center">Prix</th>
                  <th className="text-center">Quantité</th>
                  <th className="text-end">Sous-total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const prix = parseFloat(item.prix || 0);
                  const subtotal = prix * item.quantity;
                  return (
                    <tr key={item.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          {item.image_url && (
                            <img
                              src={item.image_url}
                              alt={item.titre}
                              loading="lazy"
                              decoding="async"
                              style={{
                                width: "50px",
                                height: "70px",
                                objectFit: "cover",
                                marginRight: "0.75rem",
                              }}
                            />
                          )}
                          <div>
                            <div className="fw-semibold">{item.titre}</div>
                            <div className="text-muted small">
                              {item.auteur}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="text-center">
                        {prix.toFixed(2)} $
                      </td>
                      <td className="text-center">
                        <div className="d-inline-flex align-items-center gap-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => decrementQuantity(item.id)}
                            aria-label="Diminuer la quantite"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min={1}
                            className="form-control d-inline-block text-center"
                            style={{ width: "72px" }}
                            value={item.quantity}
                            onChange={(e) =>
                              handleQuantityChange(item.id, e.target.value)
                            }
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => incrementQuantity(item.id)}
                            aria-label="Augmenter la quantite"
                            disabled={
                              item.stock != null &&
                              Number(item.stock) >= 0 &&
                              item.quantity >= Number(item.stock)
                            }
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="text-end">
                        {subtotal.toFixed(2)} $
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeFromCart(item.id)}
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-between align-items-center">
            <button
              className="btn btn-outline-secondary"
              onClick={clearCart}
            >
              Vider le panier
            </button>

            <div className="text-end">
              <div className="fs-5 fw-bold">
                Total : {cartTotal.toFixed(2)} $
              </div>
              <button
                className="btn btn-success mt-2"
                onClick={handleCheckout}
                disabled={isSubmitting || !items.length}
              >
                {isSubmitting ? "Traitement en cours..." : "Passer au paiement"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default CartPage;
