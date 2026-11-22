/**
 * Campaign Review & Submit Step
 * Shows preview of campaign and checklist of missing/invalid fields
 */

import React, { useState } from 'react';
import { AlertCircle, CheckCircle, ChevronRight, Send, FileText } from 'lucide-react';

const CampaignReviewStep = ({
  form,
  errors,
  onStepClick,
  onSubmit,
  isSubmitting,
}) => {
  const [openSections, setOpenSections] = useState({
    basics: true,
    funding: true,
    checklist: true,
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const stripHtml = (html) => html?.replace(/<[^>]*>/g, '').trim() || '';

  // Validation checklist
  const checklist = [
    {
      name: 'Campaign Title',
      step: 'basics',
      valid: form.title && form.title.length >= 10,
      error: errors?.title,
    },
    {
      name: 'Description',
      step: 'basics',
      valid: stripHtml(form.description).length >= 50,
      error: errors?.description,
    },
    {
      name: 'Category & Country',
      step: 'basics',
      valid: form.category && form.country,
      error: errors?.category || errors?.country,
    },
    {
      name: 'Problem Statement',
      step: 'problem',
      valid: stripHtml(form.problemStatement).length > 0,
      error: errors?.problemStatement,
    },
    {
      name: 'Solution',
      step: 'solution',
      valid: stripHtml(form.solution).length > 0,
      error: errors?.solution,
    },
    {
      name: 'Target Amount',
      step: 'funding',
      valid: parseFloat(form.targetAmount) >= 100000,
      error: errors?.targetAmount,
    },
    {
      name: 'Minimum Investment',
      step: 'funding',
      valid: parseFloat(form.minimumInvestment) >= 1000,
      error: errors?.minimumInvestment,
    },
    {
      name: 'End Date',
      step: 'funding',
      valid: form.endDate && form.endDate.length > 0,
      error: errors?.endDate,
    },
    {
      name: 'Cover Image',
      step: 'media',
      valid: form.mainImageUrl || false,
      error: errors?.mainImageUrl,
    },
  ];

  const allValid = checklist.every(item => item.valid);
  const invalidItems = checklist.filter(item => !item.valid);

  return (
    <div className="space-y-8">
      {/* Campaign Preview */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {/* Header preview */}
        <div className="relative h-64 bg-gradient-to-br from-primary-500 to-primary-700 overflow-hidden">
          {form.mainImageUrl && (
            <img 
              src={typeof form.mainImageUrl === 'string' ? form.mainImageUrl : URL.createObjectURL(form.mainImageUrl)}
              alt={form.title} 
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/40 flex items-end p-6">
            <div>
              <p className="text-xs text-primary-100 uppercase tracking-wide font-semibold">{form.category}</p>
              <h1 className="text-3xl font-bold text-white mt-2 leading-tight">{form.title || 'Your Campaign Title'}</h1>
              <p className="text-primary-100 text-sm mt-2">{form.location}, {form.country}</p>
            </div>
          </div>
        </div>

        {/* Content preview */}
        <div className="p-8 space-y-6">
          {/* Description */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Overview</h3>
            <p className="text-gray-700 leading-relaxed">
              {stripHtml(form.description) || 'Your campaign description will appear here'}
            </p>
          </div>

          {/* Funding info */}
          {form.targetAmount && (
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="text-xs text-gray-600 uppercase font-semibold">Target Amount</p>
                <p className="text-lg font-bold text-gray-900 mt-1">₦{parseFloat(form.targetAmount || 0).toLocaleString('en-NG')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase font-semibold">Min Investment</p>
                <p className="text-lg font-bold text-gray-900 mt-1">₦{parseFloat(form.minimumInvestment || 0).toLocaleString('en-NG')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase font-semibold">Deadline</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{form.endDate ? new Date(form.endDate).toLocaleDateString() : 'TBD'}</p>
              </div>
            </div>
          )}

          {/* Problem & Solution */}
          {stripHtml(form.problemStatement) && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">The Problem</h3>
              <p className="text-gray-700 leading-relaxed">{stripHtml(form.problemStatement)}</p>
            </div>
          )}

          {stripHtml(form.solution) && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Our Solution</h3>
              <p className="text-gray-700 leading-relaxed">{stripHtml(form.solution)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Validation Checklist */}
      <div className="border border-gray-200 rounded-2xl overflow-hidden">
        <button
          onClick={() => toggleSection('checklist')}
          className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            {allValid ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-500" />
            )}
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">
                {allValid ? 'Ready to Submit' : `${invalidItems.length} Item${invalidItems.length !== 1 ? 's' : ''} Missing`}
              </h3>
              <p className="text-xs text-gray-600 mt-0.5">
                {allValid 
                  ? 'Everything looks good. Submit when ready.'
                  : 'Complete these items before submitting.'}
              </p>
            </div>
          </div>
          <ChevronRight className={`h-5 w-5 text-gray-400 transition transform ${openSections.checklist ? 'rotate-90' : ''}`} />
        </button>

        {openSections.checklist && (
          <div className="divide-y divide-gray-100">
            {checklist.map((item, idx) => (
              <div key={idx} className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {item.valid ? (
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className={`font-medium ${item.valid ? 'text-gray-900' : 'text-red-700'}`}>
                        {item.name}
                      </p>
                      {item.error && (
                        <p className="text-xs text-red-600 mt-1">{item.error}</p>
                      )}
                    </div>
                  </div>
                  {!item.valid && (
                    <button
                      onClick={() => onStepClick(item.step)}
                      className="ml-4 px-3 py-1 text-xs font-medium text-primary-600 hover:bg-primary-50 rounded transition flex-shrink-0"
                    >
                      Fix <ChevronRight className="h-3 w-3 inline ml-1" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submission info */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <div className="flex gap-3">
          <FileText className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">What happens next?</p>
            <p className="mt-2">
              Once submitted, your campaign will be reviewed by our team. We typically approve campaigns within 2–3 business days. 
              You'll receive an email update and can track the status in <strong>My Campaigns</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Submit button */}
      <div className="flex gap-3">
        <button
          onClick={() => onStepClick('basics')}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
        >
          Back
        </button>
        <button
          onClick={onSubmit}
          disabled={!allValid || isSubmitting}
          className="flex-1 px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Submitting…
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Submit for Approval
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CampaignReviewStep;
