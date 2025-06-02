// src/services/technicianService.js
import api from "./api";

export const getTechnicians = async () => {
  const res = await api.get("/technicians");
  return res.data; // [{id,name,email}, …]
};

export const createTechnician = async (payload) => {
  // payload: { name, email, password }
  const res = await api.post("/auth/register", {
    ...payload,
    role: "technician",
  });
  return res.data; // {id,email,name,role,…}
};
