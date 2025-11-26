import { Link, NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { cartCount } = useCart();

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
          <div className="d-flex gap-2">
            <Link to="/panier" className="btn btn-outline-warning">
              Panier{" "}
              <span className="badge bg-warning text-dark ms-1">
                {cartCount}
              </span>
            </Link>

            <Link to="/login" className="btn btn-outline-light">
              Connexion
            </Link>
          </div>

        </div>
      </div>
    </nav>
  );
}
