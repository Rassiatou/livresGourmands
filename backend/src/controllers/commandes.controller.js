import { pool } from "../db.js";
import Stripe from "stripe";

function getStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) return null;
  return new Stripe(key);
}
export async function list(req, res) {
  try {
    const { userId } = req.query;
    const params = [];

    let sql = `
      SELECT 
        c.idCommande AS id,
        c.idCommande AS idCommande,
        c.user_idUser AS user_id,
        c.date_commande,
        c.statut,
        c.total,
        c.mode_paiement,
        c.adresse_livraison,
        c.mode_livraison,
        c.created_at,
        c.updated_at,
        u.idUser AS idUser,
        u.nom AS user_nom,
        u.email AS user_email
      FROM commandes c
      LEFT JOIN users u ON u.idUser = c.user_idUser
      WHERE 1=1
    `;

    const role = req.user?.role;
    const isManager = role === "gestionnaire" || role === "administrateur";
    if (!isManager) {
      sql += " AND c.user_idUser = ?";
      params.push(Number(req.user.id));
    } else if (userId) {
      sql += " AND c.user_idUser = ?";
      params.push(Number(userId));
    }

    sql += " ORDER BY c.date_commande DESC";

    const [rows] = await pool.query(sql, params);
    res.json(
      rows.map((row) => ({
        ...row,
        idCommande: row.idCommande ?? row.id,
        idUser: row.idUser ?? row.user_id,
      }))
    );
  } catch (e) {
    console.error("CMD_LIST_ERR:", e);
    res
      .status(500)
      .json({ error: e.code || e.message || "Erreur liste commandes" });
  }
}

/** GET /api/commandes/:idCommande  (avec items) */
export async function details(req, res) {
  try {
    const id = Number(req.params.idCommande);

    const [[cmd]] = await pool.query(
      `SELECT * FROM commandes WHERE idCommande = ?`,
      [id]
    );

    if (!cmd) return res.status(404).json({ error: "Commande introuvable" });
    const role = req.user?.role;
    const isManager = role === "gestionnaire" || role === "administrateur";
    if (!isManager && Number(cmd.user_idUser) !== Number(req.user?.id)) {
      return res.status(403).json({ error: "Accès refusé" });
    }

    const [items] = await pool.query(
      `SELECT 
         cl.ouvrage_idOuvrage AS ouvrage_id,
         cl.quantite,
         cl.prix_unitaire,
         o.titre
       FROM commandes_items cl
       JOIN ouvrages o ON o.idOuvrage = cl.ouvrage_idOuvrage
       WHERE cl.commande_idCommande = ?`,
      [id]
    );

    res.json({
      ...cmd,
      idCommande: cmd.idCommande,
      idUser: cmd.user_idUser,
      items: items.map((it) => ({ ...it, idOuvrage: it.ouvrage_id })),
    });
  } catch (e) {
    console.error("CMD_DETAILS_ERR:", e);
    res.status(500).json({ error: "Erreur détails commande" });
  }
}

/**
 * POST /api/commandes
 * Body:
 * {
 *   "user_id": 3,
 *   "adresse_livraison": "123 rue Test",
 *   "mode_livraison": "standard",
 *   "mode_paiement": "carte",
 *   "items": [
 *     { "ouvrage_id": 1, "quantite": 2, "prix_unitaire": 14.99 },
 *     { "ouvrage_id": 3, "quantite": 1, "prix_unitaire": 19.99 }
 *   ]
 * }
 */
