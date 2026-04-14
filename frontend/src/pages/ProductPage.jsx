import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchOuvrageById } from "../services/api.js";
import { useCart } from "../context/CartContext.jsx";
import Loader from "../components/Loader.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";

function ProductPage() {
  const { id } = useParams();
  const [ouvrage, setOuvrage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchOuvrageById(id);
        setOuvrage(data);
      } catch (e) {
        console.error(e);
        setError("Ouvrage introuvable.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleAdd = () => {
    if (ouvrage) addToCart(ouvrage, quantity);
  };

  if (loading) return <Loader />;
  if (error) return <div className="container"><ErrorMessage message={error} /></div>;
  if (!ouvrage) return <div className="container"><p>Ouvrage introuvable.</p></div>;

  const prix = parseFloat(ouvrage.prix || 0).toFixed(2);

  return (
    <div className="container">
      <div className="row g-4">
        <div className="col-md-5">
          {ouvrage.image_url && (
            <img
              src={ouvrage.image_url}
              alt={ouvrage.titre}
              className="img-fluid rounded"
              loading="lazy"
              decoding="async"
            />
          )}
        </div>
        <div className="col-md-7">
          <h1>{ouvrage.titre}</h1>
          {ouvrage.auteur && (
            <p className="text-muted">par {ouvrage.auteur}</p>
          )}

          <p className="fs-4 fw-bold mb-3">{prix} $</p>

          {ouvrage.stock !== undefined && (
            <p>
              <strong>Stock :</strong>{" "}
              {ouvrage.stock > 0 ? `${ouvrage.stock} exemplaire(s)` : "Épuisé"}
            </p>
          )}

          {ouvrage.description && (
            <p className="mt-3">{ouvrage.description}</p>
          )}

          <div className="d-flex align-items-center gap-2 mt-4">
            <label className="form-label mb-0">Quantité</label>
            <input
              type="number"
              min={1}
              className="form-control"
              style={{ width: "90px" }}
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.max(1, parseInt(e.target.value || "1", 10)))
              }
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAdd}
              disabled={ouvrage.stock !== undefined && ouvrage.stock <= 0}
            >
              Ajouter au panier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductPage;
