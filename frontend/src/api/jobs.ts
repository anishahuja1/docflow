import apiClient from './client';
import { ProcessingJob, PaginatedResponse } from '../types';

export const getJobs = async (params: any) => {
  const { data } = await apiClient.get<PaginatedResponse<ProcessingJob>>('/jobs', { params });
  return data;
};

export const getJob = async (id: string) => {
  const { data } = await apiClient.get<ProcessingJob>(`/jobs/${id}`);
  return data;
};

export const retryJob = async (id: string) => {
  const { data } = await apiClient.post<ProcessingJob>(`/jobs/${id}/retry`);
  return data;
};
