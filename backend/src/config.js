import dotenv from "dotenv";
import { resolve } from "node:path";

// charge .env depuis le dossier de travail (backend/.env)
dotenv.config({ path: resolve(process.cwd(), ".env") });

// expose les valeurs nécessaires
export const JWT_SECRET = process.env.JWT_SECRET;
export const NODE_ENV = process.env.NODE_ENV ?? "development";

// garde un garde-fou (utile en dev)
if (!JWT_SECRET) {
  console.error("JWT_SECRET manquant. Ajoute-le dans backend/.env");
}
