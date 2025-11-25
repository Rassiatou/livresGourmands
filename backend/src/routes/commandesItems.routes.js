import { Router } from "express";
import {
  listByCommande,
  addItem,
  updateItem,
  removeItem
} from "../controllers/commandesItems.controller.js";

const router = Router({ mergeParams: true });

// GET /api/commandes/:idCommande/items
router.get("/items", listByCommande);

// POST /api/commandes/:idCommande/items
router.post("/items", addItem);

// PUT /api/commandes/:idCommande/items/:idItem
router.put("/items/:idItem", updateItem);

// DELETE /api/commandes/:idCommande/items/:idItem
router.delete("/items/:idItem", removeItem);

export default router;
