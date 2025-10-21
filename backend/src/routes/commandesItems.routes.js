import { Router } from "express";
import { listByCommande, addItem, updateItem, removeItem } from "../controllers/commandesItems.controller.js";

// mergeParams pour récupérer :idCommande depuis le parent
const router = Router({ mergeParams: true });

router.get("/", listByCommande);
router.post("/", addItem);
router.put("/:idItem", updateItem);
router.delete("/:idItem", removeItem);

export default router;
