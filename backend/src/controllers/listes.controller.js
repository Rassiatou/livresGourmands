import { pool } from "../db.js";
import crypto from "node:crypto";

// petit helper pour générer un code de partage
function genCode(n = 10) {
  return crypto.randomBytes(n).toString("hex").slice(0, n);
}

/** GET /api/listes?proprietaireId=&code= */
export async function list(req, res) {
  try {
    const { proprietaireId, code } = req.query;
    const params = [];
    let sql = `SELECT idListe, nom, proprietaire_idUser, code_partage, public, date_creation
               FROM listes_cadeaux WHERE 1=1`;
    if (proprietaireId) {
      sql += " AND proprietaire_idUser=?";
      params.push(Number(proprietaireId));
    }
    if (code) {
      sql += " AND code_partage=?";
      params.push(code);
    }
    sql += " ORDER BY date_creation DESC";
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) {
    console.error("LISTES_LIST_ERR:", e);
    res.status(500).json({ error: "Erreur liste des listes" });
  }
}

/** GET /api/listes/:idListe (avec items) */
export async function getOne(req, res) {
  try {
    const id = Number(req.params.idListe);
    const [[lst]] = await pool.query(
      `SELECT idListe, nom, proprietaire_idUser, code_partage, public, date_creation
       FROM listes_cadeaux WHERE idListe=?`,
      [id]
    );
    if (!lst) return res.status(404).json({ error: "Liste introuvable" });

    const [items] = await pool.query(
      `SELECT li.idListeItem, li.quantite_souhaitee,
              o.idOuvrage, o.titre
       FROM liste_items li
       JOIN ouvrages o ON o.idOuvrage=li.ouvrage_idOuvrage
       WHERE li.liste_idListe=?`,
      [id]
    );
    res.json({ ...lst, items });
  } catch (e) {
    console.error("LISTES_GET_ERR:", e);
    res.status(500).json({ error: "Erreur récupération liste" });
  }
}

/** POST /api/listes   { nom, proprietaire_idUser, public? } */
export async function create(req, res) {
  try {
    const { nom, proprietaire_idUser, public: isPublic = 0 } = req.body;
    if (!nom || !proprietaire_idUser)
      return res
        .status(400)
        .json({ error: "nom et proprietaire_idUser requis" });

    // code de partage unique
    let code = genCode(10);
    // (optionnel) on pourrait vérifier l'unicité en boucle si tu veux être strict
    const [r] = await pool.query(
      `INSERT INTO listes_cadeaux (nom, proprietaire_idUser, code_partage, public)
       VALUES (?,?,?,?)`,
      [nom, Number(proprietaire_idUser), code, Number(isPublic)]
    );
    const [[lst]] = await pool.query(
      `SELECT * FROM listes_cadeaux WHERE idListe=?`,
      [r.insertId]
    );
    res.status(201).json(lst);
  } catch (e) {
    console.error("LISTES_CREATE_ERR:", e);
    res.status(500).json({ error: "Erreur création liste" });
  }
}

/** PUT /api/listes/:idListe    { nom?, public? } */
export async function update(req, res) {
  try {
    const id = Number(req.params.idListe);
    const { nom, public: isPublic } = req.body;
    await pool.query(
      `UPDATE listes_cadeaux
       SET nom=COALESCE(?, nom),
           public=COALESCE(?, public)
       WHERE idListe=?`,
      [nom ?? null, isPublic != null ? Number(isPublic) : null, id]
    );
    const [[lst]] = await pool.query(
      `SELECT * FROM listes_cadeaux WHERE idListe=?`,
      [id]
    );
    if (!lst) return res.status(404).json({ error: "Liste introuvable" });
    res.json(lst);
  } catch (e) {
    console.error("LISTES_UPDATE_ERR:", e);
    res.status(500).json({ error: "Erreur mise à jour liste" });
  }
}

/** DELETE /api/listes/:idListe */
export async function remove(req, res) {
  try {
    const id = Number(req.params.idListe);
    await pool.query(`DELETE FROM listes_cadeaux WHERE idListe=?`, [id]);
    res.status(204).end();
  } catch (e) {
    console.error("LISTES_DELETE_ERR:", e);
    res.status(500).json({ error: "Erreur suppression liste" });
  }
}

/** GET /api/listes/:idListe/items */
export async function listItems(req, res) {
  try {
    const id = Number(req.params.idListe);
    const [items] = await pool.query(
      `SELECT li.idListeItem, li.quantite_souhaitee,
              o.idOuvrage, o.titre
       FROM liste_items li
       JOIN ouvrages o ON o.idOuvrage=li.ouvrage_idOuvrage
       WHERE li.liste_idListe=?`,
      [id]
    );
    res.json(items);
  } catch (e) {
    console.error("LISTES_ITEMS_LIST_ERR:", e);
    res.status(500).json({ error: "Erreur items liste" });
  }
}

/** POST /api/listes/:idListe/items   { ouvrage_idOuvrage, quantite_souhaitee? } */
export async function addItem(req, res) {
  try {
    const id = Number(req.params.idListe);
    const { ouvrage_idOuvrage, quantite_souhaitee = 1 } = req.body;
    if (!ouvrage_idOuvrage)
      return res.status(400).json({ error: "ouvrage_idOuvrage requis" });

    // unique par (liste, ouvrage)
    const [[ex]] = await pool.query(
      `SELECT idListeItem FROM liste_items WHERE liste_idListe=? AND ouvrage_idOuvrage=?`,
      [id, Number(ouvrage_idOuvrage)]
    );
    if (ex) {
      await pool.query(
        `UPDATE liste_items
         SET quantite_souhaitee = quantite_souhaitee + ?
         WHERE idListeItem=?`,
        [Number(quantite_souhaitee), ex.idListeItem]
      );
    } else {
      await pool.query(
        `INSERT INTO liste_items (liste_idListe, ouvrage_idOuvrage, quantite_souhaitee)
         VALUES (?,?,?)`,
        [id, Number(ouvrage_idOuvrage), Number(quantite_souhaitee)]
      );
    }
    const [items] = await pool.query(
      `SELECT idListeItem, liste_idListe, ouvrage_idOuvrage, quantite_souhaitee
       FROM liste_items WHERE liste_idListe=?`,
      [id]
    );
    res.status(201).json(items);
  } catch (e) {
    console.error("LISTES_ITEMS_ADD_ERR:", e);
    res.status(500).json({ error: "Erreur ajout item" });
  }
}

/** DELETE /api/listes/:idListe/items/:idListeItem */
export async function removeItem(req, res) {
  try {
    const idItem = Number(req.params.idListeItem);
    await pool.query(`DELETE FROM liste_items WHERE idListeItem=?`, [idItem]);
    res.status(204).end();
  } catch (e) {
    console.error("LISTES_ITEMS_DELETE_ERR:", e);
    res.status(500).json({ error: "Erreur suppression item" });
  }
}
