import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/documents';

export const useDocuments = (params: any) => {
  return useQuery({
    queryKey: ['documents', params],
    queryFn: () => api.getDocuments(params),
  });
};

export const useDocument = (id: string) => {
  return useQuery({
    queryKey: ['document', id],
    queryFn: () => api.getDocument(id),
    enabled: !!id,
  });
};

export const useReviewDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.reviewDocument(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['document', id] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
};

export const useFinalizeDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.finalizeDocument(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['document', id] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
};
