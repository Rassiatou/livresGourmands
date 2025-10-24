import { Router } from "express";
import {
  list,
  create,
  setValidation,
  remove,
} from "../controllers/commentaires.controller.js";
const router = Router();

router.get("/", list);
router.post("/", create);
// modération
router.put("/:idCommentaire/valider", setValidation);
router.delete("/:idCommentaire", remove);

export default router;
