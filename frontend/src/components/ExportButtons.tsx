import React from 'react';
import { Download, FileJson, FileSpreadsheet } from 'lucide-react';
import { getExportUrl } from '../api/documents';

interface ExportButtonsProps {
  documentId: string;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({ documentId }) => {
  return (
    <div className="flex gap-2">
      <a
        href={getExportUrl(documentId, 'json')}
        download
        className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
      >
        <FileJson className="w-4 h-4 mr-2 text-primary-600" />
        Export JSON
      </a>
      <a
        href={getExportUrl(documentId, 'csv')}
        download
        className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
      >
        <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
        Export CSV
      </a>
    </div>
  );
};

export default ExportButtons;
