import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { cartCount } = useCart(); // ✅ on utilise cartCount

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        {/* Logo */}
        <Link className="navbar-brand" to="/">
          LivresGourmands.net
        </Link>

        <div className="d-flex gap-3">
          {/* Panier */}
          <Link to="/panier" className="btn btn-outline-warning">
            Panier{" "}
            <span className="badge bg-warning text-dark ms-1">
              {cartCount}
            </span>
          </Link>

          {/* Auth */}
          {isAuthenticated ? (
            <>
              <span className="navbar-text text-white">
                Bonjour, {user?.nom}
              </span>
              <button className="btn btn-outline-light" onClick={logout}>
                Déconnexion
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-outline-light">
              Connexion
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
