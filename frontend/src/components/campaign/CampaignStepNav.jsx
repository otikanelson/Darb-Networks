/**
 * Campaign Editor Step Navigator Sidebar
 * Allows clicking any step and shows step state (complete, has errors, not started)
 */

import React from 'react';
import { Check, AlertCircle, ChevronRight } from 'lucide-react';

const CampaignStepNav = ({ steps, currentStep, errors, form, onStepClick }) => {
  const stripHtml = (html) => html?.replace(/<[^>]*>/g, '').trim() || '';

  /**
   * Determine step state: 'complete', 'error', or 'incomplete'
   */
  const getStepState = (step) => {
    // Check if step has errors
    const stepErrors = step.fields.filter(field => errors[field]);
    if (stepErrors.length > 0) return 'error';

    // Check if all step fields are filled
    const allFilled = step.fields.every(field => {
      const value = form[field];
      if (!value) return false;
      
      // For rich text fields, strip HTML and check length
      if (field.includes('Statement') || field.includes('solution') || field === 'description') {
        return stripHtml(value).length > 0;
      }
      
      return true;
    });

    return allFilled ? 'complete' : 'incomplete';
  };

  return (
    <div className="sticky top-20 w-full max-w-xs space-y-2">
      {steps.map((step, index) => {
        const state = getStepState(step);
        const isActive = currentStep === index;

        return (
          <button
            key={step.id}
            onClick={() => onStepClick(step.id)}
            className={`w-full px-4 py-3 rounded-lg font-medium text-sm transition-all flex items-center justify-between group
              ${isActive 
                ? 'bg-primary-600 text-white shadow-lg' 
                : state === 'error'
                ? 'bg-red-50 text-red-700 hover:bg-red-100'
                : state === 'complete'
                ? 'bg-green-50 text-green-700 hover:bg-green-100'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            <div className="flex items-center gap-3 flex-1 text-left min-w-0">
              {/* Step number or icon */}
              {isActive ? (
                <div className="h-6 w-6 rounded-full bg-primary-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                  {index + 1}
                </div>
              ) : state === 'complete' ? (
                <Check className="h-5 w-5 flex-shrink-0" />
              ) : state === 'error' ? (
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
              ) : (
                <div className="h-6 w-6 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold flex-shrink-0 group-hover:bg-current group-hover:text-white transition">
                  {index + 1}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate">{step.label}</p>
                {state === 'error' && (
                  <p className="text-xs opacity-75 truncate">Has errors</p>
                )}
              </div>
            </div>

            {/* Chevron for active step */}
            {isActive && (
              <ChevronRight className="h-5 w-5 flex-shrink-0 ml-2" />
            )}
          </button>
        );
      })}

      {/* Progress bar */}
      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <div className="text-xs font-semibold text-gray-700 mb-2">Progress</div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-600 transition-all duration-300"
            style={{
              width: `${((currentStep + 1) / steps.length) * 100}%`
            }}
          />
        </div>
        <p className="text-xs text-gray-600 mt-2">
          {currentStep + 1} of {steps.length} steps
        </p>
      </div>
    </div>
  );
};

export default CampaignStepNav;
