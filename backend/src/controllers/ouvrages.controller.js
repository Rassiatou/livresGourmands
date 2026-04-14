import { pool } from "../db.js";

/** GET /api/ouvrages?texte=&categorie= */
export async function list(req, res) {
  try {
    const { texte = "", categorie } = req.query;
    const params = [];

    let sql = `
      SELECT 
        o.idOuvrage AS id,
        o.idOuvrage AS idOuvrage,
        o.titre,
        o.auteur,
        o.description,
        o.image_url,
        o.prix,
        o.stock,
        o.categorie_idCategorie AS categorie_id,
        c.nom AS categorie_nom,
        o.created_at,
        o.updated_at
      FROM ouvrages o
      LEFT JOIN categories c ON c.idCategorie = o.categorie_idCategorie
      WHERE 1=1
    `;

    // règle: si tu veux n’afficher que le stock > 0
    sql += " AND o.stock > 0";

    if (texte) {
      sql += " AND (o.titre LIKE ? OR o.auteur LIKE ?)";
      params.push(`%${texte}%`, `%${texte}%`);
    }

    if (categorie) {
      sql += " AND o.categorie_idCategorie = ?";
      params.push(Number(categorie));
    }

    sql += " ORDER BY o.created_at DESC";

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) {
    console.error("OUVRAGES_LIST_ERR:", e);
    res
      .status(500)
      .json({ error: e.code || e.message || "Erreur liste ouvrages" });
  }
}


export async function details(req, res) {
  const { id } = req.params;
  const [rows] = await pool.query("SELECT * FROM ouvrages WHERE idOuvrage=?", [id]);
  if (!rows.length)
    return res.status(404).json({ error: "Ouvrage introuvable" });
  res.json({ ...rows[0], id: rows[0].idOuvrage, idOuvrage: rows[0].idOuvrage });
}

export async function create(req, res) {
  try {
    const { titre, auteur, description, image_url, prix, stock, categorie_id } = req.body;
    if (!titre || !auteur || categorie_id == null) {
      return res
        .status(400)
        .json({ error: "titre, auteur, categorie_id requis" });
    }
    const [r] = await pool.query(
      `INSERT INTO ouvrages(titre,auteur,description,image_url,prix,stock,categorie_idCategorie)
       VALUES(?,?,?,?,?,?,?)`,
      [
        titre,
        auteur,
        description ?? null,
        image_url ?? null,
        Number(prix) || 0,
        Number(stock) || 0,
        Number(categorie_id),
      ]
    );
    const [row] = await pool.query("SELECT * FROM ouvrages WHERE idOuvrage=?", [
      r.insertId,
    ]);
    res
      .status(201)
      .json({ ...row[0], id: row[0].idOuvrage, idOuvrage: row[0].idOuvrage });
  } catch (e) {
    res.status(500).json({ error: "Erreur création ouvrage" });
  }
}

export async function update(req, res) {
  try {
    const { id } = req.params;
    const { titre, auteur, description, image_url, prix, stock, categorie_id } = req.body;
    const [exists] = await pool.query(
      "SELECT idOuvrage FROM ouvrages WHERE idOuvrage=?",
      [
        id,
      ]
    );
    if (!exists.length)
      return res.status(404).json({ error: "Ouvrage introuvable" });

    await pool.query(
      `UPDATE ouvrages SET titre=?, auteur=?, description=?, image_url=?, prix=?, stock=?, categorie_idCategorie=?, updated_at=NOW()
       WHERE idOuvrage=?`,
      [
        titre,
        auteur,
        description ?? null,
        image_url ?? null,
        Number(prix) || 0,
        Number(stock) || 0,
        Number(categorie_id),
        id,
      ]
    );
    const [row] = await pool.query("SELECT * FROM ouvrages WHERE idOuvrage=?", [
      id,
    ]);
    res.json({ ...row[0], id: row[0].idOuvrage, idOuvrage: row[0].idOuvrage });
  } catch (e) {
    res.status(500).json({ error: "Erreur mise à jour ouvrage" });
  }
}

export async function remove(req, res) {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM ouvrages WHERE idOuvrage=?", [id]);
    res.status(204).end();
  } catch (e) {
    res.status(500).json({ error: "Erreur suppression ouvrage" });
  }
}
