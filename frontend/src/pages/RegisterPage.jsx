import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosClient";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/register", {
        nom,
        email,
        password,
      });

      await login(email, password);

      navigate("/");
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Impossible de créer le compte. Essayez encore.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="row justify-content-center mt-5">
      <div className="col-md-5">
        <div className="auth-card">
          <h1 className="h3 mb-3 fw-bold text-center">Créer un compte</h1>
          <p className="text-muted text-center mb-4">
            Inscrivez-vous pour accéder à votre panier et vos commandes.
          </p>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Nom complet</label>
              <input
                type="text"
                className="form-control"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Adresse courriel</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Mot de passe</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <button
              className="btn btn-primary w-100"
              disabled={loading}
              type="submit"
            >
              {loading ? "Création du compte..." : "Créer le compte"}
            </button>
          </form>

          <p className="mt-3 text-center text-muted">
            Vous avez déjà un compte ? <Link to="/login">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
