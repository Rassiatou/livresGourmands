import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // si tu veux rediriger vers la page précédente après login
  const from = location.state?.from?.pathname || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password); // appelle AuthContext → /api/auth/login
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);

      // message custom ou celui de l’API
      const apiMessage =
        err.response?.data?.message ||
        "Impossible de vous connecter. Vérifiez vos identifiants.";
      setError(apiMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="row justify-content-center mt-5">
      <div className="col-md-5">
        <h1 className="h3 mb-3 fw-bold text-center">Connexion</h1>
        <p className="text-muted text-center mb-4">
          Connectez-vous pour accéder à votre panier et à vos commandes.
        </p>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Adresse courriel</label>
            <input
              type="email"
              className="form-control"
              placeholder="vous@example.com"
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
              placeholder="Votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>

        <p className="mt-3 text-center text-muted">
          Pas encore de compte ?{" "}
          <a href="/register">Créer un compte</a>
        </p>
      </div>
    </div>
  );
}
