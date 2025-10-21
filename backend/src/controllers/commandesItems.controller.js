import { pool } from "../db.js";

// GET /api/commandes/:idCommande/items
export async function listByCommande(req, res) {
  try {
    const idCommande = Number(req.params.idCommande);
    const [rows] = await pool.query(
      `SELECT ci.idItem, ci.quantite, ci.prix_unitaire,
              o.idOuvrage, o.titre
       FROM commandes_items ci
       JOIN ouvrages o ON o.idOuvrage = ci.ouvrage_idOuvrage
       WHERE ci.commande_idCommande = ?`,
      [idCommande]
    );
    res.json(rows);
  } catch (e) {
    console.error("CMD_ITEMS_LIST_ERR:", e);
    res.status(500).json({ error: "Erreur items commande" });
  }
}

// POST /api/commandes/:idCommande/items
// body: { ouvrage_idOuvrage, quantite, prix_unitaire }
export async function addItem(req, res) {
  try {
    const idCommande = Number(req.params.idCommande);
    const { ouvrage_idOuvrage, quantite, prix_unitaire } = req.body;
    if (!ouvrage_idOuvrage || !quantite || !prix_unitaire) {
      return res
        .status(400)
        .json({ error: "ouvrage_idOuvrage, quantite, prix_unitaire requis" });
    }
    const [r] = await pool.query(
      `INSERT INTO commandes_items (commande_idCommande, ouvrage_idOuvrage, quantite, prix_unitaire)
       VALUES (?,?,?,?)`,
      [
        idCommande,
        Number(ouvrage_idOuvrage),
        Number(quantite),
        Number(prix_unitaire),
      ]
    );
    const [row] = await pool.query(
      `SELECT ci.idItem, ci.quantite, ci.prix_unitaire,
              o.idOuvrage, o.titre
       FROM commandes_items ci
       JOIN ouvrages o ON o.idOuvrage = ci.ouvrage_idOuvrage
       WHERE ci.idItem=?`,
      [r.insertId]
    );
    res.status(201).json(row[0]);
  } catch (e) {
    console.error("CMD_ITEMS_ADD_ERR:", e);
    res.status(500).json({ error: "Erreur ajout item" });
  }
}

// PUT /api/commandes/:idCommande/items/:idItem
// body (tout ou partie): { quantite, prix_unitaire }
export async function updateItem(req, res) {
  try {
    const { idCommande, idItem } = {
      idCommande: Number(req.params.idCommande),
      idItem: Number(req.params.idItem),
    };
    const { quantite, prix_unitaire } = req.body;
    await pool.query(
      `UPDATE commandes_items
       SET quantite = COALESCE(?, quantite),
           prix_unitaire = COALESCE(?, prix_unitaire)
       WHERE idItem=? AND commande_idCommande=?`,
      [
        quantite != null ? Number(quantite) : null,
        prix_unitaire != null ? Number(prix_unitaire) : null,
        idItem,
        idCommande,
      ]
    );
    const [row] = await pool.query(
      `SELECT idItem, commande_idCommande, ouvrage_idOuvrage, quantite, prix_unitaire
       FROM commandes_items WHERE idItem=?`,
      [idItem]
    );
    if (!row.length) return res.status(404).json({ error: "Item introuvable" });
    res.json(row[0]);
  } catch (e) {
    console.error("CMD_ITEMS_UPDATE_ERR:", e);
    res.status(500).json({ error: "Erreur MAJ item" });
  }
}

// DELETE /api/commandes/:idCommande/items/:idItem
export async function removeItem(req, res) {
  try {
    const idItem = Number(req.params.idItem);
    await pool.query(`DELETE FROM commandes_items WHERE idItem=?`, [idItem]);
    res.status(204).end();
  } catch (e) {
    console.error("CMD_ITEMS_DELETE_ERR:", e);
    res.status(500).json({ error: "Erreur suppression item" });
  }
}
