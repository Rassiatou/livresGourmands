import { useState } from "react";
import { toCuisineCategoryLabel } from "../utils/cuisineCategories.js";

function ProductCard({ ouvrage, onAddToCart, onViewDetails }) {
  const ouvrageId = ouvrage.id ?? ouvrage.idOuvrage;
  const imageUrl = ouvrage.image_url || ouvrage.imageUrl;
  const [imageBroken, setImageBroken] = useState(false);
  const categoryLabel = toCuisineCategoryLabel(
    ouvrage.categorie_id,
    ouvrage.categorie_nom || ouvrage.categorie || "Cuisine"
  );
  const stock = Number(ouvrage.stock ?? 0);
  const hasStock = stock > 0;

  return (
    <div className="card cuisine-book-card h-100 border-0 shadow-sm">
      {imageUrl && !imageBroken ? (
        <img
          src={imageUrl}
          className="card-img-top cuisine-book-cover"
          alt={ouvrage.titre}
          loading="lazy"
          decoding="async"
          onError={() => setImageBroken(true)}
        />
      ) : (
        <div className="cuisine-book-cover cuisine-book-cover-fallback d-flex align-items-center justify-content-center">
          <span className="fs-1" aria-hidden="true">📘</span>
        </div>
      )}
      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-center mb-2 gap-2">
          <span className="badge text-bg-light border">{categoryLabel}</span>
          <span className={`badge ${hasStock ? "text-bg-success" : "text-bg-secondary"}`}>
            {hasStock ? `Stock ${stock}` : "Rupture"}
          </span>
        </div>
        <h5 className="card-title line-clamp-2">{ouvrage.titre}</h5>
        {ouvrage.auteur && (
          <p className="card-text text-muted mb-1 small">{ouvrage.auteur}</p>
        )}
        <p className="fw-bold mb-2">
          {parseFloat(ouvrage.prix || 0).toFixed(2)} $
        </p>
        <p className="card-text small text-muted line-clamp-3">
          {ouvrage.description}
        </p>

        <div className="mt-auto d-flex justify-content-between gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => onViewDetails?.(ouvrageId)}
          >
            Détails
          </button>
          <button
            className="btn btn-primary btn-sm"
            type="button"
            onClick={() => onAddToCart(ouvrage)}
            disabled={!hasStock}
          >
            {hasStock ? "Ajouter" : "Indisponible"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
