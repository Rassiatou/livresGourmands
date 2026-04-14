import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";
import categoriesRoutes from "./routes/categories.routes.js";
import ouvragesRoutes from "./routes/ouvrages.routes.js";
import avisRoutes from "./routes/avis.routes.js";
import commandesRoutes from "./routes/commandes.routes.js";
import commandesItemsRoutes from "./routes/commandesItems.routes.js";
import commentairesRoutes from "./routes/commentaires.routes.js";
import usersRoutes from "./routes/users.routes.js";
import panierRoutes from "./routes/panier.routes.js";
import panierItemsRoutes from "./routes/panierItems.routes.js";
import listesRoutes from "./routes/listes.routes.js";

dotenv.config();

const app = express();

// --- Middlewares globaux ---
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") ?? true,
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));

// --- Routes simples de test ---
app.get("/", (req, res) => {
  res.send("API LivresGourmands en ligne ✅");
});

app.get("/health", (req, res) => res.json({ ok: true }));

// --- ROUTES API PRINCIPALES ---

// Authentification (spécification)
app.use("/api/auth", authRoutes);  

// Ressources principales
app.use("/api/categories", categoriesRoutes);
app.use("/api/ouvrages", ouvragesRoutes);
app.use("/api/avis", avisRoutes);
app.use("/api/commentaires", commentairesRoutes);

// Gestion des utilisateurs (admin)
app.use("/api/users", usersRoutes);

// Panier
app.use("/api/panier", panierRoutes);
app.use("/api/panierItems", panierItemsRoutes);

// Commandes
app.use("/api/commandes", commandesRoutes);

// Items de commande (IMPORTANT : doit inclure :idCommande)
app.use("/api/commandes/:idCommande", commandesItemsRoutes);

// Listes cadeaux
app.use("/api/listes", listesRoutes);
app.use("/api/liste", listesRoutes);

// --- 404 ---
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// --- Gestion d’erreurs globales ---
app.use((err, req, res, next) => {
  console.error("SERVER_ERROR:", err);
  res.status(500).json({ error: "Server error" });
});

export default app;
