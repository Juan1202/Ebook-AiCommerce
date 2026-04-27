import axios from "axios";

const BFF = "http://localhost:8009";

export interface UploadResult {
  inserted: string[];
  duplicated: string[];
  errors: string[];
  total: number;
}

export const uploadExcel = async (file: File): Promise<UploadResult> => {
  const form = new FormData();
  form.append("file", file);
  const res = await axios.post(`${BFF}/api/enrichment-real/upload-excel`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const getEnrichmentStatus = async () => {
  const res = await axios.get(`${BFF}/api/admin/enrichment/status`);
  return res.data;
};