export async function create(req, res) {
  const conn = await pool.getConnection();
  try {
    const { user_id, adresse_livraison, mode_livraison, mode_paiement, items } =
      req.body;
    const role = req.user?.role;
    const isManager = role === "gestionnaire" || role === "administrateur";
    const resolvedUserId = isManager
      ? Number(user_id || req.user.id)
      : Number(req.user.id);

    if (!resolvedUserId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Utilisateur et items requis" });
    }

    const total = items.reduce(
      (s, it) => s + Number(it.prix_unitaire) * Number(it.quantite),
      0
    );

    await conn.beginTransaction();

    const [r] = await conn.query(
      `INSERT INTO commandes (user_idUser, total, statut, adresse_livraison, mode_livraison, mode_paiement)
       VALUES (?, ?, 'en_attente', ?, ?, ?)`,
      [
        resolvedUserId,
        total,
        adresse_livraison ?? null,
        mode_livraison ?? null,
        mode_paiement ?? null,
      ]
    );

    const idCommande = r.insertId;

    for (const it of items) {
      await conn.query(
        `INSERT INTO commandes_items (commande_idCommande, ouvrage_idOuvrage, quantite, prix_unitaire)
         VALUES (?, ?, ?, ?)`,
        [
          idCommande,
          Number(it.ouvrage_id),
          Number(it.quantite),
          Number(it.prix_unitaire),
        ]
      );

      await conn.query(
        `UPDATE ouvrages SET stock = GREATEST(0, stock - ?) WHERE idOuvrage = ?`,
        [Number(it.quantite), Number(it.ouvrage_id)]
      );
    }

    await conn.commit();

    const [[cmd]] = await pool.query(
      `SELECT * FROM commandes WHERE idCommande = ?`,
      [idCommande]
    );

    const [cmdItems] = await pool.query(
      `SELECT cl.idItem, cl.commande_idCommande, cl.ouvrage_idOuvrage, cl.quantite, cl.prix_unitaire, o.titre
       FROM commandes_items cl
       JOIN ouvrages o ON o.idOuvrage = cl.ouvrage_idOuvrage
       WHERE commande_idCommande = ?`,
      [idCommande]
    );

    res.status(201).json({
      ...cmd,
      idCommande: cmd.idCommande,
      idUser: cmd.user_idUser,
      items: cmdItems.map((it) => ({
        ...it,
        ouvrage_id: it.ouvrage_idOuvrage,
        idOuvrage: it.ouvrage_idOuvrage,
      })),
    });
  } catch (e) {
    await conn.rollback();
    console.error("CMD_CREATE_ERR:", e);
    res.status(500).json({ error: "Erreur création commande" });
  } finally {
    conn.release();
  }
}

/** PUT /api/commandes/:idCommande/status */
export async function updateStatut(req, res) {
  try {
    const id = Number(req.params.idCommande);
    const { statut } = req.body;

    if (!statut)
      return res.status(400).json({ error: "statut requis" });

    const [r] = await pool.query(
      `UPDATE commandes SET statut=?, updated_at=NOW() WHERE idCommande=?`,
      [statut, id]
    );

    if (r.affectedRows === 0)
      return res.status(404).json({ error: "Commande introuvable" });

    const [[cmd]] = await pool.query(
      `SELECT * FROM commandes WHERE idCommande=?`,
      [id]
    );

    res.json({ ...cmd, idCommande: cmd.idCommande, idUser: cmd.user_idUser });
  } catch (e) {
    console.error("CMD_UPDATE_STATUT_ERR:", e);
    res.status(500).json({ error: "Erreur mise à jour statut" });
  }
}

/** DELETE /api/commandes/:idCommande */
export async function remove(req, res) {
  try {
    const id = Number(req.params.idCommande);

    await pool.query(`DELETE FROM commandes WHERE idCommande=?`, [id]);

    res.status(204).end();
  } catch (e) {
    console.error("CMD_DELETE_ERR:", e);
    res.status(500).json({ error: "Erreur suppression commande" });
  }
}

