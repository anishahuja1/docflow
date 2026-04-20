import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDocument, useReviewDocument, useFinalizeDocument } from '../hooks/useDocuments';
import { useJobProgress } from '../hooks/useJobProgress';
import StatusBadge from '../components/StatusBadge';
import ProgressBar from '../components/ProgressBar';
import ExportButtons from '../components/ExportButtons';
import { ArrowLeft, Save, ShieldCheck, Info, FileText, Tag, List, Calendar, HardDrive, Type } from 'lucide-react';
import { format } from 'date-fns';
import { clsx } from 'clsx';

const DocumentDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { data: document, isLoading, refetch } = useDocument(id!);
    const reviewMutation = useReviewDocument();
    const finalizeMutation = useFinalizeDocument();

    // Only connect SSE if status is not completed/failed
    const showSSE = document && (document.status === 'queued' || document.status === 'processing');
    const { currentStage, progressPercent } = useJobProgress(showSSE ? id! : null);

    const [form, setForm] = useState({
        title: '',
        category: '',
        summary: '',
        keywords: ''
    });

    useEffect(() => {
        if (document) {
            const data = document.reviewed_data || document.extracted_data;
            if (data) {
                setForm({
                    title: data.title || '',
                    category: data.category || '',
                    summary: data.summary || '',
                    keywords: (data.keywords || []).join(', ')
                });
            }
        }
        
        // Refresh document data when progress reaches 100%
        if (progressPercent === 100) {
            refetch();
        }
    }, [document, progressPercent, refetch]);

    if (isLoading) return <div className="flex justify-center py-20 animate-pulse text-primary-600 font-medium">Loading Document...</div>;
    if (!document) return <div className="text-center py-20 text-gray-500">Document not found.</div>;

    const handleSave = () => {
        reviewMutation.mutate({
            id: id!,
            data: {
                ...form,
                keywords: form.keywords.split(',').map(k => k.trim()).filter(k => k !== '')
            }
        });
    };

    const handleFinalize = () => {
        if (window.confirm("Are you sure you want to finalize this record? No further edits will be allowed.")) {
            finalizeMutation.mutate(id!);
        }
    };

    const isEditable = document.status === 'completed' && !document.is_finalized;
    const currentData = document.reviewed_data || document.extracted_data;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-primary-600 mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to List
            </Link>

            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-3xl font-bold text-gray-900">{document.original_filename}</h1>
                        <StatusBadge status={document.status} />
                        {document.is_finalized && (
                            <span className="bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-xs font-bold border border-green-200 flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" />
                                FINALIZED
                            </span>
                        )}
                    </div>
                    <p className="text-gray-500 flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Uploaded {format(new Date(document.upload_time), 'PPP p')}</span>
                        <span className="flex items-center gap-1"><HardDrive className="w-4 h-4" /> {(document.file_size / 1024 / 1024).toFixed(2)} MB</span>
                    </p>
                </div>
                {document.status === 'completed' && (
                    <ExportButtons documentId={document.id} />
                )}
            </header>

            {(document.status === 'queued' || document.status === 'processing') && (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 mb-8">
                    <ProgressBar 
                        progress={progressPercent || 0} 
                        status="processing" 
                        label={currentStage || "Initializing workflow..."} 
                    />
                    <p className="mt-4 text-sm text-gray-500 text-center italic">
                        The agent is analyzing your file. This usually takes 5-10 seconds depending on file size.
                    </p>
                </div>
            )}

            {document.status === 'failed' && (
                <div className="bg-red-50 p-6 rounded-2xl border border-red-100 mb-8 flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-lg font-bold text-red-800">Processing Failed</h3>
                        <p className="text-red-700 mt-1">{document.error_message}</p>
                    </div>
                </div>
            )}

            {document.status === 'completed' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Panel: Extracted Data */}
                    <div className="space-y-6">
                        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Info className="w-5 h-5 text-primary-500" />
                                Extracted Analysis
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Summary</label>
                                    <p className="mt-1 text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl italic">
                                        "{document.extracted_data?.summary}"
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                     <div className="p-3 bg-gray-50 rounded-xl">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Category</label>
                                        <p className="text-sm font-semibold text-gray-700 capitalize">{document.extracted_data?.category}</p>
                                     </div>
                                     <div className="p-3 bg-gray-50 rounded-xl">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Word Count</label>
                                        <p className="text-sm font-semibold text-gray-700">{document.extracted_data?.word_count}</p>
                                     </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Keywords</label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {document.extracted_data?.keywords.map((k, i) => (
                                            <span key={i} className="px-2 py-1 bg-primary-50 text-primary-600 text-xs font-medium rounded-md border border-primary-100">
                                                {k}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary-500" />
                                File Metadata
                            </h2>
                            <div className="grid grid-cols-2 gap-y-4 text-sm">
                                <div>
                                    <p className="text-gray-500">MIME Type</p>
                                    <p className="font-semibold text-gray-800">{document.extracted_data?.file_metadata.file_type || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Size</p>
                                    <p className="font-semibold text-gray-800">{document.extracted_data?.file_metadata.file_size_human}</p>
                                </div>
                                {document.extracted_data?.file_metadata.page_count && (
                                    <div>
                                        <p className="text-gray-500">Pages</p>
                                        <p className="font-semibold text-gray-800">{document.extracted_data?.file_metadata.page_count}</p>
                                    </div>
                                )}
                                {document.extracted_data?.file_metadata.image_dimensions && (
                                    <div>
                                        <p className="text-gray-500">Dimensions</p>
                                        <p className="font-semibold text-gray-800">{document.extracted_data?.file_metadata.image_dimensions}</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Right Panel: Review & Edit */}
                    <div className="space-y-6">
                        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-full flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-primary-500" />
                                    Review & Edit
                                </h2>
                                {isEditable && (
                                    <div className="text-xs text-blue-600 flex items-center gap-1 font-medium animate-pulse">
                                        <Info className="w-3 h-3" />
                                        Modifying draft
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4 flex-1">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Document Title</label>
                                    <input
                                        type="text"
                                        disabled={!isEditable}
                                        className={clsx(
                                            "w-full px-4 py-2 border rounded-xl outline-none transition-all focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
                                            !isEditable ? "bg-gray-50 text-gray-500 border-gray-200" : "bg-white border-gray-300"
                                        )}
                                        value={form.title}
                                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                                    <select
                                        disabled={!isEditable}
                                        className={clsx(
                                            "w-full px-4 py-2 border rounded-xl outline-none transition-all focus:ring-2 focus:ring-primary-500",
                                            !isEditable ? "bg-gray-50 text-gray-500 border-gray-200" : "bg-white border-gray-300"
                                        )}
                                        value={form.category}
                                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                                    >
                                        <option value="text">Text</option>
                                        <option value="spreadsheet">Spreadsheet</option>
                                        <option value="document">Document</option>
                                        <option value="image">Image</option>
                                        <option value="pdf">PDF</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Summary</label>
                                    <textarea
                                        rows={4}
                                        disabled={!isEditable}
                                        className={clsx(
                                            "w-full px-4 py-2 border rounded-xl outline-none transition-all focus:ring-2 focus:ring-primary-500 resize-none",
                                            !isEditable ? "bg-gray-50 text-gray-500 border-gray-200" : "bg-white border-gray-300"
                                        )}
                                        value={form.summary}
                                        onChange={(e) => setForm({ ...form, summary: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center justify-between">
                                        Keywords (comma separated)
                                        <Tag className="w-4 h-4 text-gray-400" />
                                    </label>
                                    <input
                                        type="text"
                                        disabled={!isEditable}
                                        className={clsx(
                                            "w-full px-4 py-2 border rounded-xl outline-none transition-all focus:ring-2 focus:ring-primary-500",
                                            !isEditable ? "bg-gray-50 text-gray-500 border-gray-200" : "bg-white border-gray-300"
                                        )}
                                        value={form.keywords}
                                        onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                                    />
                                    {isEditable && <p className="mt-1 text-[10px] text-gray-400">Add comma-separated tags like: Invoice, Q3, Draft</p>}
                                </div>
                            </div>

                            {isEditable && (
                                <div className="mt-8 flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100">
                                    <button
                                        onClick={handleSave}
                                        disabled={reviewMutation.isPending}
                                        className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-white border border-primary-600 text-primary-600 rounded-xl font-bold hover:bg-primary-50 transition-all shadow-sm"
                                    >
                                        <Save className="w-5 h-5 mr-2" />
                                        {reviewMutation.isPending ? "Saving..." : "Save Draft"}
                                    </button>
                                    <button
                                        onClick={handleFinalize}
                                        disabled={finalizeMutation.isPending}
                                        className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200"
                                    >
                                        <ShieldCheck className="w-5 h-5 mr-2" />
                                        {finalizeMutation.isPending ? "Finalizing..." : "Finalize"}
                                    </button>
                                </div>
                            )}

                            {document.is_finalized && (
                                 <div className="mt-8 p-4 bg-green-50 rounded-xl border border-green-100 flex items-center gap-3">
                                    <div className="p-2 bg-green-100 rounded-full">
                                        <ShieldCheck className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-green-800">Record Locked</p>
                                        <p className="text-xs text-green-600 font-medium">Finalized on {document.finalized_at ? format(new Date(document.finalized_at), 'PPP p') : 'Unknown'}</p>
                                    </div>
                                 </div>
                            )}
                        </section>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentDetail;
