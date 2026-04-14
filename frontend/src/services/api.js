import api from "../api/axiosClient";

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
