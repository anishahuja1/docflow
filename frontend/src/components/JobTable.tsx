import React from 'react';
import { ProcessingJob } from '../types';
import StatusBadge from './StatusBadge';
import { formatDistanceToNow } from 'date-fns';
import { Eye, RotateCcw, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProgressBar from './ProgressBar';

interface JobTableProps {
  jobs: ProcessingJob[];
  onRetry: (id: string) => void;
  isRetrying: boolean;
}

const JobTable: React.FC<JobTableProps> = ({ jobs, onRetry, isRetrying }) => {
  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Document</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Progress</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Uploaded</th>
            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {jobs.map((job) => (
            <tr key={job.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900 truncate max-w-xs" title={job.document?.original_filename}>
                    {job.document?.original_filename || 'Unknown'}
                  </span>
                  <span className="text-xs text-gray-500">{job.document?.file_type}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={job.status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap w-48">
                {job.status === 'processing' || job.status === 'queued' ? (
                  <div className="w-32">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-primary-500 h-1.5 rounded-full transition-all duration-500" 
                        style={{ width: `${job.progress_percent}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1">{job.current_stage || 'Initializing...'}</span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-600">{job.progress_percent}%</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end gap-2">
                  <Link
                    to={`/documents/${job.document_id}`}
                    className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-5 h-5" />
                  </Link>
                  {job.status === 'failed' && job.retry_count < job.max_retries && (
                    <button
                      onClick={() => onRetry(job.id)}
                      disabled={isRetrying}
                      className="p-2 text-gray-400 hover:text-orange-600 transition-colors disabled:opacity-50"
                      title="Retry Job"
                    >
                      <RotateCcw className={`w-5 h-5 ${isRetrying ? 'animate-spin' : ''}`} />
                    </button>
                  )}
                  {job.status === 'failed' && (
                    <div title={job.error_message || 'Unknown error'}>
                       <AlertCircle className="w-5 h-5 text-red-400 p-2" />
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {jobs.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                No jobs found matching your criteria.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default JobTable;
