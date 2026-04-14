import ProductCard from "./ProductCard.jsx";

function ProductGrid({ ouvrages, onAddToCart, onViewDetails }) {
  if (!ouvrages?.length) {
    return <p>Aucun ouvrage trouvé.</p>;
  }

  return (
    <div className="row g-3">
      {ouvrages.map((o) => (
        <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={o.id ?? o.idOuvrage}>
          <ProductCard
            ouvrage={o}
            onAddToCart={onAddToCart}
            onViewDetails={onViewDetails}
          />
        </div>
      ))}
    </div>
  );
}

export default ProductGrid;
