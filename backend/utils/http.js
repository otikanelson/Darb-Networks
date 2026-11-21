/**
 * Send an error response that hides internal details in production
 * @param {Response} res - Express response object
 * @param {number} status - HTTP status code
 * @param {string} publicMessage - Message to send to client
 * @param {Error} err - Internal error object (logged server-side)
 */
function sendError(res, status, publicMessage, err) {
  // Always log the full error server-side
  if (err) {
    console.error(`[${status}] ${publicMessage}:`, {
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  } else {
    console.error(`[${status}] ${publicMessage}`);
  }

  // Build response object
  const response = {
    success: false,
    message: publicMessage
  };

  // Only include error details in development
  if (process.env.NODE_ENV === 'development' && err) {
    response.error = {
      message: err.message,
      stack: err.stack
    };
  }

  return res.status(status).json(response);
}

module.exports = {
  sendError
};
