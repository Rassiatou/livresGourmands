import { pool } from "../db.js";

export async function list(req, res) {
  const [rows] = await pool.query("SELECT * FROM categories ORDER BY nom");
  res.json(rows);
}

export async function create(req, res) {
  try {
    const { nom, description } = req.body;
    if (!nom) return res.status(400).json({ error: "nom requis" });
    const [r] = await pool.query("INSERT INTO categories(nom, description) VALUES(?,?)", [nom, description ?? null]);
    const [row] = await pool.query("SELECT * FROM categories WHERE id=?", [r.insertId]);
    res.status(201).json(row[0]);
  } catch (e) {
    res.status(500).json({ error: "Erreur création catégorie" });
  }
}
