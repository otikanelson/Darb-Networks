/**
 * HTML sanitization utility
 * Allows only safe rich-text editor output
 */

const sanitizeHtml = require('sanitize-html');

/**
 * Sanitize rich-text HTML content
 * Allows: p, h2, h3, strong, em, u, ul, ol, li, blockquote, a[href], img[src], br, text-align styles
 * Restrictions:
 * - Only https:// and mailto: links (no javascript:, data:, etc.)
 * - Only https:// image URLs (no data: URIs)
 * - No script tags or event handlers
 */
const sanitizeRichText = (html) => {
  if (!html || typeof html !== 'string') return '';

  return sanitizeHtml(html, {
    allowedTags: ['p', 'h2', 'h3', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'br'],
    allowedAttributes: {
      'a': ['href', 'title'],
      'img': ['src', 'alt', 'title'],
      'p': ['style'],
      'h2': ['style'],
      'h3': ['style'],
      'ul': ['style'],
      'ol': ['style'],
      'li': ['style'],
    },
    allowedStyles: {
      '*': {
        'text-align': [/^left$/, /^center$/, /^right$/, /^justify$/],
      }
    },
    allowedSchemesByTag: {
      a: ['http', 'https', 'mailto'],
      img: ['https']
    },
    transformTags: {
      'a': (tagName, attribs) => {
        // Reject javascript: and data: links
        const href = attribs.href || '';
        if (href.startsWith('javascript:') || href.startsWith('data:')) {
          return { tagName: 'span', text: attribs.text };
        }
        return { tagName, attribs };
      },
      'img': (tagName, attribs) => {
        // Reject data: URIs
        const src = attribs.src || '';
        if (src.startsWith('data:')) {
          return { tagName: 'span', text: '[Image removed]' };
        }
        return { tagName, attribs };
      }
    },
    disallowedTagsMode: 'discard',
    nonTextTags: ['style', 'script', 'textarea', 'option'],
    textFilter: (text) => text
  });
};

/**
 * Sanitize a campaign object (all rich-text fields)
 */
const sanitizeCampaignData = (data) => {
  const richTextFields = [
    'description',
    'problemStatement',
    'solution',
    'marketAnalysis',
    'competitiveAdvantage',
    'businessPlan',
    'financialProjections',
    'teamInformation',
    'risksAndChallenges'
  ];

  const sanitized = { ...data };

  richTextFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = sanitizeRichText(sanitized[field]);
    }
  });

  return sanitized;
};

module.exports = {
  sanitizeRichText,
  sanitizeCampaignData
};
