import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

export async function register(req, res) {
  try {
    const { nom, email, password } = req.body;
    if (!nom || !email || !password) return res.status(400).json({ error: "nom, email, password requis" });

    const [exists] = await pool.query("SELECT id FROM users WHERE email=?", [email]);
    if (exists.length) return res.status(409).json({ error: "Email déjà utilisé" });

    const hash = await bcrypt.hash(password, 10);
    const [r] = await pool.query(
      "INSERT INTO users(nom,email,password_hash,role) VALUES(?,?,?,'client')",
      [nom, email, hash]
    );

    const payload = { id: r.insertId, email, role: "client" };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ token, user: payload });
  } catch (e) {
    res.status(500).json({ error: "Erreur inscription" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "email, password requis" });

    const [rows] = await pool.query("SELECT * FROM users WHERE email=? AND actif=1", [email]);
    if (!rows.length) return res.status(401).json({ error: "Identifiants invalides" });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Identifiants invalides" });

    const payload = { id: user.id, email: user.email, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: payload });
  } catch (e) {
    res.status(500).json({ error: "Erreur connexion" });
  }
}
