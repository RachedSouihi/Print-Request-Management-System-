// services/profdocs.ts
import axios from 'axios';

export const BASE_URL = 'http://localhost:8082/doc';

export interface BackendDocument {
  id: string;
  title: string;
  docType: 'Cours' | 'Exercice' | 'Examen'; // backend uses "docType"
  dateAdded: string;
  deadline?: string;
  fileUrl: string;
  description?: string;
  subject?: string;
  visibility?: string;
  message?: string;
}

export const getProfDocuments = async (profId: string, page = 0, size = 20) => {
  const response = await axios.get(`${BASE_URL}/profdoc/${profId}`, {
    params: { page, size }
  });
  return response.data; // Should be an array or a paginated object
};

export const updateProfDocument = async (docId: string, updatedData: Partial<BackendDocument>) => {
  const response = await axios.put(`${BASE_URL}/profdocupdate/${docId}`, updatedData);
  return response.data;
};

export const deleteProfDocument = async (docId: string) => {
  const response = await axios.delete(`${BASE_URL}/profdocdelete/${docId}`);
  return response.data;
};
