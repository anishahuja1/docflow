import apiClient from './client';
import { Document, PaginatedResponse, ExtractedData } from '../types';

export const uploadDocuments = async (files: File[]) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  const { data } = await apiClient.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const getDocuments = async (params: any) => {
  const { data } = await apiClient.get<PaginatedResponse<Document>>('/documents', { params });
  return data;
};

export const getDocument = async (id: string) => {
  const { data } = await apiClient.get<Document>(`/documents/${id}`);
  return data;
};

export const reviewDocument = async (id: string, reviewedData: Partial<ExtractedData>) => {
  const { data } = await apiClient.patch<Document>(`/documents/${id}/review`, { reviewed_data: reviewedData });
  return data;
};

export const finalizeDocument = async (id: string) => {
  const { data } = await apiClient.post<Document>(`/documents/${id}/finalize`);
  return data;
};

export const getExportUrl = (id: string, type: 'json' | 'csv') => {
  return `${apiClient.defaults.baseURL}/documents/${id}/export/${type}`;
};
