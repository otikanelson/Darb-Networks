/**
 * Campaign validation
 * Backend validation - must match frontend/src/utils/campaignValidation.js rules exactly
 */

const { CAMPAIGN_CATEGORIES, CAMPAIGN_COUNTRIES, DOCUMENT_TYPES, VALIDATION_RULES } = require('../constants/campaign.constants');

// Helper to strip HTML tags and count plain text
const stripHtml = (html) => html?.replace(/<[^>]*>/g, '').trim() || '';

/**
 * Validate campaign data
 * Returns { isValid: boolean, errors: { fieldName: string } }
 */
const validateCampaign = (data, isDraft = true) => {
  const errors = {};

  // Basics (always required if provided)
  if (!data.title || !data.title.trim()) {
    errors.title = 'Title is required';
  } else if (data.title.length < VALIDATION_RULES.title.min) {
    errors.title = `Title must be at least ${VALIDATION_RULES.title.min} characters`;
  } else if (data.title.length > VALIDATION_RULES.title.max) {
    errors.title = `Title must not exceed ${VALIDATION_RULES.title.max} characters`;
  }

  if (!data.category) {
    errors.category = 'Category is required';
  } else if (!CAMPAIGN_CATEGORIES.includes(data.category)) {
    errors.category = 'Invalid category';
  }

  if (!data.location || !data.location.trim()) {
    errors.location = 'Location is required';
  } else if (data.location.length < VALIDATION_RULES.location.min) {
    errors.location = `Location must be at least ${VALIDATION_RULES.location.min} characters`;
  } else if (data.location.length > VALIDATION_RULES.location.max) {
    errors.location = `Location must not exceed ${VALIDATION_RULES.location.max} characters`;
  }

  if (!data.country) {
    errors.country = 'Country is required';
  } else if (!CAMPAIGN_COUNTRIES.includes(data.country)) {
    errors.country = 'Invalid country';
  }

  if (!data.description || !data.description.trim()) {
    errors.description = 'Description is required';
  } else {
    const plainText = stripHtml(data.description);
    if (plainText.length < VALIDATION_RULES.description.min) {
      errors.description = `Description must be at least ${VALIDATION_RULES.description.min} characters of plain text`;
    } else if (plainText.length > VALIDATION_RULES.description.max) {
      errors.description = `Description must not exceed ${VALIDATION_RULES.description.max} characters of plain text`;
    }
  }

  // Problem & Solution (required on submit, optional for drafts)
  if (!isDraft) {
    if (!data.problemStatement || !stripHtml(data.problemStatement).trim()) {
      errors.problemStatement = 'Problem statement is required';
    } else if (stripHtml(data.problemStatement).length > VALIDATION_RULES.problemStatement.max) {
      errors.problemStatement = `Problem statement must not exceed ${VALIDATION_RULES.problemStatement.max} characters of plain text`;
    }

    if (!data.solution || !stripHtml(data.solution).trim()) {
      errors.solution = 'Solution is required';
    } else if (stripHtml(data.solution).length > VALIDATION_RULES.solution.max) {
      errors.solution = `Solution must not exceed ${VALIDATION_RULES.solution.max} characters of plain text`;
    }
  } else {
    // For drafts, only validate format if provided
    if (data.problemStatement && stripHtml(data.problemStatement).length > VALIDATION_RULES.problemStatement.max) {
      errors.problemStatement = `Problem statement must not exceed ${VALIDATION_RULES.problemStatement.max} characters of plain text`;
    }
    if (data.solution && stripHtml(data.solution).length > VALIDATION_RULES.solution.max) {
      errors.solution = `Solution must not exceed ${VALIDATION_RULES.solution.max} characters of plain text`;
    }
  }

  // Optional rich text fields (validate format if provided)
  if (data.marketAnalysis && stripHtml(data.marketAnalysis).length > VALIDATION_RULES.marketAnalysis.max) {
    errors.marketAnalysis = `Market analysis must not exceed ${VALIDATION_RULES.marketAnalysis.max} characters of plain text`;
  }
  if (data.competitiveAdvantage && stripHtml(data.competitiveAdvantage).length > VALIDATION_RULES.competitiveAdvantage.max) {
    errors.competitiveAdvantage = `Competitive advantage must not exceed ${VALIDATION_RULES.competitiveAdvantage.max} characters of plain text`;
  }
  if (data.businessPlan && stripHtml(data.businessPlan).length > VALIDATION_RULES.businessPlan.max) {
    errors.businessPlan = `Business plan must not exceed ${VALIDATION_RULES.businessPlan.max} characters of plain text`;
  }
  if (data.financialProjections && stripHtml(data.financialProjections).length > VALIDATION_RULES.financialProjections.max) {
    errors.financialProjections = `Financial projections must not exceed ${VALIDATION_RULES.financialProjections.max} characters of plain text`;
  }
  if (data.teamInformation && stripHtml(data.teamInformation).length > VALIDATION_RULES.teamInformation.max) {
    errors.teamInformation = `Team information must not exceed ${VALIDATION_RULES.teamInformation.max} characters of plain text`;
  }
  if (data.risksAndChallenges && stripHtml(data.risksAndChallenges).length > VALIDATION_RULES.risksAndChallenges.max) {
    errors.risksAndChallenges = `Risks and challenges must not exceed ${VALIDATION_RULES.risksAndChallenges.max} characters of plain text`;
  }

  // Funding (required on submit, optional for drafts)
  if (!isDraft) {
    if (!data.targetAmount) {
      errors.targetAmount = 'Target amount is required';
    } else {
      const target = parseFloat(data.targetAmount);
      if (isNaN(target) || target < VALIDATION_RULES.targetAmount.min) {
        errors.targetAmount = `Minimum target amount is ₦${VALIDATION_RULES.targetAmount.min.toLocaleString('en-NG')}`;
      }
    }

    if (!data.minimumInvestment) {
      errors.minimumInvestment = 'Minimum investment is required';
    } else {
      const min = parseFloat(data.minimumInvestment);
      const target = parseFloat(data.targetAmount);
      if (isNaN(min) || min < VALIDATION_RULES.minimumInvestment.min) {
        errors.minimumInvestment = `Minimum investment must be at least ₦${VALIDATION_RULES.minimumInvestment.min.toLocaleString('en-NG')}`;
      } else if (!isNaN(target) && min > target) {
        errors.minimumInvestment = 'Minimum investment must not exceed target amount';
      }
    }

    if (!data.endDate) {
      errors.endDate = 'End date is required';
    } else {
      const endDate = new Date(data.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((endDate - today) / (1000 * 60 * 60 * 24));
      if (daysDiff < VALIDATION_RULES.endDate.minDaysFromNow || daysDiff > VALIDATION_RULES.endDate.maxDaysFromNow) {
        errors.endDate = `End date must be between ${VALIDATION_RULES.endDate.minDaysFromNow} and ${VALIDATION_RULES.endDate.maxDaysFromNow} days from today`;
      }
    }
  } else {
    // For drafts, only validate format if provided
    if (data.targetAmount) {
      const target = parseFloat(data.targetAmount);
      if (isNaN(target) || target < VALIDATION_RULES.targetAmount.min) {
        errors.targetAmount = `Minimum target amount is ₦${VALIDATION_RULES.targetAmount.min.toLocaleString('en-NG')}`;
      }
    }
    if (data.minimumInvestment) {
      const min = parseFloat(data.minimumInvestment);
      const target = parseFloat(data.targetAmount);
      if (isNaN(min) || min < VALIDATION_RULES.minimumInvestment.min) {
        errors.minimumInvestment = `Minimum investment must be at least ₦${VALIDATION_RULES.minimumInvestment.min.toLocaleString('en-NG')}`;
      } else if (!isNaN(target) && min > target) {
        errors.minimumInvestment = 'Minimum investment must not exceed target amount';
      }
    }
    if (data.endDate) {
      const endDate = new Date(data.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((endDate - today) / (1000 * 60 * 60 * 24));
      if (daysDiff < VALIDATION_RULES.endDate.minDaysFromNow || daysDiff > VALIDATION_RULES.endDate.maxDaysFromNow) {
        errors.endDate = `End date must be between ${VALIDATION_RULES.endDate.minDaysFromNow} and ${VALIDATION_RULES.endDate.maxDaysFromNow} days from today`;
      }
    }
  }

  // Maximum investment
  if (data.maximumInvestment) {
    const max = parseFloat(data.maximumInvestment);
    const min = parseFloat(data.minimumInvestment);
    const target = parseFloat(data.targetAmount);
    if (!isNaN(min) && max < min) {
      errors.maximumInvestment = 'Maximum investment must be greater than or equal to minimum investment';
    }
    if (!isNaN(target) && max > target) {
      errors.maximumInvestment = 'Maximum investment must not exceed target amount';
    }
  }

  // Video URLs
  if (data.videoUrl) {
    const urls = data.videoUrl.split(',').map(u => u.trim()).filter(Boolean);
    if (urls.length > VALIDATION_RULES.videoUrls.max) {
      errors.videoUrl = `Maximum ${VALIDATION_RULES.videoUrls.max} videos allowed`;
    }
    const validUrls = urls.every(url => {
      try {
        const urlObj = new URL(url);
        const host = urlObj.hostname.toLowerCase();
        return host.includes('youtube.com') || host.includes('youtu.be') || host.includes('vimeo.com') || urlObj.protocol === 'https:';
      } catch {
        return false;
      }
    });
    if (!validUrls) {
      errors.videoUrl = 'All video URLs must be from YouTube, Vimeo, or direct HTTPS links';
    }
  }

  // Cover image (required on submit for non-drafts)
  if (!isDraft && !data.mainImageUrl) {
    errors.mainImageUrl = 'Cover image is required';
  }

  // Milestones
  if (data.milestones && Array.isArray(data.milestones)) {
    const filtered = data.milestones.filter(m => m.title?.trim());

    if (filtered.length > VALIDATION_RULES.milestones.max) {
      errors.milestones = `Maximum ${VALIDATION_RULES.milestones.max} milestones allowed`;
    }

    // Validate each milestone
    for (let i = 0; i < filtered.length; i++) {
      const m = filtered[i];
      if (!m.title?.trim()) {
        errors.milestones = 'All milestones must have a title';
        break;
      }
      const titleLen = m.title.trim().length;
      if (titleLen < VALIDATION_RULES.milestoneTitleLength.min || titleLen > VALIDATION_RULES.milestoneTitleLength.max) {
        errors.milestones = `Milestone titles must be between ${VALIDATION_RULES.milestoneTitleLength.min} and ${VALIDATION_RULES.milestoneTitleLength.max} characters`;
        break;
      }
      if (parseFloat(m.amount || 0) <= 0) {
        errors.milestones = 'All milestones must have an amount greater than 0';
        break;
      }
    }

    // Check dates are in order
    if (!errors.milestones) {
      const withDates = filtered.filter(m => m.targetDate);
      for (let i = 0; i < withDates.length - 1; i++) {
        if (new Date(withDates[i].targetDate) >= new Date(withDates[i + 1].targetDate)) {
          errors.milestones = 'Milestone dates must be in ascending order';
          break;
        }
      }
    }

    // Check dates not after end date
    if (!errors.milestones && data.endDate) {
      const endDate = new Date(data.endDate);
      for (const m of filtered) {
        if (m.targetDate && new Date(m.targetDate) > endDate) {
          errors.milestones = 'Milestone dates must not be after campaign end date';
          break;
        }
      }
    }

    // Check sum doesn't exceed target
    if (!errors.milestones && data.targetAmount) {
      const sum = filtered.reduce((acc, m) => acc + (parseFloat(m.amount) || 0), 0);
      const target = parseFloat(data.targetAmount);
      if (sum > target) {
        errors.milestones = 'Sum of milestone amounts must not exceed target amount';
      }
    }
  }

  // Documents
  if (data.documents && Array.isArray(data.documents)) {
    const filtered = data.documents.filter(d => d.name?.trim() || d.url?.trim());

    if (filtered.length > VALIDATION_RULES.documents.max) {
      errors.documents = `Maximum ${VALIDATION_RULES.documents.max} documents allowed`;
    }

    // Validate each document
    for (let i = 0; i < filtered.length; i++) {
      const d = filtered[i];
      if (!d.name?.trim()) {
        errors.documents = 'All documents must have a name';
        break;
      }
      const nameLen = d.name.trim().length;
      if (nameLen < VALIDATION_RULES.documentNameLength.min || nameLen > VALIDATION_RULES.documentNameLength.max) {
        errors.documents = `Document names must be between ${VALIDATION_RULES.documentNameLength.min} and ${VALIDATION_RULES.documentNameLength.max} characters`;
        break;
      }
      if (!d.url?.trim() || !d.url.trim().startsWith('https://')) {
        errors.documents = 'All document URLs must be HTTPS';
        break;
      }
      if (!DOCUMENT_TYPES.includes(d.type)) {
        errors.documents = 'Invalid document type';
        break;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

module.exports = {
  validateCampaign
};
