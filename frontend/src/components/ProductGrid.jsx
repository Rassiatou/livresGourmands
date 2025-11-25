import ProductCard from "./ProductCard.jsx";

function ProductGrid({ ouvrages, onAddToCart }) {
  if (!ouvrages?.length) {
    return <p>Aucun ouvrage trouvé.</p>;
  }

  return (
    <div className="row g-3">
      {ouvrages.map((o) => (
        <div className="col-6 col-md-4 col-lg-3" key={o.id}>
          <ProductCard ouvrage={o} onAddToCart={onAddToCart} />
        </div>
      ))}
    </div>
  );
}

export default ProductGrid;
