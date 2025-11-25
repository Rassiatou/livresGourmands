import { pool } from "../db.js";

// Helper pour recalculer le total d'une commande
async function recalcTotal(commandeId) {
  const [[row]] = await pool.query(
    `
    SELECT 
      COALESCE(SUM(quantite * prix_unitaire), 0) AS total
    FROM commande_lignes
    WHERE commande_id = ?
    `,
    [commandeId]
  );

  await pool.query(
    `UPDATE commandes SET total = ? WHERE id = ?`,
    [row.total, commandeId]
  );
}

/** GET /api/commandes/:idCommande/items */
export async function listByCommande(req, res) {
  try {
    const commandeId = Number(req.params.idCommande);

    const [rows] = await pool.query(
      `
      SELECT 
        cl.commande_id,
        cl.ouvrage_id,
        cl.quantite,
        cl.prix_unitaire,
        o.titre
      FROM commande_lignes cl
      JOIN ouvrages o ON o.id = cl.ouvrage_id
      WHERE cl.commande_id = ?
      `,
      [commandeId]
    );

    res.json(rows);
  } catch (e) {
    console.error("CMD_ITEMS_LIST_ERR:", e);
    res.status(500).json({ error: "Erreur liste items commande" });
  }
}

/** POST /api/commandes/:idCommande/items
 * Body: { ouvrage_id, quantite, prix_unitaire? }
 */
export async function addItem(req, res) {
  try {
    const commandeId = Number(req.params.idCommande);
    let { ouvrage_id, quantite, prix_unitaire } = req.body;

    if (!commandeId || !ouvrage_id || !quantite) {
      return res
        .status(400)
        .json({ error: "commandeId, ouvrage_id et quantite requis" });
    }

    // Si prix_unitaire pas fourni, on prend le prix de l'ouvrage
    if (!prix_unitaire) {
      const [[ov]] = await pool.query(
        `SELECT prix FROM ouvrages WHERE id = ?`,
        [ouvrage_id]
      );
      if (!ov) {
        return res.status(404).json({ error: "Ouvrage introuvable" });
      }
      prix_unitaire = ov.prix;
    }

    await pool.query(
      `
      INSERT INTO commande_lignes (commande_id, ouvrage_id, quantite, prix_unitaire)
      VALUES (?,?,?,?)
      `,
      [
        commandeId,
        Number(ouvrage_id),
        Number(quantite),
        Number(prix_unitaire),
      ]
    );

    // Recalculer le total de la commande
    await recalcTotal(commandeId);

    const [rows] = await pool.query(
      `
      SELECT 
        cl.commande_id,
        cl.ouvrage_id,
        cl.quantite,
        cl.prix_unitaire,
        o.titre
      FROM commande_lignes cl
      JOIN ouvrages o ON o.id = cl.ouvrage_id
      WHERE cl.commande_id = ?
      `,
      [commandeId]
    );

    res.status(201).json(rows);
  } catch (e) {
    console.error("CMD_ITEMS_ADD_ERR:", e);
    res.status(500).json({ error: "Erreur ajout item commande" });
  }
}

/** PUT /api/commandes/:idCommande/items/:idItem
 *  (ici idItem = couple (commande_id, ouvrage_id) si tu n'as pas de PK id)
 * Body: { quantite?, prix_unitaire? }
 */
export async function updateItem(req, res) {
  try {
    const commandeId = Number(req.params.idCommande);
    const ouvrageId = Number(req.params.idItem); // on utilise l'id de l'ouvrage comme idItem
    const { quantite, prix_unitaire } = req.body;

    if (!commandeId || !ouvrageId) {
      return res.status(400).json({ error: "commandeId et idItem requis" });
    }

    // On met à jour uniquement les champs fournis
    await pool.query(
      `
      UPDATE commande_lignes
      SET
        quantite = COALESCE(?, quantite),
        prix_unitaire = COALESCE(?, prix_unitaire)
      WHERE commande_id = ? AND ouvrage_id = ?
      `,
      [
        quantite != null ? Number(quantite) : null,
        prix_unitaire != null ? Number(prix_unitaire) : null,
        commandeId,
        ouvrageId,
      ]
    );

    // Recalculer le total de la commande
    await recalcTotal(commandeId);

    const [rows] = await pool.query(
      `
      SELECT 
        cl.commande_id,
        cl.ouvrage_id,
        cl.quantite,
        cl.prix_unitaire,
        o.titre
      FROM commande_lignes cl
      JOIN ouvrages o ON o.id = cl.ouvrage_id
      WHERE cl.commande_id = ?
      `,
      [commandeId]
    );

    res.json(rows);
  } catch (e) {
    console.error("CMD_ITEMS_UPDATE_ERR:", e);
    res.status(500).json({ error: "Erreur mise à jour item commande" });
  }
}

/** DELETE /api/commandes/:idCommande/items/:idItem */
export async function removeItem(req, res) {
  try {
    const commandeId = Number(req.params.idCommande);
    const ouvrageId = Number(req.params.idItem);

    await pool.query(
      `
      DELETE FROM commande_lignes
      WHERE commande_id = ? AND ouvrage_id = ?
      `,
      [commandeId, ouvrageId]
    );

    // Recalcule le total
    await recalcTotal(commandeId);

    res.status(204).end();
  } catch (e) {
    console.error("CMD_ITEMS_DELETE_ERR:", e);
    res.status(500).json({ error: "Erreur suppression item commande" });
  }
}
