import React, { useState } from 'react';
import { useJobs, useRetryJob } from '../hooks/useJobs';
import JobTable from '../components/JobTable';
import SearchAndFilter from '../components/SearchAndFilter';
import { Upload, ChevronLeft, ChevronRight, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const [params, setParams] = useState({
    search: '',
    status: 'all',
    sort_by: 'created_at',
    order: 'desc',
    page: 1,
    page_size: 10,
  });

  const { data, isLoading } = useJobs(params, 5000); // 5s refresh
  const retryMutation = useRetryJob();

  const handleRetry = (id: string) => {
    retryMutation.mutate(id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-primary-600" />
            Document Jobs
          </h1>
          <p className="text-gray-500 mt-1">Manage and track your document processing workflows.</p>
        </div>
        <Link
          to="/upload"
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200"
        >
          <Upload className="w-5 h-5 mr-2" />
          New Upload
        </Link>
      </div>

      <SearchAndFilter
        search={params.search}
        onSearchChange={(v) => setParams({ ...params, search: v, page: 1 })}
        status={params.status}
        onStatusChange={(v) => setParams({ ...params, status: v, page: 1 })}
        sortBy={params.sort_by}
        onSortByChange={(v) => setParams({ ...params, sort_by: v })}
        order={params.order}
        onOrderChange={(v) => setParams({ ...params, order: v })}
      />

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          <JobTable
            jobs={data?.items || []}
            onRetry={handleRetry}
            isRetrying={retryMutation.isPending}
          />

          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{((params.page - 1) * params.page_size) + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(params.page * params.page_size, data?.total || 0)}
              </span>{' '}
              of <span className="font-medium">{data?.total || 0}</span> results
            </p>
            <div className="flex gap-2">
              <button
                disabled={params.page === 1}
                onClick={() => setParams({ ...params, page: params.page - 1 })}
                className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                disabled={!data || params.page >= data.total_pages}
                onClick={() => setParams({ ...params, page: params.page + 1 })}
                className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
