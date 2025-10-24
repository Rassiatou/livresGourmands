import { pool } from "../db.js";

// GET /api/panierItems?panierId=1  OU  /api/panierItems?clientId=3
export async function listItems(req, res) {
  try {
    const panierId = req.query.panierId ? Number(req.query.panierId) : null;
    const clientId = req.query.clientId ? Number(req.query.clientId) : null;

    let idPanier = panierId;
    if (!idPanier && clientId) {
      const [[p]] = await pool.query(
        "SELECT idPanier FROM panier WHERE client_idUser=? AND actif=1 LIMIT 1",
        [clientId]
      );
      idPanier = p?.idPanier || null;
    }
    if (!idPanier)
      return res.status(400).json({ error: "panierId ou clientId requis" });

    const [items] = await pool.query(
      `SELECT pi.idPanierItem, pi.quantite, pi.prix_unitaire,
                o.idOuvrage, o.titre
         FROM panier_items pi
         JOIN ouvrages o ON o.idOuvrage=pi.ouvrage_idOuvrage
         WHERE pi.panier_idPanier=?`,
      [idPanier]
    );
    res.json(items);
  } catch (e) {
    console.error("PANIER_ITEMS_LIST_ERR:", e);
    res.status(500).json({ error: "Erreur items panier" });
  }
}

// util: récupère (ou crée) le panier actif d’un user
async function getOrCreatePanier(clientId) {
  const [[ex]] = await pool.query(
    "SELECT * FROM panier WHERE client_idUser=? AND actif=1 LIMIT 1",
    [clientId]
  );
  if (ex) return ex;
  const [r] = await pool.query(
    "INSERT INTO panier (client_idUser, actif) VALUES (?,1)",
    [clientId]
  );
  const [[p]] = await pool.query("SELECT * FROM panier WHERE idPanier=?", [
    r.insertId,
  ]);
  return p;
}

// GET /api/panier?clientId=3  (retourne panier + items)
export async function getPanier(req, res) {
  try {
    const clientId = Number(req.query.clientId || req.user?.id);
    if (!clientId) return res.status(400).json({ error: "clientId requis" });

    const panier = await getOrCreatePanier(clientId);
    const [items] = await pool.query(
      `SELECT pi.idPanierItem, pi.quantite, pi.prix_unitaire,
              o.idOuvrage, o.titre
       FROM panier_items pi
       JOIN ouvrages o ON o.idOuvrage=pi.ouvrage_idOuvrage
       WHERE pi.panier_idPanier=?`,
      [panier.idPanier]
    );
    res.json({ ...panier, items });
  } catch (e) {
    console.error("PANIER_GET_ERR:", e);
    res.status(500).json({ error: "Erreur récupération panier" });
  }
}

// POST /api/panier/items   { client_idUser, ouvrage_idOuvrage, quantite, prix_unitaire? }
export async function addItem(req, res) {
  try {
    const {
      client_idUser,
      ouvrage_idOuvrage,
      quantite = 1,
      prix_unitaire,
    } = req.body;
    if (!client_idUser || !ouvrage_idOuvrage)
      return res
        .status(400)
        .json({ error: "client_idUser et ouvrage_idOuvrage requis" });

    const panier = await getOrCreatePanier(Number(client_idUser));

    // prix automatique si non fourni (prend le prix de l’ouvrage)
    let pu = prix_unitaire;
    if (pu == null) {
      const [[o]] = await pool.query(
        "SELECT prix FROM ouvrages WHERE idOuvrage=?",
        [Number(ouvrage_idOuvrage)]
      );
      if (!o) return res.status(404).json({ error: "Ouvrage introuvable" });
      pu = o.prix;
    }

    // si déjà présent, on augmente la quantité
    const [[exist]] = await pool.query(
      `SELECT * FROM panier_items WHERE panier_idPanier=? AND ouvrage_idOuvrage=?`,
      [panier.idPanier, Number(ouvrage_idOuvrage)]
    );
    if (exist) {
      await pool.query(
        `UPDATE panier_items SET quantite=quantite+? WHERE idPanierItem=?`,
        [Number(quantite), exist.idPanierItem]
      );
    } else {
      await pool.query(
        `INSERT INTO panier_items (panier_idPanier, ouvrage_idOuvrage, quantite, prix_unitaire)
         VALUES (?,?,?,?)`,
        [
          panier.idPanier,
          Number(ouvrage_idOuvrage),
          Number(quantite),
          Number(pu),
        ]
      );
    }
    const [items] = await pool.query(
      `SELECT pi.idPanierItem, pi.quantite, pi.prix_unitaire, o.idOuvrage, o.titre
       FROM panier_items pi JOIN ouvrages o ON o.idOuvrage=pi.ouvrage_idOuvrage
       WHERE pi.panier_idPanier=?`,
      [panier.idPanier]
    );
    res.status(201).json({ ...panier, items });
  } catch (e) {
    console.error("PANIER_ADD_ERR:", e);
    res.status(500).json({ error: "Erreur ajout item" });
  }
}

// PUT /api/panier/items/:idPanierItem   { quantite?, prix_unitaire? }
export async function updateItem(req, res) {
  try {
    const id = Number(req.params.idPanierItem);
    const { quantite, prix_unitaire } = req.body;
    await pool.query(
      `UPDATE panier_items
       SET quantite = COALESCE(?, quantite),
           prix_unitaire = COALESCE(?, prix_unitaire)
       WHERE idPanierItem=?`,
      [
        quantite != null ? Number(quantite) : null,
        prix_unitaire != null ? Number(prix_unitaire) : null,
        id,
      ]
    );
    const [[row]] = await pool.query(
      `SELECT pi.*, o.titre FROM panier_items pi
       JOIN ouvrages o ON o.idOuvrage=pi.ouvrage_idOuvrage
       WHERE pi.idPanierItem=?`,
      [id]
    );
    if (!row) return res.status(404).json({ error: "Item introuvable" });
    res.json(row);
  } catch (e) {
    console.error("PANIER_UPDATE_ERR:", e);
    res.status(500).json({ error: "Erreur MAJ item" });
  }
}

// DELETE /api/panier/items/:idPanierItem
export async function removeItem(req, res) {
  try {
    await pool.query("DELETE FROM panier_items WHERE idPanierItem=?", [
      Number(req.params.idPanierItem),
    ]);
    res.status(204).end();
  } catch (e) {
    console.error("PANIER_DELETE_ERR:", e);
    res.status(500).json({ error: "Erreur suppression item" });
  }
}

// DELETE /api/panier/clear/:idPanier  (vide le panier)
export async function clearPanier(req, res) {
  try {
    await pool.query("DELETE FROM panier_items WHERE panier_idPanier=?", [
      Number(req.params.idPanier),
    ]);
    res.status(204).end();
  } catch (e) {
    console.error("PANIER_CLEAR_ERR:", e);
    res.status(500).json({ error: "Erreur vidage panier" });
  }
}
