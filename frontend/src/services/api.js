import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001/api", // ton backend Node
});

// GET /api/ouvrages
export const fetchOuvrages = async () => {
  const res = await api.get("/ouvrages");
  return res.data;
};

// GET /api/ouvrages/:id
export const fetchOuvrageById = async (id) => {
  const res = await api.get(`/ouvrages/${id}`);
  return res.data;
};

export default api;
