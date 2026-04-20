import React from 'react';
import { clsx } from 'clsx';
import { DocumentStatus } from '../types';
import { Loader2 } from 'lucide-react';

interface StatusBadgeProps {
  status: DocumentStatus;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const styles = {
    queued: 'bg-gray-100 text-gray-700 border-gray-200',
    processing: 'bg-blue-50 text-blue-700 border-blue-200',
    completed: 'bg-green-50 text-green-700 border-green-200',
    failed: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <span className={clsx(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize',
      styles[status],
      className
    )}>
      {status === 'processing' && <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />}
      {status}
    </span>
  );
};

export default StatusBadge;
