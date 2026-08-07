import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Image as ImageIcon, 
  ExternalLink, 
  FolderOpen, 
  Copy, 
  Check, 
  Brain, 
  Eye, 
  Tag,
  Calendar,
  Sparkles,
  Layers,
  Folder
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { apiService } from '../services/apiService';
import { semanticSearchService } from '../services/semanticSearchService';
import { useApp } from '../context/AppContext';

export const FilePreviewModal = ({ file, onClose }) => {
  const { addToast, setPreviewFile } = useApp();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'text' | 'ocr' | 'similar'

  if (!file) return null;

  const similarFiles = semanticSearchService.getSimilarFiles(file.id);

  const handleCopyPath = () => {
    navigator.clipboard.writeText(file.path);
    setCopied(true);
    addToast('File path copied to clipboard', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenFile = () => {
    apiService.openFile(file.path);
  };

  const handleLocateFile = () => {
    apiService.locateFile(file.path);
  };

  return (
    <Modal
      isOpen={!!file}
      onClose={onClose}
      title={file.name}
      subtitle={file.path}
      maxWidth="max-w-3xl"
      actions={
        <>
          <Button variant="ghost" size="sm" icon={copied ? Check : Copy} onClick={handleCopyPath}>
            {copied ? 'Copied Path' : 'Copy Path'}
          </Button>
          <Button variant="secondary" size="sm" icon={FolderOpen} onClick={handleLocateFile}>
            Locate
          </Button>
          <Button variant="primary" size="sm" icon={ExternalLink} onClick={handleOpenFile}>
            Open File
          </Button>
        </>
      }
    >
      <div className="space-y-6 select-none">
        {/* Top Disclaimer */}
        <div className="flex items-center justify-between text-[11px] text-gray-500 font-mono border-b border-gray-800 pb-2">
          <span>Memora AI Local Inspector</span>
          <span className="text-blue-400 font-semibold">[Simulated Local AI Engine]</span>
        </div>

        {/* Preview Header Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-gray-900/80 border border-gray-800">
            <div className="text-[11px] text-gray-400 font-medium mb-0.5">File Format</div>
            <div className="text-xs font-semibold text-white uppercase">{file.fileExtension || file.category}</div>
          </div>

          <div className="p-3 rounded-xl bg-gray-900/80 border border-gray-800">
            <div className="text-[11px] text-gray-400 font-medium mb-0.5">File Size</div>
            <div className="text-xs font-semibold text-white font-mono">
              {(file.sizeBytes / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>

          <div className="p-3 rounded-xl bg-gray-900/80 border border-gray-800">
            <div className="text-[11px] text-gray-400 font-medium mb-0.5">Last Modified</div>
            <div className="text-xs font-semibold text-white font-mono">
              {new Date(file.modifiedAt).toLocaleDateString()}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-gray-900/80 border border-emerald-500/30 bg-emerald-950/20">
            <div className="text-[11px] text-emerald-400 font-medium mb-0.5">Relevance Score</div>
            <div className="text-xs font-extrabold text-emerald-300 font-mono">
              {file.relevanceScore || 95}% Match
            </div>
          </div>
        </div>

        {/* Location Chip */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-950/70 border border-gray-800 text-xs font-mono text-gray-300">
          <Folder className="w-4 h-4 text-blue-400 shrink-0" />
          <span className="truncate">{file.path}</span>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-gray-800 pb-2">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'summary'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            AI Insight & Tags
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'text'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Extracted Text Content
          </button>
          {file.ocrText && (
            <button
              onClick={() => setActiveTab('ocr')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'ocr'
                  ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              EasyOCR Output
            </button>
          )}
          <button
            onClick={() => setActiveTab('similar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'similar'
                ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Similar Memories ({similarFiles.length})
          </button>
        </div>

        {/* Tab Content Display */}
        {activeTab === 'summary' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-blue-950/25 border border-blue-500/30">
              <h4 className="text-xs font-semibold text-blue-400 flex items-center gap-2 mb-1.5">
                <Brain className="w-4 h-4 text-blue-400" />
                <span>AI Memory Summary</span>
              </h4>
              <p className="text-xs text-gray-200 leading-relaxed">{file.aiSummary}</p>
            </div>

            {file.explanation && (
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/25 text-xs text-purple-200">
                <strong className="text-purple-300 block mb-1 font-semibold">Semantic Match Rationale:</strong>
                "{file.explanation}"
              </div>
            )}

            <div>
              <h4 className="text-xs font-semibold text-gray-400 mb-2 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                <span>Indexed Conceptual Tags</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {file.tags.map((tag, idx) => (
                  <Badge key={idx} variant="blue" size="sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'text' && (
          <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 text-xs text-gray-300 font-mono leading-relaxed max-h-60 overflow-y-auto custom-scrollbar">
            {file.extractedSnippet || 'No raw document text extracted for this file format.'}
          </div>
        )}

        {activeTab === 'ocr' && file.ocrText && (
          <div className="p-4 rounded-xl bg-gray-950 border border-purple-500/30 text-xs text-purple-200 font-mono leading-relaxed max-h-60 overflow-y-auto custom-scrollbar">
            <div className="text-[10px] text-purple-400 uppercase tracking-wider mb-2 font-bold">
              [OpenCV Preprocessed EasyOCR Stream]
            </div>
            {file.ocrText}
          </div>
        )}

        {activeTab === 'similar' && (
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-gray-400 flex items-center gap-1.5 mb-3">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Vector Nearest Neighbors in Index</span>
            </h4>

            {similarFiles.length === 0 ? (
              <p className="text-xs text-gray-500 italic">No similar files detected in local index.</p>
            ) : (
              similarFiles.map(simFile => (
                <div
                  key={simFile.id}
                  onClick={() => setPreviewFile(simFile)}
                  className="p-3 rounded-xl glass-panel border-gray-800 hover:border-emerald-500/40 cursor-pointer flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-xs font-semibold text-gray-200 truncate">{simFile.name}</h5>
                      <p className="text-[11px] text-gray-400 truncate">{simFile.aiSummary}</p>
                    </div>
                  </div>
                  <Badge variant="success" size="sm">Inspect</Badge>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
