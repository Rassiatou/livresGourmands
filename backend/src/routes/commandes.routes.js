import { Router } from "express";
import {
  list,
  details,
  create,
  updateStatut,
  remove,
  createCheckoutSession,
  confirmPayment,
} from "../controllers/commandes.controller.js";
import { requireAuth, allowRoles } from "../middlewares/auth.js";

const router = Router();
router.use(requireAuth);

/**
 * GET /api/commandes
 * Optionnel : ?userId=2 pour filtrer par utilisateur
 */
router.get(
  "/",
  list
);

/**
 * GET /api/commandes/:idCommande
 * Retourne une commande + ses items
 */
router.get(
  "/:idCommande",
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
  create
);

router.post(
  "/:idCommande/checkout-session",
  createCheckoutSession
);

router.post(
  "/:idCommande/confirm-payment",
  confirmPayment
);

/**
 * PUT /api/commandes/:idCommande/status
 * Body : { "statut": "payee" }
 */
router.put(
  "/:idCommande/status",
  allowRoles("gestionnaire", "administrateur"),
  updateStatut
);

/**
 * DELETE /api/commandes/:idCommande
 * (optionnel, surtout pour tests)
 */
router.delete(
  "/:idCommande",
  allowRoles("administrateur"),
  remove
);

export default router;
