import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Resend } from "resend";
import { pool } from "../db.js";

function resolveUserId(user) {
  return user?.id ?? user?.idUser;
}

function getJwtSecret() {
  return process.env.JWT_SECRET?.trim() || "dev_secret_change_me";
}

function sign(user) {
  const userId = resolveUserId(user);
  return jwt.sign(
    { id: userId, idUser: userId, email: user.email, role: user.role },
    getJwtSecret(),
    { expiresIn: "7d" }
  );
}

function signPasswordResetToken(email) {
  return jwt.sign(
    { email, purpose: "password_reset" },
    getJwtSecret(),
    { expiresIn: "20m" }
  );
}

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  return apiKey ? new Resend(apiKey) : null;
}

function getMailFrom() {
  return process.env.MAIL_FROM?.trim() || "LivresGourmands <onboarding@resend.dev>";
}

// POST /api/auth/register
export async function register(req, res) {
  try {
    const { nom, email, password, role = "client" } = req.body;
    if (!nom || !email || !password) {
      return res.status(400).json({ error: "nom, email, password requis" });
    }

    // vérifier si l'email existe déjà
    const [exists] = await pool.query(
      "SELECT idUser AS id FROM users WHERE email=?",
      [email]
    );
    if (exists.length)
      return res.status(409).json({ error: "Email déjà utilisé" });

    // hash du mot de passe
    const hash = await bcrypt.hash(password, 10);

    // insertion
    const [r] = await pool.query(
      "INSERT INTO users(nom,email,password_hash,role) VALUES (?,?,?,?)",
      [nom, email, hash, role]
    );

    // récupérer l'utilisateur créé
    const [[user]] = await pool.query(
      "SELECT idUser AS id, idUser, nom, email, role FROM users WHERE idUser=?",
      [r.insertId]
    );

    const token = sign(user);
    res.status(201).json({ token, user: { ...user, idUser: resolveUserId(user) } });
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
      "SELECT idUser AS id, idUser, nom, email, password_hash, role, actif, created_at FROM users WHERE email=? AND actif=1",
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
      user: {
        id: resolveUserId(user),
        idUser: resolveUserId(user),
        nom: user.nom,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e) {
    console.error("LOGIN_ERR:", e);
    res.status(500).json({ error: "Erreur connexion" });
  }
}

// POST /api/auth/forgot-password
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "email requis" });
    }

    const [rows] = await pool.query(
      "SELECT idUser, email FROM users WHERE email=? AND actif=1 LIMIT 1",
      [email]
    );

    // Reponse neutre pour eviter l'enumeration d'emails.
    if (!rows.length) {
      return res.json({
        message:
          "Si ce compte existe, vous recevrez un lien de réinitialisation.",
      });
    }

    const resend = getResendClient();
    if (!resend) {
      return res.status(503).json({
        error:
          "Service email non configuré. Contactez un administrateur.",
      });
    }

    const resetToken = signPasswordResetToken(rows[0].email);
    const frontendUrl = process.env.FRONTEND_URL?.trim() || "http://localhost:5173";
    const resetUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;
    const to = rows[0].email;

    await resend.emails.send({
      from: getMailFrom(),
      to,
      subject: "Réinitialisation de votre mot de passe",
      html: `
        <p>Bonjour,</p>
        <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
        <p>
          <a href="${resetUrl}">
            Cliquez ici pour définir un nouveau mot de passe
          </a>
        </p>
        <p>Ce lien expire dans 20 minutes.</p>
        <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
      `,
    });

    return res.json({
      message:
        "Si ce compte existe, vous recevrez un email de réinitialisation.",
    });
  } catch (e) {
    console.error("FORGOT_PASSWORD_ERR:", e);
    return res.status(500).json({ error: "Impossible de générer le lien de réinitialisation." });
  }
}

// POST /api/auth/reset-password
export async function resetPassword(req, res) {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: "token et password requis" });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ error: "Le mot de passe doit contenir au moins 6 caractères." });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, getJwtSecret());
    } catch {
      return res.status(400).json({ error: "Lien invalide ou expiré." });
    }

    if (decoded?.purpose !== "password_reset" || !decoded?.email) {
      return res.status(400).json({ error: "Lien invalide ou expiré." });
    }

    const hash = await bcrypt.hash(password, 10);
    const [r] = await pool.query(
      "UPDATE users SET password_hash=? WHERE email=? AND actif=1",
      [hash, decoded.email]
    );

    if (!r.affectedRows) {
      return res.status(404).json({ error: "Compte introuvable." });
    }

    return res.json({ message: "Mot de passe mis à jour avec succès." });
  } catch (e) {
    console.error("RESET_PASSWORD_ERR:", e);
    return res.status(500).json({ error: "Impossible de réinitialiser le mot de passe." });
  }
}

// GET /api/auth/me  (retourne l'utilisateur courant)
export async function me(req, res) {
  try {
    const [[user]] = await pool.query(
      "SELECT idUser AS id, idUser, nom, email, role, actif, created_at FROM users WHERE idUser=?",
      [req.user.id]      // ici aussi, on utilise id
    );
    if (!user)
      return res.status(404).json({ error: "Utilisateur introuvable" });
    res.json({ ...user, idUser: resolveUserId(user) });
  } catch (e) {
    console.error("ME_ERR:", e);
    res.status(500).json({ error: "Erreur lecture profil" });
  }
}
