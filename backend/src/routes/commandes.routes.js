import { Router } from "express";
import {
  list,
  details,
  create,
  updateStatut,
  remove,
} from "../controllers/commandes.controller.js";
// Si tu veux protéger plus tard :
// import { requireAuth, allowRoles } from "../middlewares/auth.js";

const router = Router();

/**
 * GET /api/commandes
 * Optionnel : ?userId=2 pour filtrer par utilisateur
 */
router.get(
  "/",
  // requireAuth,
  list
);

/**
 * GET /api/commandes/:idCommande
 * Retourne une commande + ses items
 */
router.get(
  "/:idCommande",
  // requireAuth,
  details
);

/**
 * POST /api/commandes
 * Body attendu :
 * {
 *   "user_id": 2,
 *   "adresse_livraison": "xxx",
 *   "mode_livraison": "standard",
 *   "mode_paiement": "carte",
 *   "items": [
 *     { "ouvrage_id": 1, "quantite": 2, "prix_unitaire": 24.99 },
 *     ...
 *   ]
 * }
 */
router.post(
  "/",
  // requireAuth,
  create
);

/**
 * PUT /api/commandes/:idCommande/status
 * Body : { "statut": "payee" }
 */
router.put(
  "/:idCommande/status",
  // requireAuth,
  // allowRoles("gestionnaire", "administrateur"),
  updateStatut
);

/**
 * DELETE /api/commandes/:idCommande
 * (optionnel, surtout pour tests)
 */
router.delete(
  "/:idCommande",
  // requireAuth,
  // allowRoles("administrateur"),
  remove
);

export default router;
