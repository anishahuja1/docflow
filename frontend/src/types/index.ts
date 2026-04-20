export type DocumentStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface ExtractedData {
  title: string;
  category: string;
  summary: string;
  word_count: number;
  line_count: number;
  keywords: string[];
  file_metadata: {
    filename: string;
    file_type: string;
    file_size_bytes: number;
    file_size_human: string;
    page_count: number | null;
    image_dimensions: string | null;
  };
  processing_timestamp: string;
}

export interface Document {
  id: string;
  filename: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  status: DocumentStatus;
  upload_time: string;
  processed_at: string | null;
  extracted_data: ExtractedData | null;
  reviewed_data: ExtractedData | null;
  is_finalized: boolean;
  finalized_at: string | null;
  error_message: string | null;
}

export interface ProcessingJob {
  id: string;
  document_id: string;
  status: DocumentStatus;
  celery_task_id: string | null;
  current_stage: string | null;
  progress_percent: number;
  retry_count: number;
  max_retries: number;
  created_at: string;
  updated_at: string;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  document?: Document;
}

export interface ProgressEvent {
  event: string;
  job_id: string;
  progress: number;
  message: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
