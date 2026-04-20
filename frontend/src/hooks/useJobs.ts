import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/jobs';

export const useJobs = (params: any, refetchInterval?: number) => {
  return useQuery({
    queryKey: ['jobs', params],
    queryFn: () => api.getJobs(params),
    refetchInterval,
  });
};

export const useJob = (id: string) => {
  return useQuery({
    queryKey: ['job', id],
    queryFn: () => api.getJob(id),
    enabled: !!id,
  });
};

export const useRetryJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.retryJob(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['job', id] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
};
