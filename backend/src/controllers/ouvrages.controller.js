import { pool } from "../db.js";

/** GET /api/ouvrages?texte=&categorie= */
export async function list(req, res) {
  const { texte = "", categorie } = req.query;
  const params = [];
  let sql = `SELECT o.*, c.nom AS categorie_nom
             FROM ouvrages o
             JOIN categories c ON c.id=o.categorie_id
             WHERE o.stock > 0`;
  if (texte) {
    sql += " AND (o.titre LIKE ? OR o.auteur LIKE ? OR o.isbn LIKE ?)";
    params.push(`%${texte}%`, `%${texte}%`, `%${texte}%`);
  }
  if (categorie) {
    sql += " AND o.categorie_id=?";
    params.push(categorie);
  }
  sql += " ORDER BY o.created_at DESC";
  const [rows] = await pool.query(sql, params);
  res.json(rows);
}

export async function details(req, res) {
  const { id } = req.params;
  const [rows] = await pool.query("SELECT * FROM ouvrages WHERE id=?", [id]);
  if (!rows.length) return res.status(404).json({ error: "Ouvrage introuvable" });
  res.json(rows[0]);
}

export async function create(req, res) {
  try {
    const { titre, auteur, isbn, description, prix, stock, categorie_id } = req.body;
    if (!titre || !auteur || !isbn || categorie_id == null) {
      return res.status(400).json({ error: "titre, auteur, isbn, categorie_id requis" });
    }
    const [r] = await pool.query(
      `INSERT INTO ouvrages(titre,auteur,isbn,description,prix,stock,categorie_id)
       VALUES(?,?,?,?,?,?,?)`,
      [titre, auteur, isbn, description ?? null, Number(prix)||0, Number(stock)||0, Number(categorie_id)]
    );
    const [row] = await pool.query("SELECT * FROM ouvrages WHERE id=?", [r.insertId]);
    res.status(201).json(row[0]);
  } catch (e) {
    res.status(500).json({ error: "Erreur création ouvrage" });
  }
}

export async function update(req, res) {
  try {
    const { id } = req.params;
    const { titre, auteur, isbn, description, prix, stock, categorie_id } = req.body;
    const [exists] = await pool.query("SELECT id FROM ouvrages WHERE id=?", [id]);
    if (!exists.length) return res.status(404).json({ error: "Ouvrage introuvable" });

    await pool.query(
      `UPDATE ouvrages SET titre=?, auteur=?, isbn=?, description=?, prix=?, stock=?, categorie_id=?, updated_at=NOW()
       WHERE id=?`,
      [titre, auteur, isbn, description ?? null, Number(prix)||0, Number(stock)||0, Number(categorie_id), id]
    );
    const [row] = await pool.query("SELECT * FROM ouvrages WHERE id=?", [id]);
    res.json(row[0]);
  } catch (e) {
    res.status(500).json({ error: "Erreur mise à jour ouvrage" });
  }
}

export async function remove(req, res) {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM ouvrages WHERE id=?", [id]);
    res.status(204).end();
  } catch (e) {
    res.status(500).json({ error: "Erreur suppression ouvrage" });
  }
}
