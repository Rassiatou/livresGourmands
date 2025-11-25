import { pool } from "../db.js";
import bcrypt from "bcryptjs";

/** GET /api/users?q=&role=&actif= */
export async function list(req, res) {
  try {
    const { q = "", role, actif } = req.query;
    const params = [];
    let sql = `SELECT id, nom, email, role, actif, created_at, updated_at FROM users WHERE 1=1`;
    if (q) {
      sql += " AND (nom LIKE ? OR email LIKE ?)";
      params.push(`%${q}%`, `%${q}%`);
    }
    if (role) {
      sql += " AND role=?";
      params.push(role);
    }
    if (actif !== undefined) {
      sql += " AND actif=?";
      params.push(Number(actif));
    }
    sql += " ORDER BY created_at DESC";
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) {
    console.error("USERS_LIST_ERR:", e);
    res.status(500).json({ error: "Erreur liste utilisateurs" });
  }
}

/** GET /api/users/:Id */
export async function getOne(req, res) {
  try {
    const id = Number(req.params.id);
    const [rows] = await pool.query(
      `SELECT id, nom, email, role, actif, created_at, updated_at FROM users WHERE id=?`,
      [id]
    );
    if (!rows.length)
      return res.status(404).json({ error: "Utilisateur introuvable" });
    res.json(rows[0]);
  } catch (e) {
    console.error("USERS_GET_ERR:", e);
    res.status(500).json({ error: "Erreur récupération utilisateur" });
  }
}

/** POST /api/users  (création manuelle si besoin admin) */

export async function create(req, res) {
  try {
    const { nom, email, password, password_hash, role = "client", actif = 1 } = req.body;

    if (!nom || !email || (!password && !password_hash)) {
      return res.status(400).json({
        error: "nom, email et password (ou password_hash) requis"
      });
    }

    const [exists] = await pool.query("SELECT id FROM users WHERE email=?", [email]);
    if (exists.length) return res.status(409).json({ error: "Email déjà utilisé" });

    const hash = password_hash || await bcrypt.hash(password, 10);

    const [r] = await pool.query(
      "INSERT INTO users (nom, email, password_hash, role, actif) VALUES (?,?,?,?,?)",
      [nom, email, hash, role, Number(actif)]
    );

    return res.status(201).json({
      message: "Utilisateur créé avec succès",
      user: { id: r.insertId, nom, email, role }
    });
  } catch (e) {
    console.error("USERS_CREATE_ERR:", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}


/** PUT /api/users/:Id  (mettre à jour nom/role/actif) */
export async function update(req, res) {
  try {
    const id = Number(req.params.id);
    const { nom, role, actif } = req.body;
    await pool.query(
      `UPDATE users
       SET nom = COALESCE(?, nom),
           role = COALESCE(?, role),
           actif = COALESCE(?, actif),
           updated_at = NOW()
       WHERE Id=?`,
      [nom ?? null, role ?? null, actif != null ? Number(actif) : null, id]
    );
    const [rows] = await pool.query(
      `SELECT Id, nom, email, role, actif, created_at, updated_at FROM users WHERE Id=?`,
      [id]
    );
    if (!rows.length)
      return res.status(404).json({ error: "Utilisateur introuvable" });
    res.json(rows[0]);
  } catch (e) {
    console.error("USERS_UPDATE_ERR:", e);
    res.status(500).json({ error: "Erreur mise à jour utilisateur" });
  }
}

/** DELETE /api/users/:Id */
export async function remove(req, res) {
  try {
    const id = Number(req.params.Id);
    await pool.query(`DELETE FROM users WHERE Id=?`, [id]);
    res.status(204).end();
  } catch (e) {
    console.error("USERS_DELETE_ERR:", e);
    res.status(500).json({ error: "Erreur suppression utilisateur" });
  }
}
