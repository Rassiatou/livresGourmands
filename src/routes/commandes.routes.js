import { Router } from "express";
import {
  list,
  details,
  create,
  updateStatut,
  remove,
} from "../controllers/commandes.controller.js";
// (tu pourras ajouter requireAuth / allowRoles plus tard)
const router = Router();

router.get("/", list);
router.get("/:idCommande", details);
router.post("/", create);
router.put("/:idCommande/statut", updateStatut);
router.delete("/:idCommande", remove);

export default router;
