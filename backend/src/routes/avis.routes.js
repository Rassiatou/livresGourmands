import { Router } from "express";
import { list, create, remove } from "../controllers/avis.controller.js";
import { requireAuth } from "../middlewares/auth.js";
const router = Router();

router.get("/", list);
router.post("/", requireAuth, create);
router.delete("/:idAvis", requireAuth, remove);

export default router;
