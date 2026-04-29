import axios from "axios";

const API = "http://localhost:8009/api/admin/pricing";
const BFF = "http://localhost:8009/api/admin";

// 🔹 Obtener lista de libros con precios
export const getPricingList = async () => {
  const res = await axios.get(`${API}`);
  return res.data;
};

// 🔹 Calcular precio de todos los libros del catálogo
export const bulkCalculate = async () => {
  const res = await axios.post(`${BFF}/pricing/bulk-calculate`);
  return res.data;
};

// 🔹 Recalcular precio de un libro
export const recalculatePrice = async (
  book_id: string,
  book_title: string,
  condition: string,
) => {
  const res = await axios.post(`${API}/calculate`, { book_id, book_title, condition });
  return res.data;
};

// 🔹 Obtener historial por libro
export const getPriceHistory = async (book_id: string) => {
  const res = await axios.get(`${API}/history/${book_id}`);
  return res.data;
};

// 🔹 Obtener reportes globales
export const getReports = async () => {
  const res = await axios.get(`${API}/reports`);
  return res.data;
};

// 🔹 Configuración
export const getConfig = async () => {
  const res = await axios.get(`${API}/config`);
  return res.data;
};

export const saveConfig = async (config: any) => {
  const res = await axios.post(`${API}/config`, config);
  return res.data;
};