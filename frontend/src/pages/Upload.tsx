import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UploadZone from '../components/UploadZone';
import { uploadDocuments } from '../api/documents';
import ProgressBar from '../components/ProgressBar';
import { ArrowLeft, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const UploadPage: React.FC = () => {
    const navigate = useNavigate();
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleUpload = async () => {
        if (files.length === 0) return;
        
        setUploading(true);
        setError(null);
        try {
            const data = await uploadDocuments(files);
            setResults(data);
            // Optionally redirect after a short delay
            // navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.detail || "Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-primary-600 mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Dashboard
            </Link>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-100">
                    <h1 className="text-2xl font-bold text-gray-900">Upload Documents</h1>
                    <p className="text-gray-500 mt-1">Select one or more documents to process. Max 10 files per batch.</p>
                </div>

                <div className="p-8">
                    {!results.length ? (
                        <>
                            <UploadZone onFilesSelected={setFiles} />
                            
                            {error && (
                                <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm font-medium">{error}</p>
                                </div>
                            )}

                            <button
                                onClick={handleUpload}
                                disabled={files.length === 0 || uploading}
                                className="mt-8 w-full py-4 bg-primary-600 text-white rounded-xl font-bold text-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary-200"
                            >
                                {uploading ? "Uploading..." : `Process ${files.length} ${files.length === 1 ? 'File' : 'Files'}`}
                            </button>
                        </>
                    ) : (
                        <div className="space-y-6">
                            <div className="p-4 bg-green-50 text-green-700 rounded-xl flex items-center gap-3">
                                <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                                <p className="font-semibold">Successfully queued {results.length} files!</p>
                            </div>
                            
                            <div className="space-y-3">
                                {results.map((res, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-5 h-5 text-primary-500" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{res.filename}</p>
                                                <p className="text-xs text-blue-600 font-medium">Status: Queued</p>
                                            </div>
                                        </div>
                                        <Link 
                                            to={`/documents/${res.document_id}`}
                                            className="text-sm font-semibold text-primary-600 hover:text-primary-700"
                                        >
                                            Track Progress →
                                        </Link>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => { setResults([]); setFiles([]); }}
                                    className="flex-1 py-3 px-4 bg-white border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                                >
                                    Upload More
                                </button>
                                <Link
                                    to="/"
                                    className="flex-1 py-3 px-4 bg-primary-600 text-white text-center rounded-xl font-semibold hover:bg-primary-700 transition-all"
                                >
                                    Go to Dashboard
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UploadPage;
