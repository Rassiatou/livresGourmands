import { Link } from "react-router-dom";

export default function PaymentCancelPage() {
  return (
    <div className="container py-4">
      <h1 className="h3 mb-3">Paiement annulé</h1>
      <div className="alert alert-warning">
        Votre paiement a été annulé. Vous pouvez reprendre votre commande à tout moment.
      </div>
      <div className="d-flex gap-2">
        <Link to="/panier" className="btn btn-primary">
          Retourner au panier
        </Link>
        <Link to="/" className="btn btn-outline-secondary">
          Continuer vos achats
        </Link>
      </div>
    </div>
  );
}
