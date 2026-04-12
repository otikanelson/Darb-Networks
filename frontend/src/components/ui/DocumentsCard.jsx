import React from 'react';
import { FileText, ExternalLink, Shield, Download } from 'lucide-react';

const DocumentsCard = ({ documents }) => {
  if (!documents || !Array.isArray(documents) || documents.length === 0) {
    return null;
  }

  const getDocumentIcon = (type) => {
    switch (type) {
      case 'registration':
        return '📋';
      case 'financial':
        return '💰';
      case 'pitch_deck':
        return '📊';
      case 'business_plan':
        return '📈';
      case 'legal':
        return '⚖️';
      default:
        return '📄';
    }
  };

  const getDocumentTypeLabel = (type) => {
    switch (type) {
      case 'registration':
        return 'Business Registration';
      case 'financial':
        return 'Financial Statement';
      case 'pitch_deck':
        return 'Pitch Deck';
      case 'business_plan':
        return 'Business Plan';
      case 'legal':
        return 'Legal Document';
      default:
        return 'Document';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-lg bg-primary-100">
          <Shield className="h-4 w-4 text-primary-700" />
        </div>
        <h3 className="text-base font-semibold text-gray-900">Verified Documents</h3>
      </div>

      <div className="space-y-3">
        {documents.map((doc, index) => (
          <a
            key={index}
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50/50 transition-all group"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-50 group-hover:bg-primary-100 flex items-center justify-center text-xl transition">
              {getDocumentIcon(doc.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm truncate group-hover:text-primary-700 transition">
                {doc.name}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {getDocumentTypeLabel(doc.type)}
              </p>
            </div>
            <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-primary-600 flex-shrink-0 transition" />
          </a>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5 text-primary-500" />
          These documents have been provided by the campaign creator for verification purposes
        </p>
      </div>
    </div>
  );
};

export default DocumentsCard;
