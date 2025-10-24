import { pool } from "../db.js";

// GET /api/commentaires?ouvrageId=&clientId=&valide=
export async function list(req, res) {
  try {
    const { ouvrageId, clientId, valide } = req.query;
    const params = [];
    let sql = `
      SELECT cm.idCommentaire, cm.contenu, cm.valide, cm.date_soumission, cm.date_validation,
             u.idUser AS client_idUser, u.nom AS client_nom,
             o.idOuvrage AS ouvrage_idOuvrage, o.titre AS ouvrage_titre,
             v.idUser AS valide_par_idUser
      FROM commentaires cm
      JOIN users u ON u.idUser = cm.client_idUser
      JOIN ouvrages o ON o.idOuvrage = cm.ouvrage_idOuvrage
      LEFT JOIN users v ON v.idUser = cm.valide_par_idUser
      WHERE 1=1
    `;
    if (ouvrageId) { sql += " AND cm.ouvrage_idOuvrage=?"; params.push(Number(ouvrageId)); }
    if (clientId)  { sql += " AND cm.client_idUser=?";     params.push(Number(clientId)); }
    if (valide !== undefined) { sql += " AND cm.valide=?"; params.push(Number(valide)); }
    sql += " ORDER BY cm.date_soumission DESC";

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) {
    console.error("COMMENTS_LIST_ERR:", e);
    res.status(500).json({ error: "Erreur liste commentaires" });
  }
}

// POST /api/commentaires  { client_idUser, ouvrage_idOuvrage, contenu }
export async function create(req, res) {
  try {
    const { client_idUser, ouvrage_idOuvrage, contenu } = req.body;
    if (!client_idUser || !ouvrage_idOuvrage || !contenu?.trim()) {
      return res.status(400).json({ error: "client_idUser, ouvrage_idOuvrage, contenu requis" });
    }
    const [r] = await pool.query(
      `INSERT INTO commentaires (client_idUser, ouvrage_idOuvrage, contenu, valide)
       VALUES (?,?,?,0)`,
      [Number(client_idUser), Number(ouvrage_idOuvrage), contenu.trim()]
    );
    const [row] = await pool.query(`SELECT * FROM commentaires WHERE idCommentaire=?`, [r.insertId]);
    res.status(201).json(row[0]);
  } catch (e) {
    console.error("COMMENTS_CREATE_ERR:", e);
    res.status(500).json({ error: "Erreur création commentaire" });
  }
}

// PUT /api/commentaires/:idCommentaire/valider  { valide: 0|1, valide_par_idUser }
export async function setValidation(req, res) {
  try {
    const id = Number(req.params.idCommentaire);
    const { valide, valide_par_idUser } = req.body;
    if (valide == null) return res.status(400).json({ error: "valide requis (0 ou 1)" });

    await pool.query(
      `UPDATE commentaires
       SET valide=?, date_validation = IF(?=1, NOW(), NULL),
           valide_par_idUser = IF(?=1, ?, NULL)
       WHERE idCommentaire=?`,
      [Number(valide), Number(valide), Number(valide), valide_par_idUser ?? null, id]
    );
    const [row] = await pool.query(`SELECT * FROM commentaires WHERE idCommentaire=?`, [id]);
    if (!row.length) return res.status(404).json({ error: "Commentaire introuvable" });
    res.json(row[0]);
  } catch (e) {
    console.error("COMMENTS_VALIDATE_ERR:", e);
    res.status(500).json({ error: "Erreur validation commentaire" });
  }
}

// DELETE /api/commentaires/:idCommentaire
export async function remove(req, res) {
  try {
    await pool.query(`DELETE FROM commentaires WHERE idCommentaire=?`, [Number(req.params.idCommentaire)]);
    res.status(204).end();
  } catch (e) {
    console.error("COMMENTS_DELETE_ERR:", e);
    res.status(500).json({ error: "Erreur suppression commentaire" });
  }
}
