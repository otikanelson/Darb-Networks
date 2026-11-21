const axios = require('axios');

/**
 * Verify reCAPTCHA token with Google
 * In production: required. In development: optional warning.
 */
const verifyCaptcha = async (req, res, next) => {
  try {
    const captchaToken = req.body.captchaToken;
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    // In development, allow skip if secret is not configured
    if (process.env.NODE_ENV !== 'production' && !secretKey) {
      console.warn('⚠️ reCAPTCHA not configured (RECAPTCHA_SECRET_KEY missing). Skipping verification in development.');
      return next();
    }

    // In production, secret is required
    if (!secretKey) {
      console.error('❌ reCAPTCHA secret key not configured in production');
      return res.status(503).json({
        success: false,
        message: 'Captcha verification service unavailable'
      });
    }

    // Token is required
    if (!captchaToken) {
      return res.status(400).json({
        success: false,
        message: 'reCAPTCHA token is required'
      });
    }

    // Verify with Google
    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: secretKey,
          response: captchaToken
        }
      }
    );

    // Check if verification was successful
    if (!response.data.success) {
      console.warn('⚠️ reCAPTCHA verification failed:', {
        score: response.data.score,
        action: response.data.action,
        errors: response.data['error-codes']
      });

      return res.status(400).json({
        success: false,
        message: 'reCAPTCHA verification failed. Please try again.'
      });
    }

    // Optionally check the score (for v3)
    // Scores below 0.5 indicate suspicious activity
    if (response.data.score && response.data.score < 0.5) {
      console.warn('⚠️ reCAPTCHA score too low (suspicious activity):', response.data.score);
      return res.status(400).json({
        success: false,
        message: 'reCAPTCHA verification failed. Please try again.'
      });
    }

    // Verification successful, attach to request for logging if needed
    req.captchaVerified = true;
    req.captchaScore = response.data.score;

    next();
  } catch (error) {
    console.error('❌ Error verifying reCAPTCHA:', error.message);

    // In production, fail if verification service is down
    if (process.env.NODE_ENV === 'production') {
      return res.status(503).json({
        success: false,
        message: 'Captcha verification service temporarily unavailable'
      });
    }

    // In development, allow request to proceed with warning
    console.warn('⚠️ reCAPTCHA verification error in development. Allowing request to proceed.');
    req.captchaVerified = false;
    next();
  }
};

module.exports = verifyCaptcha;
