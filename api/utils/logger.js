/**
 * Logger utility that works both locally and in Azure Functions
 */

let azureContext = null;

// Set the Azure Functions context
function setContext(context) {
  azureContext = context;
}

// Log info message
function info(message, data) {
  if (azureContext) {
    // In Azure Functions environment
    if (data) {
      azureContext.log(message, typeof data === 'object' ? JSON.stringify(data) : data);
    } else {
      azureContext.log(message);
    }
  }
  
  // Also log to console for local development
  if (data) {
    console.log(message, data);
  } else {
    console.log(message);
  }
}

// Log error message
function error(message, err) {
  if (azureContext) {
    // In Azure Functions environment
    if (err) {
      azureContext.error ? azureContext.error(message, err) : azureContext.log(`ERROR: ${message}`, err);
    } else {
      azureContext.error ? azureContext.error(message) : azureContext.log(`ERROR: ${message}`);
    }
  }
  
  // Also log to console for local development
  if (err) {
    console.error(message, err);
  } else {
    console.error(message);
  }
}

module.exports = {
  setContext,
  info,
  error
};
