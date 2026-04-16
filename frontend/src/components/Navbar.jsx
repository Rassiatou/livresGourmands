import { Link, NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { cartCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const displayName = user?.nom || user?.email || "Mon compte";
  const roleLabel = user?.role || "client";
  const initial = displayName?.trim()?.charAt(0)?.toUpperCase() || "C";

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">

        {/* Logo + lien vers accueil */}
        <Link className="navbar-brand fw-bold" to="/">
          LivresGourmands.net
        </Link>

        {/* Bouton responsive */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="mainNavbar">
          
          {/* Menu gauche */}
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  "nav-link" + (isActive ? " active fw-bold" : "")
                }
              >
                Accueil
              </NavLink>
            </li>
          </ul>

          {/* Menu droit */}
          <div className="d-flex gap-2 align-items-center">
            <Link to="/panier" className="btn btn-outline-warning">
              Panier{" "}
              <span className="badge bg-warning text-dark ms-1">
                {cartCount}
              </span>
            </Link>

            {!isAuthenticated ? (
              <>
                <Link to="/register" className="btn btn-warning text-dark">
                  Creer un compte
                </Link>
                <Link to="/login" className="btn btn-outline-light">
                  Connexion
                </Link>
              </>
            ) : (
              <div className="account-chip">
                <div className="account-avatar">{initial}</div>
                <div className="account-meta">
                  <div className="account-name" title={displayName}>
                    {displayName}
                  </div>
                  <div className="account-role">Compte {roleLabel}</div>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-light account-logout-btn"
                  onClick={logout}
                >
                  Deconnexion
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}
