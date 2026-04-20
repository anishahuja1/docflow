import { useState, useEffect } from 'react';
import { ProgressEvent } from '../types';
import apiClient from '../api/client';

export const useJobProgress = (jobId: string | null) => {
  const [currentStage, setCurrentStage] = useState<string | null>(null);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [events, setEvents] = useState<ProgressEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    const eventSource = new EventSource(`${API_BASE_URL}/api/v1/progress/${jobId}`);

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    eventSource.onmessage = (event) => {
      const data: ProgressEvent = JSON.parse(event.data);
      setCurrentStage(data.message);
      setProgressPercent(data.progress);
      setEvents((prev) => [...prev, data]);

      if (data.event === 'job_completed' || data.event === 'job_failed') {
        eventSource.close();
        setIsConnected(false);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE Error:', err);
      setError('Connection to progress stream failed.');
      eventSource.close();
      setIsConnected(false);
    };

    return () => {
      eventSource.close();
    };
  }, [jobId]);

  return { currentStage, progressPercent, events, isConnected, error };
};
