import React from 'react';
import { clsx } from 'clsx';
import { DocumentStatus } from '../types';

interface ProgressBarProps {
  progress: number;
  status?: DocumentStatus;
  label?: string;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, status = 'processing', label, className }) => {
  const colors = {
    queued: 'bg-gray-400',
    processing: 'bg-primary-500',
    completed: 'bg-green-500',
    failed: 'bg-red-500',
  };

  return (
    <div className={clsx('w-full', className)}>
      <div className="flex justify-between mb-1 items-center">
        {label && <span className="text-sm font-medium text-gray-700 truncate">{label}</span>}
        <span className="text-sm font-medium text-gray-600">{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className={clsx('h-2.5 rounded-full transition-all duration-500 ease-out', colors[status])}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
