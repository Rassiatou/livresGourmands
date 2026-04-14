import { Router } from "express";
import {
  list,
  create,
  setValidation,
  remove,
} from "../controllers/commentaires.controller.js";
import { requireAuth, allowRoles } from "../middlewares/auth.js";
const router = Router();

router.get("/", list);
router.post("/", requireAuth, create);
// modération
router.put(
  "/:idCommentaire/valider",
  requireAuth,
  allowRoles("gestionnaire", "administrateur"),
  setValidation
);
router.delete("/:idCommentaire", requireAuth, remove);

export default router;
