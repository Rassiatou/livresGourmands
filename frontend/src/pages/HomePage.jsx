import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosClient";
import { useCart } from "../context/CartContext.jsx";
import ProductGrid from "../components/ProductGrid.jsx";
import { toCuisineCategoryLabel } from "../utils/cuisineCategories.js";
import Loader from "../components/Loader.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";

const cuisineThemes = [
  {
    id: "patisserie",
    title: "Pâtisserie Maison",
    text: "Recettes gourmandes, techniques pas à pas et astuces de chef.",
    emoji: "🍰",
  },
  {
    id: "vege",
    title: "Cuisine Végétarienne",
    text: "Des plats équilibrés, colorés et faciles à cuisiner au quotidien.",
    emoji: "🥗",
  },
  {
    id: "monde",
    title: "Saveurs du Monde",
    text: "Voyage culinaire entre Méditerranée, Asie et Orient.",
    emoji: "🌍",
  },
  {
    id: "rapide",
    title: "Cuisine Express",
    text: "Des idées rapides pour bien manger même les soirs pressés.",
    emoji: "⚡",
  },
];

export default function HomePage() {
  const [ouvrages, setOuvrages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await api.get("/categories", { params: { limit: 100 } });

        let items = [];
        if (Array.isArray(res.data)) {
          items = res.data;
        }

        setCategories(
          items.map((cat) => ({
            ...cat,
            id: Number(cat.id ?? cat.idCategorie),
            nom: toCuisineCategoryLabel(cat.id ?? cat.idCategorie, cat.nom),
          }))
        );
      } catch {
        setCategories([]);
      }
    }

    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchOuvrages() {
      try {
        setLoading(true);
        setError("");

        const params = {};
        if (search.trim() !== "") params.texte = search.trim(); 
        if (selectedCategory) params.categorie = selectedCategory;

        const res = await api.get("/ouvrages", { params });

        let items = [];
        if (Array.isArray(res.data)) {
          items = res.data;
        }

        setOuvrages(items);
      } catch {
        setError("Impossible de charger les ouvrages pour le moment.");
        setOuvrages([]);
      } finally {
        setLoading(false);
      }
    }

    fetchOuvrages();
  }, [search, selectedCategory]);

  function handleDetails(id) {
    navigate(`/ouvrages/${id}`);
  }

  function handleAddToCart(ouvrage) {
    try {
      addToCart(ouvrage, 1);
    } catch {
      alert("Impossible d'ajouter cet ouvrage au panier.");
    }
  }

  return (
    <div className="py-4">
      <h1 className="display-5 fw-bold section-title">Bienvenue sur LivresGourmands</h1>
      <p className="lead text-muted">
        Découvrez notre sélection de livres de cuisine et trouvez votre prochaine source d'inspiration.
      </p>

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

      <h2 className="h4 mb-3">Inspirations cuisine</h2>
      <div className="row g-3 mb-4">
        {cuisineThemes.map((theme) => (
          <div key={theme.id} className="col-12 col-sm-6 col-lg-3">
            <article className="card cuisine-theme-card h-100 border-0 shadow-sm">
              <div className="card-body">
                <div className="fs-4 mb-2" aria-hidden="true">{theme.emoji}</div>
                <h3 className="h6 mb-2">{theme.title}</h3>
                <p className="text-muted small mb-0">{theme.text}</p>
              </div>
            </article>
          </div>
        ))}
      </div>

      <h2 className="h4 mb-3">Nos ouvrages</h2>

      {error && <ErrorMessage message={error} />}
      {loading && <Loader />}
      {!loading && ouvrages.length === 0 && !error && (
        <div className="empty-state text-center text-muted">
          Aucun ouvrage ne correspond à votre recherche pour le moment.
        </div>
      )}

      {!loading && ouvrages.length > 0 && (
        <ProductGrid
          ouvrages={ouvrages}
          onAddToCart={handleAddToCart}
          onViewDetails={handleDetails}
        />
      )}
    </div>
  );
}
