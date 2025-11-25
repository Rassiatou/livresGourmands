import { pool } from "../db.js";
export async function list(req, res) {
  try {
    const { userId } = req.query;
    const params = [];

    let sql = `
      SELECT 
        c.id,
        c.user_id,
        c.date_commande,
        c.statut,
        c.total,
        c.mode_paiement,
        c.payment_provider_id AS reference_paiement,
        c.adresse_livraison,
        c.mode_livraison,
        c.created_at,
        c.updated_at,
        u.nom AS user_nom,
        u.email AS user_email
      FROM commandes c
      LEFT JOIN users u ON u.id = c.user_id
      WHERE 1=1
    `;

    if (userId) {
      sql += " AND c.user_id = ?";
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
      `SELECT * FROM commandes WHERE id = ?`,
      [id]
    );

    if (!cmd) return res.status(404).json({ error: "Commande introuvable" });

    const [items] = await pool.query(
      `SELECT 
         cl.ouvrage_id,
         cl.quantite,
         cl.prix_unitaire,
         o.titre
       FROM commande_lignes cl
       JOIN ouvrages o ON o.id = cl.ouvrage_id
       WHERE cl.commande_id = ?`,
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
 *   "user_id": 3,
 *   "adresse_livraison": "123 rue Test",
 *   "mode_livraison": "standard",
 *   "mode_paiement": "carte",
 *   "items": [
 *     { "ouvrage_id": 1, "quantite": 2, "prix_unitaire": 14.99 },
 *     { "ouvrage_id": 3, "quantite": 1, "prix_unitaire": 19.99 }
 *   ]
 * }
 */
export async function create(req, res) {
  const conn = await pool.getConnection();
  try {
    const {
      user_id,
      adresse_livraison,
      mode_livraison,
      mode_paiement,
      items,
    } = req.body;

    if (!user_id || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "user_id et items requis" });
    }

    const total = items.reduce(
      (s, it) => s + Number(it.prix_unitaire) * Number(it.quantite),
      0
    );

    await conn.beginTransaction();

    const [r] = await conn.query(
      `INSERT INTO commandes (user_id, total, statut, adresse_livraison, mode_livraison, mode_paiement)
       VALUES (?, ?, 'en_attente', ?, ?, ?)`,
      [
        Number(user_id),
        total,
        adresse_livraison ?? null,
        mode_livraison ?? null,
        mode_paiement ?? null,
      ]
    );

    const idCommande = r.insertId;

    for (const it of items) {
      await conn.query(
        `INSERT INTO commande_lignes (commande_id, ouvrage_id, quantite, prix_unitaire)
         VALUES (?, ?, ?, ?)`,
        [
          idCommande,
          Number(it.ouvrage_id),
          Number(it.quantite),
          Number(it.prix_unitaire),
        ]
      );

      await conn.query(
        `UPDATE ouvrages SET stock = GREATEST(0, stock - ?) WHERE id = ?`,
        [Number(it.quantite), Number(it.ouvrage_id)]
      );
    }

    await conn.commit();

    const [[cmd]] = await pool.query(
      `SELECT * FROM commandes WHERE id = ?`,
      [idCommande]
    );

    const [cmdItems] = await pool.query(
      `SELECT cl.*, o.titre 
       FROM commande_lignes cl
       JOIN ouvrages o ON o.id = cl.ouvrage_id
       WHERE commande_id = ?`,
      [idCommande]
    );

    res.status(201).json({ ...cmd, items: cmdItems });
  } catch (e) {
    await conn.rollback();
    console.error("CMD_CREATE_ERR:", e);
    res.status(500).json({ error: "Erreur création commande" });
  } finally {
    conn.release();
  }
}

/** PUT /api/commandes/:idCommande/status */
export async function updateStatut(req, res) {
  try {
    const id = Number(req.params.idCommande);
    const { statut } = req.body;

    if (!statut)
      return res.status(400).json({ error: "statut requis" });

    const [r] = await pool.query(
      `UPDATE commandes SET statut=?, updated_at=NOW() WHERE id=?`,
      [statut, id]
    );

    if (r.affectedRows === 0)
      return res.status(404).json({ error: "Commande introuvable" });

    const [[cmd]] = await pool.query(
      `SELECT * FROM commandes WHERE id=?`,
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

    await pool.query(`DELETE FROM commandes WHERE id=?`, [id]);

    res.status(204).end();
  } catch (e) {
    console.error("CMD_DELETE_ERR:", e);
    res.status(500).json({ error: "Erreur suppression commande" });
  }
}
