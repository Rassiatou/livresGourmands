import jwt from "jsonwebtoken";

function getJwtSecret() {
  return process.env.JWT_SECRET?.trim() || "dev_secret_change_me";
}

export function requireAuth(req, res, next) {
  try {
    const h = req.headers.authorization || "";
    const token = h.startsWith("Bearer ") ? h.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Token manquant" });
    const decoded = jwt.verify(token, getJwtSecret());
    req.user = {
      ...decoded,
      id: decoded.id ?? decoded.idUser,
      idUser: decoded.idUser ?? decoded.id,
    };
    next();
  } catch {
    return res.status(401).json({ error: "Token invalide" });
  }
}

export function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Non authentifié" });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Accès refusé" });
    }
    next();
  };
}
