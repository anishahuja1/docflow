import React from 'react';
import { Search, Filter } from 'lucide-react';

interface SearchAndFilterProps {
  search: string;
  onSearchChange: (val: string) => void;
  status: string;
  onStatusChange: (val: string) => void;
  sortBy: string;
  onSortByChange: (val: string) => void;
  order: string;
  onOrderChange: (val: string) => void;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  search, onSearchChange,
  status, onStatusChange,
  sortBy, onSortByChange,
  order, onOrderChange
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6 items-end">
      <div className="flex-1 w-full">
        <label className="block text-sm font-medium text-gray-700 mb-1">Search Documents</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Filename..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="w-full md:w-48">
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="queued">Queued</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div className="w-full md:w-48">
        <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
        <select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option value="created_at">Date Created</option>
          <option value="filename">Filename</option>
          <option value="status">Status</option>
        </select>
      </div>

      <button
        onClick={() => onOrderChange(order === 'asc' ? 'desc' : 'asc')}
        className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-gray-700 transition-colors h-[42px]"
      >
        {order.toUpperCase()}
      </button>
    </div>
  );
};

export default SearchAndFilter;
