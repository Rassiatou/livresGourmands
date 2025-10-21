import { Router } from "express";
import { list, create, remove } from "../controllers/avis.controller.js";
const router = Router();

router.get("/", list);
router.post("/", create); // tu peux protéger plus tard avec JWT si tu veux
router.delete("/:idAvis", remove);

export default router;
