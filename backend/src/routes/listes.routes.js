import { Router } from "express";
import {
  list,
  getOne,
  create,
  update,
  remove,
  listItems,
  addItem,
  removeItem,
} from "../controllers/listes.controller.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

router.use(requireAuth);

router.get("/", list); // GET /api/listes?proprietaireId=&code=
router.get("/:idListe", getOne); // GET /api/listes/1
router.post("/", create); // POST /api/listes
router.put("/:idListe", update); // PUT  /api/listes/1
router.delete("/:idListe", remove); // DELETE /api/listes/1

// items d'une liste
router.get("/:idListe/items", listItems); // GET    /api/listes/1/items
router.post("/:idListe/items", addItem); // POST   /api/listes/1/items
router.delete("/:idListe/items/:idListeItem", removeItem); // DELETE /api/listes/1/items/3

export default router;
