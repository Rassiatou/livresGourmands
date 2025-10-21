import { pool } from "../db.js";

/** GET /api/commandes?userId= */
export async function list(req, res) {
  try {
    const { userId } = req.query;
    const params = [];
    let sql = `
      SELECT c.idCommande, c.user_idUser, c.date_commande, c.total, c.statut,
             c.adresse_livraison, c.mode_livraison, c.mode_paiement
      FROM commandes c
      WHERE 1=1
    `;
    if (userId) {
      sql += " AND c.user_idUser = ?";
      params.push(Number(userId));
    }
    sql += " ORDER BY c.date_commande DESC";

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) {
    console.error("CMD_LIST_ERR:", e);
    res
      .status(500)
      .json({ error: e.code || e.message || "Erreur liste commandes" });
  }
}

/** GET /api/commandes/:idCommande  (avec items) */
export async function details(req, res) {
  try {
    const id = Number(req.params.idCommande);
    const [[cmd]] = await pool.query(
      `SELECT c.*
       FROM commandes c
       WHERE c.idCommande = ?`,
      [id]
    );
    if (!cmd) return res.status(404).json({ error: "Commande introuvable" });

    const [items] = await pool.query(
      `SELECT ci.idItem, ci.quantite, ci.prix_unitaire,
              o.idOuvrage, o.titre
       FROM commandes_items ci
       JOIN ouvrages o ON o.idOuvrage = ci.ouvrage_idOuvrage
       WHERE ci.commande_idCommande = ?`,
      [id]
    );
    res.json({ ...cmd, items });
  } catch (e) {
    console.error("CMD_DETAILS_ERR:", e);
    res.status(500).json({ error: "Erreur détails commande" });
  }
}

/**
 * POST /api/commandes
 * Body:
 * {
 *   "user_idUser": 3,
 *   "adresse_livraison": "123 Rue Test",
 *   "mode_livraison": "standard",
 *   "mode_paiement": "carte",
 *   "items": [
 *     { "ouvrage_idOuvrage": 1, "quantite": 2, "prix_unitaire": 14.99 },
 *     { "ouvrage_idOuvrage": 3, "quantite": 1, "prix_unitaire": 19.99 }
 *   ]
 * }
 */
export async function create(req, res) {
  const conn = await pool.getConnection();
  try {
    const {
      user_idUser,
      adresse_livraison,
      mode_livraison,
      mode_paiement,
      items,
    } = req.body;
    if (!user_idUser || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "user_idUser et items requis" });
    }

    // calcule le total côté serveur
    const total = items.reduce(
      (s, it) => s + Number(it.prix_unitaire) * Number(it.quantite),
      0
    );

    await conn.beginTransaction();

    const [r] = await conn.query(
      `INSERT INTO commandes (user_idUser, total, statut, adresse_livraison, mode_livraison, mode_paiement)
       VALUES (?, ?, 'en_attente', ?, ?, ?)`,
      [
        Number(user_idUser),
        total,
        adresse_livraison ?? null,
        mode_livraison ?? null,
        mode_paiement ?? null,
      ]
    );
    const idCommande = r.insertId;

    // insert des items + décrément du stock
    for (const it of items) {
      await conn.query(
        `INSERT INTO commandes_items (commande_idCommande, ouvrage_idOuvrage, quantite, prix_unitaire)
         VALUES (?,?,?,?)`,
        [
          idCommande,
          Number(it.ouvrage_idOuvrage),
          Number(it.quantite),
          Number(it.prix_unitaire),
        ]
      );
      await conn.query(
        `UPDATE ouvrages SET stock = GREATEST(0, stock - ?) WHERE idOuvrage = ?`,
        [Number(it.quantite), Number(it.ouvrage_idOuvrage)]
      );
    }

    await conn.commit();

    // renvoyer la commande complète
    const [[cmd]] = await pool.query(
      `SELECT * FROM commandes WHERE idCommande=?`,
      [idCommande]
    );
    const [cmdItems] = await pool.query(
      `SELECT ci.idItem, ci.quantite, ci.prix_unitaire, o.idOuvrage, o.titre
       FROM commandes_items ci
       JOIN ouvrages o ON o.idOuvrage = ci.ouvrage_idOuvrage
       WHERE ci.commande_idCommande=?`,
      [idCommande]
    );
    res.status(201).json({ ...cmd, items: cmdItems });
  } catch (e) {
    await conn.rollback();
    console.error("CMD_CREATE_ERR:", e);
    res
      .status(500)
      .json({ error: e.code || e.message || "Erreur création commande" });
  } finally {
    conn.release();
  }
}

/** PUT /api/commandes/:idCommande/statut  (body: { statut }) */
export async function updateStatut(req, res) {
  try {
    const id = Number(req.params.idCommande);
    const { statut } = req.body; // en_attente | payee | expediee | livree | annulee
    if (!statut) return res.status(400).json({ error: "statut requis" });

    const [r] = await pool.query(
      `UPDATE commandes SET statut=?, updated_at=NOW() WHERE idCommande=?`,
      [statut, id]
    );
    if (r.affectedRows === 0)
      return res.status(404).json({ error: "Commande introuvable" });
    const [[cmd]] = await pool.query(
      `SELECT * FROM commandes WHERE idCommande=?`,
      [id]
    );
    res.json(cmd);
  } catch (e) {
    console.error("CMD_UPDATE_STATUT_ERR:", e);
    res.status(500).json({ error: "Erreur mise à jour statut" });
  }
}

/** DELETE /api/commandes/:idCommande */
export async function remove(req, res) {
  try {
    const id = Number(req.params.idCommande);
    await pool.query(`DELETE FROM commandes WHERE idCommande=?`, [id]);
    res.status(204).end();
  } catch (e) {
    console.error("CMD_DELETE_ERR:", e);
    res.status(500).json({ error: "Erreur suppression commande" });
  }
}
