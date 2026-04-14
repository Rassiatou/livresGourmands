import { pool } from "../db.js";

/** GET /api/avis?ouvrageId=&clientId= */
export async function list(req, res) {
  try {
    const { ouvrageId, clientId } = req.query;
    const params = [];
    let sql = `
      SELECT a.idAvis, a.note, a.commentaire, a.date_avis,
             u.id AS client_idUser, u.nom AS client_nom,
             o.id AS ouvrage_idOuvrage, o.titre AS ouvrage_titre
      FROM avis a
      JOIN users u    ON u.id = a.client_idUser
      JOIN ouvrages o ON o.id = a.ouvrage_idOuvrage
      WHERE 1=1
    `;
    if (ouvrageId) {
      sql += " AND a.ouvrage_idOuvrage = ?";
      params.push(Number(ouvrageId));
    }
    if (clientId) {
      sql += " AND a.client_idUser     = ?";
      params.push(Number(clientId));
    }
    sql += " ORDER BY a.date_avis DESC";
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) {
    console.error("AVIS_LIST_ERR:", e);
    res.status(500).json({ error: e.code || e.message || "Erreur liste avis" });
  }
}

/** POST /api/avis  (body: { client_idUser, ouvrage_idOuvrage, note, commentaire }) */
export async function create(req, res) {
  try {
    const { client_idUser, ouvrage_idOuvrage, note, commentaire } = req.body;
    const role = req.user?.role;
    const isManager = role === "gestionnaire" || role === "administrateur";
    const resolvedClientId = isManager
      ? Number(client_idUser || req.user.id)
      : Number(req.user.id);
    if (!resolvedClientId || !ouvrage_idOuvrage || !note)
      return res
        .status(400)
        .json({ error: "Utilisateur, ouvrage_idOuvrage, note requis" });

    await pool.query(
      `INSERT INTO avis(client_idUser, ouvrage_idOuvrage, note, commentaire)
       VALUES (?,?,?,?)`,
      [
        resolvedClientId,
        Number(ouvrage_idOuvrage),
        Number(note),
        commentaire ?? null,
      ]
    );
    res.status(201).json({ ok: true });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ error: "Un avis existe déjà pour ce client et cet ouvrage" });
    }
    console.error("AVIS_CREATE_ERR:", e);
    res.status(500).json({ error: "Erreur création avis" });
  }
}

/** DELETE /api/avis/:idAvis */
export async function remove(req, res) {
  try {
    const { idAvis } = req.params;
    const [rows] = await pool.query("SELECT client_idUser FROM avis WHERE idAvis=?", [
      Number(idAvis),
    ]);
    if (!rows.length) return res.status(404).json({ error: "Avis introuvable" });
    const role = req.user?.role;
    const isManager = role === "gestionnaire" || role === "administrateur";
    if (!isManager && Number(rows[0].client_idUser) !== Number(req.user.id)) {
      return res.status(403).json({ error: "Accès refusé" });
    }
    await pool.query("DELETE FROM avis WHERE idAvis=?", [Number(idAvis)]);
    res.status(204).end();
  } catch (e) {
    console.error("AVIS_DELETE_ERR:", e);
    res.status(500).json({ error: "Erreur suppression avis" });
  }
}
