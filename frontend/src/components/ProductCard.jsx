import { Link } from "react-router-dom";

function ProductCard({ ouvrage, onAddToCart }) {
  return (
    <div className="card h-100">
      {ouvrage.image_url && (
        <img
          src={ouvrage.image_url}
          className="card-img-top"
          alt={ouvrage.titre}
          style={{ objectFit: "cover", height: "180px" }}
        />
      )}
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{ouvrage.titre}</h5>
        {ouvrage.auteur && (
          <p className="card-text text-muted mb-1">{ouvrage.auteur}</p>
        )}
        <p className="fw-bold mb-2">
          {parseFloat(ouvrage.prix || 0).toFixed(2)} $
        </p>
        <p className="card-text small text-truncate">
          {ouvrage.description}
        </p>

        <div className="mt-auto d-flex justify-content-between gap-2">
          <Link
            to={`/ouvrages/${ouvrage.id}`}
            className="btn btn-outline-secondary btn-sm"
          >
            Détails
          </Link>
          <button
            className="btn btn-primary btn-sm"
            type="button"
            onClick={() => onAddToCart(ouvrage)}
          >
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
