/**
 * Campaign validation schema (yup)
 * Frontend validation - must match backend/validators/campaign.validator.js rules exactly
 */

import * as yup from 'yup';
import { CAMPAIGN_CATEGORIES, CAMPAIGN_COUNTRIES, DOCUMENT_TYPES, VALIDATION_RULES } from './campaignConstants';

// Helper to strip HTML tags and count plain text
const stripHtml = (html) => html?.replace(/<[^>]*>/g, '').trim() || '';

// Reusable validators
const richTextValidator = (fieldName, maxChars, required = false) => {
  let validator = yup.string().test(
    `${fieldName}-plain-text-length`,
    `${fieldName} must not exceed ${maxChars} characters of plain text`,
    (value) => {
      if (!value) return !required;
      const plainText = stripHtml(value);
      return plainText.length <= maxChars;
    }
  );

  if (required) {
    validator = validator.test(
      `${fieldName}-required`,
      `${fieldName} is required`,
      (value) => {
        if (!value) return false;
        const plainText = stripHtml(value);
        return plainText.trim().length > 0;
      }
    );
  }

  return validator;
};

/**
 * Campaign validation schema
 * Pass in `isDraft` to determine which fields are required
 */
export const getCampaignValidationSchema = (isDraft = true) => {
  const schema = yup.object().shape({
    // Basics (always required if provided)
    title: yup
      .string()
      .required('Title is required')
      .min(VALIDATION_RULES.title.min, `Title must be at least ${VALIDATION_RULES.title.min} characters`)
      .max(VALIDATION_RULES.title.max, `Title must not exceed ${VALIDATION_RULES.title.max} characters`),

    category: yup
      .string()
      .required('Category is required')
      .oneOf(CAMPAIGN_CATEGORIES, 'Invalid category'),

    location: yup
      .string()
      .required('Location is required')
      .min(VALIDATION_RULES.location.min, `Location must be at least ${VALIDATION_RULES.location.min} characters`)
      .max(VALIDATION_RULES.location.max, `Location must not exceed ${VALIDATION_RULES.location.max} characters`),

    country: yup
      .string()
      .required('Country is required')
      .oneOf(CAMPAIGN_COUNTRIES, 'Invalid country'),

    description: yup
      .string()
      .required('Description is required')
      .test(
        'description-length',
        `Description must be at least ${VALIDATION_RULES.description.min} characters of plain text`,
        (value) => {
          if (!value) return false;
          const plainText = stripHtml(value);
          return plainText.length >= VALIDATION_RULES.description.min;
        }
      )
      .test(
        'description-max',
        `Description must not exceed ${VALIDATION_RULES.description.max} characters of plain text`,
        (value) => {
          if (!value) return true;
          const plainText = stripHtml(value);
          return plainText.length <= VALIDATION_RULES.description.max;
        }
      ),

    // Problem & Solution (required on submit, optional for drafts)
    problemStatement: isDraft
      ? richTextValidator('Problem statement', VALIDATION_RULES.problemStatement.max)
      : richTextValidator('Problem statement', VALIDATION_RULES.problemStatement.max, true),

    solution: isDraft
      ? richTextValidator('Solution', VALIDATION_RULES.solution.max)
      : richTextValidator('Solution', VALIDATION_RULES.solution.max, true),

    // Optional rich text fields (must pass format rules if provided)
    marketAnalysis: richTextValidator('Market analysis', VALIDATION_RULES.marketAnalysis.max),
    competitiveAdvantage: richTextValidator('Competitive advantage', VALIDATION_RULES.competitiveAdvantage.max),
    businessPlan: richTextValidator('Business plan', VALIDATION_RULES.businessPlan.max),
    financialProjections: richTextValidator('Financial projections', VALIDATION_RULES.financialProjections.max),
    teamInformation: richTextValidator('Team information', VALIDATION_RULES.teamInformation.max),
    risksAndChallenges: richTextValidator('Risks and challenges', VALIDATION_RULES.risksAndChallenges.max),

    // Funding (required on submit, optional for drafts)
    targetAmount: isDraft
      ? yup.number().typeError('Target amount must be a number').nullable()
      : yup
          .number()
          .required('Target amount is required')
          .typeError('Target amount must be a number')
          .min(VALIDATION_RULES.targetAmount.min, `Minimum target amount is ₦${VALIDATION_RULES.targetAmount.min.toLocaleString()}`),

    minimumInvestment: isDraft
      ? yup.number().typeError('Minimum investment must be a number').nullable()
      : yup
          .number()
          .required('Minimum investment is required')
          .typeError('Minimum investment must be a number')
          .min(VALIDATION_RULES.minimumInvestment.min, `Minimum investment must be at least ₦${VALIDATION_RULES.minimumInvestment.min.toLocaleString()}`)
          .test(
            'min-not-exceed-target',
            'Minimum investment must not exceed target amount',
            function (value) {
              const { targetAmount } = this.parent;
              if (!value || !targetAmount) return true;
              return value <= targetAmount;
            }
          ),

    maximumInvestment: yup
      .number()
      .nullable()
      .typeError('Maximum investment must be a number')
      .test(
        'max-gte-min',
        'Maximum investment must be greater than or equal to minimum investment',
        function (value) {
          if (!value) return true;
          const { minimumInvestment } = this.parent;
          if (!minimumInvestment) return true;
          return value >= minimumInvestment;
        }
      )
      .test(
        'max-not-exceed-target',
        'Maximum investment must not exceed target amount',
        function (value) {
          if (!value) return true;
          const { targetAmount } = this.parent;
          if (!targetAmount) return true;
          return value <= targetAmount;
        }
      ),

    endDate: isDraft
      ? yup.string().nullable()
      : yup
          .string()
          .required('End date is required')
          .test(
            'end-date-valid',
            'End date must be between 7 and 180 days from today',
            (value) => {
              if (!value) return false;
              const endDate = new Date(value);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const daysDiff = Math.floor((endDate - today) / (1000 * 60 * 60 * 24));
              return daysDiff >= VALIDATION_RULES.endDate.minDaysFromNow && daysDiff <= VALIDATION_RULES.endDate.maxDaysFromNow;
            }
          ),

    // Media
    videoUrl: yup
      .string()
      .nullable()
      .test(
        'video-urls-max',
        `Maximum ${VALIDATION_RULES.videoUrls.max} videos allowed`,
        function (value) {
          const urls = value ? value.split(',').map(u => u.trim()).filter(Boolean) : [];
          return urls.length <= VALIDATION_RULES.videoUrls.max;
        }
      )
      .test(
        'video-urls-valid',
        'All video URLs must be from YouTube, Vimeo, or direct HTTPS links',
        function (value) {
          if (!value) return true;
          const urls = value.split(',').map(u => u.trim()).filter(Boolean);
          return urls.every(url => {
            try {
              const urlObj = new URL(url);
              const host = urlObj.hostname.toLowerCase();
              return host.includes('youtube.com') || host.includes('youtu.be') || host.includes('vimeo.com') || urlObj.protocol === 'https:';
            } catch {
              return false;
            }
          });
        }
      ),

    mainImageUrl: isDraft
      ? yup.mixed().nullable()
      : yup
          .mixed()
          .required('Cover image is required'),

    galleryImages: yup
      .array()
      .nullable()
      .test(
        'gallery-max-8',
        `Maximum ${VALIDATION_RULES.documents.max} images allowed`,
        (value) => {
          if (!value) return true;
          return value.length <= 8;
        }
      ),

    // Milestones
    milestones: yup
      .array()
      .nullable()
      .test(
        'milestones-max',
        `Maximum ${VALIDATION_RULES.milestones.max} milestones allowed`,
        (value) => {
          if (!value) return true;
          const filtered = value.filter(m => m.title?.trim());
          return filtered.length <= VALIDATION_RULES.milestones.max;
        }
      )
      .test(
        'milestones-valid',
        'All milestones must have a title and amount > 0',
        (value) => {
          if (!value) return true;
          const filtered = value.filter(m => m.title?.trim());
          return filtered.every(m => m.title?.trim().length > 0 && parseFloat(m.amount || 0) > 0);
        }
      )
      .test(
        'milestones-title-length',
        `Milestone titles must be between ${VALIDATION_RULES.milestoneTitleLength.min} and ${VALIDATION_RULES.milestoneTitleLength.max} characters`,
        (value) => {
          if (!value) return true;
          const filtered = value.filter(m => m.title?.trim());
          return filtered.every(m => {
            const len = m.title.trim().length;
            return len >= VALIDATION_RULES.milestoneTitleLength.min && len <= VALIDATION_RULES.milestoneTitleLength.max;
          });
        }
      )
      .test(
        'milestones-dates-ordered',
        'Milestone dates must be in ascending order',
        function (value) {
          if (!value) return true;
          const filtered = value.filter(m => m.title?.trim() && m.targetDate);
          if (filtered.length < 2) return true;
          for (let i = 0; i < filtered.length - 1; i++) {
            if (new Date(filtered[i].targetDate) >= new Date(filtered[i + 1].targetDate)) {
              return false;
            }
          }
          return true;
        }
      )
      .test(
        'milestones-dates-not-after-end',
        'Milestone dates must not be after campaign end date',
        function (value) {
          if (!value || !this.parent.endDate) return true;
          const endDate = new Date(this.parent.endDate);
          const filtered = value.filter(m => m.title?.trim() && m.targetDate);
          return filtered.every(m => new Date(m.targetDate) <= endDate);
        }
      )
      .test(
        'milestones-sum-not-exceed-target',
        'Sum of milestone amounts must not exceed target amount',
        function (value) {
          if (!value || !this.parent.targetAmount) return true;
          const filtered = value.filter(m => m.title?.trim());
          const sum = filtered.reduce((acc, m) => acc + (parseFloat(m.amount) || 0), 0);
          return sum <= parseFloat(this.parent.targetAmount);
        }
      ),

    // Documents
    documents: yup
      .array()
      .nullable()
      .test(
        'documents-max',
        `Maximum ${VALIDATION_RULES.documents.max} documents allowed`,
        (value) => {
          if (!value) return true;
          const filtered = value.filter(d => d.name?.trim() && d.url?.trim());
          return filtered.length <= VALIDATION_RULES.documents.max;
        }
      )
      .test(
        'documents-valid',
        'All documents must have a name, HTTPS URL, and type',
        (value) => {
          if (!value) return true;
          const filtered = value.filter(d => d.name?.trim() || d.url?.trim());
          return filtered.every(d => {
            const hasName = d.name?.trim().length > 0;
            const hasValidUrl = d.url?.trim().startsWith('https://');
            const hasType = DOCUMENT_TYPES.includes(d.type);
            // If any field is filled, all must be valid
            if (d.name?.trim() || d.url?.trim()) {
              return hasName && hasValidUrl && hasType;
            }
            return true;
          });
        }
      )
      .test(
        'documents-name-length',
        `Document names must be between ${VALIDATION_RULES.documentNameLength.min} and ${VALIDATION_RULES.documentNameLength.max} characters`,
        (value) => {
          if (!value) return true;
          const filtered = value.filter(d => d.name?.trim());
          return filtered.every(d => {
            const len = d.name.trim().length;
            return len >= VALIDATION_RULES.documentNameLength.min && len <= VALIDATION_RULES.documentNameLength.max;
          });
        }
      )
      .test(
        'documents-urls-https',
        'All document URLs must be HTTPS',
        (value) => {
          if (!value) return true;
          const filtered = value.filter(d => d.url?.trim());
          return filtered.every(d => d.url.trim().startsWith('https://'));
        }
      ),
  });

  return schema;
};

/**
 * Validate a single field for real-time feedback
 */
export const validateField = async (fieldName, value, isDraft = true) => {
  const schema = getCampaignValidationSchema(isDraft);
  try {
    await schema.validateAt(fieldName, { [fieldName]: value });
    return null; // No error
  } catch (error) {
    return error.message;
  }
};

/**
 * Validate entire campaign
 */
export const validateCampaign = async (formData, isDraft = true) => {
  const schema = getCampaignValidationSchema(isDraft);
  try {
    await schema.validate(formData, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (error) {
    const errors = {};
    if (error.inner) {
      error.inner.forEach(err => {
        errors[err.path] = err.message;
      });
    }
    return { isValid: false, errors };
  }
};
