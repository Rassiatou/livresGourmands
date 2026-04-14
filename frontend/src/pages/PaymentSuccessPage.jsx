import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api/axiosClient";
import { useCart } from "../context/CartContext.jsx";

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const idCommande = searchParams.get("commande");
    const sessionId = searchParams.get("session_id");
    if (!idCommande || !sessionId) {
      setError("Informations de paiement manquantes.");
      setLoading(false);
      return;
    }

    async function confirmPayment() {
      try {
        await api.post(`/commandes/${idCommande}/confirm-payment`, {
          session_id: sessionId,
        });
        clearCart();
        setSuccess("Paiement confirmé. Votre commande est en cours de traitement.");
      } catch (err) {
        setError(
          err.response?.data?.error ||
            "Le paiement n'a pas pu être confirmé automatiquement."
        );
      } finally {
        setLoading(false);
      }
    }

    confirmPayment();
  }, [searchParams, clearCart]);

  return (
    <div className="container py-4">
      <h1 className="h3 mb-3">Paiement</h1>
      {loading && <p>Validation du paiement en cours...</p>}
      {!loading && error && <div className="alert alert-danger">{error}</div>}
      {!loading && success && <div className="alert alert-success">{success}</div>}
      <div className="d-flex gap-2">
        <Link to="/" className="btn btn-primary">
          Retour à l'accueil
        </Link>
        <Link to="/panier" className="btn btn-outline-secondary">
          Voir le panier
        </Link>
      </div>
    </div>
  );
}
