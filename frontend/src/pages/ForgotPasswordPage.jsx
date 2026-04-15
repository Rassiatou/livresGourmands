import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axiosClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await api.post("/auth/forgot-password", { email });
      setSuccess(
        res.data?.message ||
          "Si ce compte existe, vous recevrez un email de réinitialisation."
      );
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Impossible de générer le lien de réinitialisation."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="row justify-content-center mt-5">
      <div className="col-md-6 col-lg-5">
        <div className="auth-card">
          <h1 className="h3 mb-3 fw-bold text-center">Mot de passe oublié</h1>
          <p className="text-muted text-center mb-4">
            Entrez votre adresse courriel pour générer un lien de réinitialisation.
          </p>

          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

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

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? "Envoi en cours..." : "Envoyer l'email"}
            </button>
          </form>

          <p className="mt-3 text-center text-muted">
            Retour à la <Link to="/login">connexion</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
