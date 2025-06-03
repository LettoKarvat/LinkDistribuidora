// src/services/technicianService.js
import api from "./api";

export const getTechnicians = async () => {
  const res = await api.get("/technicians");
  return res.data;
};

export const createTechnician = async (payload) => {
  const res = await api.post("/auth/register", {
    ...payload,
    role: "technician",
  });
  return res.data;
};

export const updateTechnician = async (id, payload) => {
  const res = await api.put(`/technicians/${id}`, payload);
  return res.data;
};

export const deleteTechnician = async (id) => {
  const res = await api.delete(`/technicians/${id}`);
  return res.data;
};
