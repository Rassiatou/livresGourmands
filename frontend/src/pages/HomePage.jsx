import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosClient";
import { useCart } from "../context/CartContext.jsx";

export default function HomePage() {
  const [ouvrages, setOuvrages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { addToCart } = useCart();

  // ─────────────────────────────
  // Charger les catégories
  // ─────────────────────────────
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await api.get("/categories", { params: { limit: 100 } });

        console.log("API /categories =>", res.data);

        let items = [];

        // 🔥 TON API renvoie un tableau direct :
        // [ {id:1, nom:"..."}, {id:2, nom:"..."}, ... ]
        if (Array.isArray(res.data)) {
          items = res.data;
        }

        setCategories(items);
      } catch (err) {
        console.error("Erreur /categories", err);
        setCategories([]);
      }
    }

    fetchCategories();
  }, []);

  // ─────────────────────────────
  // Charger les ouvrages
  // ─────────────────────────────
  useEffect(() => {
    async function fetchOuvrages() {
      try {
        setLoading(true);
        setError("");

        const params = {};
        if (search.trim() !== "") params.texte = search.trim(); 
        if (selectedCategory) params.categorie = selectedCategory;

        const res = await api.get("/ouvrages", { params });

        console.log("API /ouvrages =>", res.data);

        let items = [];

        // 🔥 TON API renvoie aussi un tableau direct
        if (Array.isArray(res.data)) {
          items = res.data;
        }

        setOuvrages(items);
      } catch (err) {
        console.error("Erreur /ouvrages", err);
        setError("Impossible de charger les ouvrages.");
        setOuvrages([]);
      } finally {
        setLoading(false);
      }
    }

    fetchOuvrages();
  }, [search, selectedCategory]);

  // Aller à la page détail
  function handleDetails(id) {
    navigate(`/ouvrages/${id}`);
  }

  // Ajouter au panier
  function handleAddToCart(ouvrage) {
    try {
      addToCart(ouvrage, 1);
    } catch (err) {
      console.error("Erreur addToCart", err);
      alert("Impossible d'ajouter au panier.");
    }
  }

  return (
    <div className="py-4">
      <h1 className="display-4 fw-bold">Bienvenue sur LivresGourmands.net</h1>
      <p className="lead text-muted">
        Découvrez notre sélection de livres gourmands et ajoutez vos coups de cœur à votre panier.
      </p>

      {/* Recherche */}
      <div className="mt-4 mb-3">
        <label className="form-label fw-semibold">Recherche par titre ou auteur</label>
        <input
          type="text"
          className="form-control"
          placeholder="Ex : pâtisserie, chocolat, Ottolenghi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Catégories */}
      <div className="mb-4">
        <label className="form-label fw-semibold">Catégorie</label>
        <select
          className="form-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">Toutes les catégories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nom}
            </option>
          ))}
        </select>
      </div>

      {/* Liste des ouvrages */}
      <h2 className="h4 mb-3">Nos ouvrages</h2>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <p>Chargement des ouvrages...</p>}
      {!loading && ouvrages.length === 0 && !error && <p>Aucun ouvrage trouvé pour ces filtres.</p>}

      <div className="row g-3">
        {ouvrages.map((ouvrage) => (
          <div key={ouvrage.id} className="col-md-3">
            <div className="card h-100">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{ouvrage.titre}</h5>
                <h6 className="card-subtitle mb-2 text-muted">{ouvrage.auteur}</h6>
                <p className="fw-bold mb-1">{parseFloat(ouvrage.prix).toFixed(2)} $</p>
                <p className="card-text flex-grow-1 text-truncate">{ouvrage.description}</p>

                <div className="d-flex gap-2 mt-3">
                  <button className="btn btn-outline-secondary btn-sm" onClick={() => handleDetails(ouvrage.id)}>
                    Détails
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={() => handleAddToCart(ouvrage)}>
                    Ajouter
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
