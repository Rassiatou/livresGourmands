import { Router } from "express";
import { list, create } from "../controllers/categories.controller.js";
import { requireAuth, allowRoles } from "../middlewares/auth.js";

const router = Router();
router.get("/", list);
router.post(
  "/",
  requireAuth,
  allowRoles("editeur", "gestionnaire", "administrateur"),
  create
);

export default router;
