import { Router } from "express";
import {
  listItems,
  addItem,
  updateItem,
  removeItem,
} from "../controllers/panier.controller.js";
import { requireAuth } from "../middlewares/auth.js";
// addItem / updateItem / removeItem existent déjà dans ton panier.controller.js

const router = Router();
router.use(requireAuth);

// Lister les items d'un panier (par panierId OU clientId)
router.get("/", listItems);

// Ajouter un item
// Body: { client_idUser, ouvrage_idOuvrage, quantite?, prix_unitaire? }
router.post("/", addItem);

// Mettre à jour un item
// Body: { quantite?, prix_unitaire? }
router.put("/:idPanierItem", updateItem);

// Supprimer un item
router.delete("/:idPanierItem", removeItem);

export default router;
