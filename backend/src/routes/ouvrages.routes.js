import { Router } from "express";
import { list, details, create, update, remove } from "../controllers/ouvrages.controller.js";
import { requireAuth, allowRoles } from "../auth.js";

const router = Router();

// Public
router.get("/", list);
router.get("/:id", details);

// Protégé pour CRUD
router.post("/", requireAuth, allowRoles("editeur","gestionnaire","administrateur"), create);
router.put("/:id", requireAuth, allowRoles("editeur","gestionnaire","administrateur"), update);
router.delete("/:id", requireAuth, allowRoles("gestionnaire","administrateur"), remove);

export default router;
