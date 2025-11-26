import { Router } from "express";
import {
  list,
  getOne,
  create,
  update,
  remove,
} from "../controllers/users.controller.js";
import { requireAuth, allowRoles } from "../middlewares/auth.js";

const router = Router();

// Protège tout par défaut (dé-commente si tu veux laisser ouvert)
// router.use(requireAuth);

// Seules certaines actions réservées aux admins :
router.get(
  "/",
  /*requireAuth, allowRoles('gestionnaire','administrateur'),*/ list
);
router.get("/:id", /*requireAuth,*/ getOne);
router.post("/", /*requireAuth, allowRoles('administrateur'),*/ create);
router.put(
  "/:idUser",
  /*requireAuth, allowRoles('gestionnaire','administrateur'),*/ update
);
router.delete(
  "/:idUser",
  /*requireAuth, allowRoles('administrateur'),*/ remove
);

export default router;
