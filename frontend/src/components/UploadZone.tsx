import React, { useCallback, useState } from 'react';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

const UploadZone: React.FC<UploadZoneProps> = ({ onFilesSelected, maxFiles = 10, maxSizeMB = 50 }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    
    setError(null);
    const validFiles: File[] = [];
    const currentTotal = selectedFiles.length;
    
    if (currentTotal + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed at once.`);
      return;
    }

    for (let i = 0; i < files.length; i++) {
        if (files[i].size > maxSizeMB * 1024 * 1024) {
            setError(`File ${files[i].name} exceeds ${maxSizeMB}MB limit.`);
            continue;
        }
        validFiles.push(files[i]);
    }

    const newFiles = [...selectedFiles, ...validFiles];
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
  };

  const onDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
  };

  return (
    <div className="w-full">
      <div
        onDragEnter={onDrag}
        onDragLeave={onDrag}
        onDragOver={onDrag}
        onDrop={onDrop}
        className={clsx(
          "relative border-2 border-dashed rounded-xl p-12 transition-all flex flex-col items-center justify-center cursor-pointer",
          dragActive ? "border-primary-500 bg-primary-50" : "border-gray-300 hover:border-primary-400 bg-white"
        )}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="p-4 bg-primary-100 rounded-full text-primary-600 mb-4">
          <Upload className="w-8 h-8" />
        </div>
        <p className="text-lg font-semibold text-gray-900">Click or drag files here to upload</p>
        <p className="text-sm text-gray-500 mt-1">PDF, TXT, DOCX, CSV, PNG, JPG (Max {maxSizeMB}MB)</p>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div className="mt-6 space-y-2">
          <h4 className="text-sm font-semibold text-gray-700">Selected Files ({selectedFiles.length})</h4>
          {selectedFiles.map((file, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg group">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UploadZone;
