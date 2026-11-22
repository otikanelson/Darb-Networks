/**
 * Shared campaign constants (also mirrored in frontend/src/utils/campaignConstants.js)
 */

const CAMPAIGN_CATEGORIES = [
  'Audio', 'Tools', 'Education', 'Energy & Green Tech', 'Fashion & Wearables',
  'Food & Beverages', 'Health & Fitness', 'Home', 'Phones & Accessories',
  'Business & Finance', 'Transportation', 'Travel & Outdoors', 'Art', 'Comics',
  'Dance & Theater', 'Film', 'Music', 'Photography', 'Podcasts, Blogs & Vlogs',
  'Tabletop Games', 'Video Games', 'TV series & Shows', 'Writing & Publishing',
  'Culture', 'Environment', 'Human Rights', 'Local Businesses', 'Wellness',
];

const CAMPAIGN_COUNTRIES = [
  'Nigeria', 'Kenya', 'Ghana', 'South Africa', 'Egypt', 'Rwanda', 'Tanzania',
  'Uganda', 'Senegal', 'Ivory Coast', 'Morocco', 'Ethiopia', 'Tunisia', 'Algeria',
  'Cameroon', 'Zambia', 'Zimbabwe', 'Mauritius', 'Botswana', 'Namibia'
];

const DOCUMENT_TYPES = [
  'registration',
  'financial',
  'pitch_deck',
  'business_plan',
  'legal',
  'other'
];

// Validation rules - must match frontend
const VALIDATION_RULES = {
  title: { min: 10, max: 100 },
  description: { min: 50, max: 600 },
  location: { min: 2, max: 100 },
  problemStatement: { max: 20000 },
  solution: { max: 20000 },
  marketAnalysis: { max: 20000 },
  competitiveAdvantage: { max: 20000 },
  businessPlan: { max: 20000 },
  financialProjections: { max: 20000 },
  teamInformation: { max: 20000 },
  risksAndChallenges: { max: 20000 },
  targetAmount: { min: 100000 },
  minimumInvestment: { min: 1000 },
  endDate: { minDaysFromNow: 7, maxDaysFromNow: 180 },
  milestones: { max: 8 },
  milestoneTitleLength: { min: 3, max: 100 },
  videoUrls: { max: 5 },
  documents: { max: 10 },
  documentNameLength: { min: 3, max: 100 }
};

module.exports = {
  CAMPAIGN_CATEGORIES,
  CAMPAIGN_COUNTRIES,
  DOCUMENT_TYPES,
  VALIDATION_RULES
};
