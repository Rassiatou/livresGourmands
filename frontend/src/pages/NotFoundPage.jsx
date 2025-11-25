import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="container text-center">
      <h1 className="mt-5">404</h1>
      <p>Oups, cette page n’existe pas.</p>
      <Link to="/" className="btn btn-primary">
        Retour à l’accueil
      </Link>
    </div>
  );
}

export default NotFoundPage;
