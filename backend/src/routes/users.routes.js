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

router.use(requireAuth);

// Seules certaines actions réservées aux admins :
router.get(
  "/",
  allowRoles("gestionnaire", "administrateur"),
  list
);
router.get(
  "/:id",
  allowRoles("gestionnaire", "administrateur"),
  getOne
);
router.post("/", allowRoles("administrateur"), create);
router.put(
  "/:id",
  allowRoles("gestionnaire", "administrateur"),
  update
);
router.delete(
  "/:id",
  allowRoles("administrateur"),
  remove
);

export default router;