/** POST /api/commandes/:idCommande/checkout-session */
export async function createCheckoutSession(req, res) {
  try {
    const stripe = getStripeClient();
    if (!stripe) {
      return res
        .status(500)
        .json({ error: "Configuration Stripe manquante (STRIPE_SECRET_KEY)." });
    }

    const idCommande = Number(req.params.idCommande);
    const [[cmd]] = await pool.query(
      "SELECT * FROM commandes WHERE idCommande=?",
      [idCommande]
    );
    if (!cmd) return res.status(404).json({ error: "Commande introuvable" });

    const role = req.user?.role;
    const isManager = role === "gestionnaire" || role === "administrateur";
    if (!isManager && Number(cmd.user_idUser) !== Number(req.user?.id)) {
      return res.status(403).json({ error: "Accès refusé" });
    }

    const [items] = await pool.query(
      `SELECT cl.quantite, cl.prix_unitaire, o.titre
       FROM commandes_items cl
       JOIN ouvrages o ON o.idOuvrage = cl.ouvrage_idOuvrage
       WHERE cl.commande_idCommande=?`,
      [idCommande]
    );
    if (!items.length) {
      return res
        .status(400)
        .json({ error: "La commande ne contient aucun article." });
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: items.map((item) => ({
        quantity: Number(item.quantite),
        price_data: {
          currency: "cad",
          unit_amount: Math.round(Number(item.prix_unitaire) * 100),
          product_data: { name: item.titre },
        },
      })),
      metadata: {
        commandeId: String(idCommande),
        userId: String(cmd.user_idUser),
      },
      success_url: `${frontendUrl}/paiement/succes?commande=${idCommande}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/paiement/annule?commande=${idCommande}`,
    });

    await pool.query(
      `INSERT INTO payments (commande_idCommande, provider, provider_payment_id, statut, amount)
       VALUES (?, 'stripe', ?, 'pending', ?)`,
      [idCommande, session.id, Number(cmd.total)]
    );
    await pool.query(
      "UPDATE commandes SET mode_paiement='stripe', statut='en_attente' WHERE idCommande=?",
      [idCommande]
    );

    res.json({ checkout_url: session.url, session_id: session.id });
  } catch (e) {
    console.error("STRIPE_SESSION_ERR:", e);
    if (e?.type === "StripeConnectionError") {
      return res.status(503).json({
        error:
          "Connexion a Stripe impossible pour le moment. Verifiez internet/DNS puis reessayez.",
      });
    }
    res.status(500).json({ error: "Impossible de créer la session de paiement." });
  }
}

/** POST /api/commandes/:idCommande/confirm-payment */
export async function confirmPayment(req, res) {
  try {
    const stripe = getStripeClient();
    if (!stripe) {
      return res
        .status(500)
        .json({ error: "Configuration Stripe manquante (STRIPE_SECRET_KEY)." });
    }
    const idCommande = Number(req.params.idCommande);
    const { session_id } = req.body;
    if (!session_id) {
      return res.status(400).json({ error: "session_id requis" });
    }

    const [[cmd]] = await pool.query(
      "SELECT * FROM commandes WHERE idCommande=?",
      [idCommande]
    );
    if (!cmd) return res.status(404).json({ error: "Commande introuvable" });

    const role = req.user?.role;
    const isManager = role === "gestionnaire" || role === "administrateur";
    if (!isManager && Number(cmd.user_idUser) !== Number(req.user?.id)) {
      return res.status(403).json({ error: "Accès refusé" });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);
    const paid = session.payment_status === "paid";
    if (!paid) {
      return res.status(400).json({ error: "Le paiement n'est pas confirmé." });
    }

    await pool.query(
      "UPDATE commandes SET statut='payee', mode_paiement='stripe', updated_at=NOW() WHERE idCommande=?",
      [idCommande]
    );
    await pool.query(
      `UPDATE payments
       SET statut='paid'
       WHERE commande_idCommande=? AND provider='stripe' AND provider_payment_id=?`,
      [idCommande, session_id]
    );

    res.json({ ok: true, commande_id: idCommande, statut: "payee" });
  } catch (e) {
    console.error("STRIPE_CONFIRM_ERR:", e);
    res.status(500).json({ error: "Impossible de confirmer le paiement." });
  }
}
