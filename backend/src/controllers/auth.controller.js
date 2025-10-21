import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

function sign(user) {
  return jwt.sign(
    { id: user.idUser, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// POST /api/auth/register
export async function register(req, res) {
  try {
    const { nom, email, password, role = "client" } = req.body;
    if (!nom || !email || !password) {
      return res.status(400).json({ error: "nom, email, password requis" });
    }
    const [exists] = await pool.query(
      "SELECT idUser FROM users WHERE email=?",
      [email]
    );
    if (exists.length)
      return res.status(409).json({ error: "Email déjà utilisé" });

    const hash = await bcrypt.hash(password, 10);
    const [r] = await pool.query(
      "INSERT INTO users(nom,email,password_hash,role) VALUES (?,?,?,?)",
      [nom, email, hash, role]
    );
    const [[user]] = await pool.query(
      "SELECT idUser, email, role FROM users WHERE idUser=?",
      [r.insertId]
    );
    const token = sign(user);
    res.status(201).json({ token, user });
  } catch (e) {
    console.error("REGISTER_ERR:", e);
    res.status(500).json({ error: "Erreur inscription" });
  }
}

// POST /api/auth/login
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "email, password requis" });

    const [rows] = await pool.query(
      "SELECT * FROM users WHERE email=? AND actif=1",
      [email]
    );
    if (!rows.length)
      return res.status(401).json({ error: "Identifiants invalides" });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Identifiants invalides" });

    const token = sign(user);
    res.json({
      token,
      user: { idUser: user.idUser, email: user.email, role: user.role },
    });
  } catch (e) {
    console.error("LOGIN_ERR:", e);
    res.status(500).json({ error: "Erreur connexion" });
  }
}

// GET /api/auth/me  (retourne l'utilisateur courant)
export async function me(req, res) {
  try {
    const [[user]] = await pool.query(
      "SELECT idUser, nom, email, role, actif, created_at FROM users WHERE idUser=?",
      [req.user.id]
    );
    if (!user)
      return res.status(404).json({ error: "Utilisateur introuvable" });
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: "Erreur lecture profil" });
  }
}
