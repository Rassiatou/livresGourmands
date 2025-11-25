import { Link, NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

function Header() {
  const { cartCount } = useCart();

  return (
    <header>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <Link className="navbar-brand" to="/">
            LivresGourmands.net
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="mainNav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <NavLink to="/" className="nav-link">
                  Accueil
                </NavLink>
              </li>
            </ul>

            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <NavLink to="/panier" className="nav-link">
                  Panier{" "}
                  <span className="badge bg-warning text-dark ms-1">
                    {cartCount}
                  </span>
                </NavLink>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;
