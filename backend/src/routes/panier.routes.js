import { Router } from "express";
import {
  getPanier,
  addItem,
  updateItem,
  removeItem,
  clearPanier,
} from "../controllers/panier.controller.js";
// Si tu veux protéger avec JWT :
// import { requireAuth } from "../middlewares/auth.js";

const router = Router();

// router.use(requireAuth); // dé-commente si tu veux exiger un token

router.get("/", getPanier); // GET /api/panier?clientId=3
router.post("/items", addItem); // POST /api/panier/items
router.put("/items/:idPanierItem", updateItem); // PUT  /api/panier/items/:idPanierItem
router.delete("/items/:idPanierItem", removeItem); // DELETE /api/panier/items/:idPanierItem
router.delete("/clear/:idPanier", clearPanier); // DELETE /api/panier/clear/1

export default router;
