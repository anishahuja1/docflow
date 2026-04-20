import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/Upload';
import DocumentDetail from './pages/DocumentDetail';
import { FileStack, Github } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
          {/* Navigation */}
          <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm backdrop-blur-md bg-white/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16 items-center">
                <Link to="/" className="flex items-center gap-2 group">
                  <div className="p-2 bg-primary-600 rounded-lg text-white group-hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200">
                    <FileStack className="w-6 h-6" />
                  </div>
                  <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                    DocFlow
                  </span>
                </Link>
                <div className="flex items-center gap-6">
                  <Link to="/" className="text-sm font-semibold text-slate-600 hover:text-primary-600 transition-colors">Dashboard</Link>
                  <Link to="/upload" className="text-sm font-semibold text-slate-600 hover:text-primary-600 transition-colors">Upload</Link>
                  <div className="h-6 w-[1px] bg-slate-200"></div>
                  <a href="https://github.com" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-600 transition-colors">
                    <Github className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/documents/:id" element={<DocumentDetail />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-slate-200 py-8">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <div className="flex justify-center items-center gap-2 text-slate-400 text-sm mb-2">
                <FileStack className="w-4 h-4" />
                <span className="font-bold tracking-widest uppercase">DocFlow Systems</span>
              </div>
              <p className="text-slate-400 text-[10px]">
                &copy; 2024 DocFlow. Production-grade Async Document Intelligence.
              </p>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
