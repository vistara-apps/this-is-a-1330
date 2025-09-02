/**
 * Validation utility functions
 */

/**
 * Validate a SOL amount
 * @param {string|number} amount - Amount to validate
 * @returns {Object} Validation result
 */
export const validateSolAmount = (amount) => {
  // Convert to number
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Check if it's a valid number
  if (isNaN(numAmount)) {
    return {
      isValid: false,
      error: 'Please enter a valid number'
    };
  }
  
  // Check if it's positive
  if (numAmount <= 0) {
    return {
      isValid: false,
      error: 'Amount must be greater than 0'
    };
  }
  
  // Check if it has too many decimal places (SOL has 9 decimals)
  const decimalPlaces = (numAmount.toString().split('.')[1] || '').length;
  if (decimalPlaces > 9) {
    return {
      isValid: false,
      error: 'Amount cannot have more than 9 decimal places'
    };
  }
  
  // Check if it's too large (arbitrary limit for UI purposes)
  if (numAmount > 1000000) {
    return {
      isValid: false,
      error: 'Amount is too large'
    };
  }
  
  return {
    isValid: true,
    value: numAmount
  };
};

/**
 * Validate a market name
 * @param {string} name - Market name to validate
 * @returns {Object} Validation result
 */
export const validateMarketName = (name) => {
  if (!name || name.trim() === '') {
    return {
      isValid: false,
      error: 'Market name is required'
    };
  }
  
  if (name.length < 5) {
    return {
      isValid: false,
      error: 'Market name must be at least 5 characters'
    };
  }
  
  if (name.length > 100) {
    return {
      isValid: false,
      error: 'Market name cannot exceed 100 characters'
    };
  }
  
  return {
    isValid: true,
    value: name.trim()
  };
};

/**
 * Validate a market description
 * @param {string} description - Market description to validate
 * @returns {Object} Validation result
 */
export const validateMarketDescription = (description) => {
  if (!description || description.trim() === '') {
    return {
      isValid: false,
      error: 'Market description is required'
    };
  }
  
  if (description.length < 10) {
    return {
      isValid: false,
      error: 'Market description must be at least 10 characters'
    };
  }
  
  if (description.length > 500) {
    return {
      isValid: false,
      error: 'Market description cannot exceed 500 characters'
    };
  }
  
  return {
    isValid: true,
    value: description.trim()
  };
};

/**
 * Validate market outcomes
 * @param {Array<string>} outcomes - Market outcomes to validate
 * @returns {Object} Validation result
 */
export const validateMarketOutcomes = (outcomes) => {
  if (!outcomes || !Array.isArray(outcomes)) {
    return {
      isValid: false,
      error: 'Outcomes must be an array'
    };
  }
  
  if (outcomes.length < 2) {
    return {
      isValid: false,
      error: 'At least 2 outcomes are required'
    };
  }
  
  if (outcomes.length > 10) {
    return {
      isValid: false,
      error: 'Maximum 10 outcomes are allowed'
    };
  }
  
  // Check for empty outcomes
  const emptyOutcomes = outcomes.filter(outcome => !outcome || outcome.trim() === '');
  if (emptyOutcomes.length > 0) {
    return {
      isValid: false,
      error: 'All outcomes must have a name'
    };
  }
  
  // Check for duplicate outcomes
  const uniqueOutcomes = new Set(outcomes.map(outcome => outcome.trim().toLowerCase()));
  if (uniqueOutcomes.size !== outcomes.length) {
    return {
      isValid: false,
      error: 'All outcomes must be unique'
    };
  }
  
  return {
    isValid: true,
    value: outcomes.map(outcome => outcome.trim())
  };
};

/**
 * Validate market odds
 * @param {Array<number>} odds - Market odds to validate
 * @param {number} outcomeCount - Number of outcomes
 * @returns {Object} Validation result
 */
export const validateMarketOdds = (odds, outcomeCount) => {
  if (!odds || !Array.isArray(odds)) {
    return {
      isValid: false,
      error: 'Odds must be an array'
    };
  }
  
  if (odds.length !== outcomeCount) {
    return {
      isValid: false,
      error: `Odds must be provided for all ${outcomeCount} outcomes`
    };
  }
  
  // Check for valid odds
  for (let i = 0; i < odds.length; i++) {
    const odd = odds[i];
    
    // Convert to number
    const numOdd = typeof odd === 'string' ? parseFloat(odd) : odd;
    
    // Check if it's a valid number
    if (isNaN(numOdd)) {
      return {
        isValid: false,
        error: `Odds for outcome ${i + 1} must be a valid number`
      };
    }
    
    // Check if it's at least 1.0
    if (numOdd < 1.0) {
      return {
        isValid: false,
        error: `Odds for outcome ${i + 1} must be at least 1.0`
      };
    }
    
    // Check if it's too large
    if (numOdd > 100.0) {
      return {
        isValid: false,
        error: `Odds for outcome ${i + 1} cannot exceed 100.0`
      };
    }
  }
  
  return {
    isValid: true,
    value: odds.map(odd => typeof odd === 'string' ? parseFloat(odd) : odd)
  };
};

/**
 * Validate a date
 * @param {string|Date} date - Date to validate
 * @param {string|Date} [minDate] - Minimum allowed date
 * @param {string|Date} [maxDate] - Maximum allowed date
 * @returns {Object} Validation result
 */
export const validateDate = (date, minDate, maxDate) => {
  // Convert to Date object
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // Check if it's a valid date
  if (isNaN(dateObj.getTime())) {
    return {
      isValid: false,
      error: 'Please enter a valid date'
    };
  }
  
  // Check minimum date
  if (minDate) {
    const minDateObj = minDate instanceof Date ? minDate : new Date(minDate);
    if (dateObj < minDateObj) {
      return {
        isValid: false,
        error: `Date must be after ${minDateObj.toLocaleDateString()}`
      };
    }
  }
  
  // Check maximum date
  if (maxDate) {
    const maxDateObj = maxDate instanceof Date ? maxDate : new Date(maxDate);
    if (dateObj > maxDateObj) {
      return {
        isValid: false,
        error: `Date must be before ${maxDateObj.toLocaleDateString()}`
      };
    }
  }
  
  return {
    isValid: true,
    value: dateObj
  };
};

/**
 * Validate a fee percentage
 * @param {string|number} percentage - Fee percentage to validate
 * @returns {Object} Validation result
 */
export const validateFeePercentage = (percentage) => {
  // Convert to number
  const numPercentage = typeof percentage === 'string' ? parseFloat(percentage) : percentage;
  
  // Check if it's a valid number
  if (isNaN(numPercentage)) {
    return {
      isValid: false,
      error: 'Please enter a valid number'
    };
  }
  
  // Check if it's non-negative
  if (numPercentage < 0) {
    return {
      isValid: false,
      error: 'Fee percentage cannot be negative'
    };
  }
  
  // Check if it's too high (max 10%)
  if (numPercentage > 10) {
    return {
      isValid: false,
      error: 'Fee percentage cannot exceed 10%'
    };
  }
  
  return {
    isValid: true,
    value: numPercentage
  };
};

/**
 * Validate a public key
 * @param {string} publicKey - Public key to validate
 * @returns {Object} Validation result
 */
export const validatePublicKey = (publicKey) => {
  if (!publicKey || publicKey.trim() === '') {
    return {
      isValid: false,
      error: 'Public key is required'
    };
  }
  
  // Check if it's a valid Solana public key
  try {
    // This will throw an error if the public key is invalid
    new PublicKey(publicKey);
    
    return {
      isValid: true,
      value: publicKey.trim()
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid public key format'
    };
  }
};

export default {
  validateSolAmount,
  validateMarketName,
  validateMarketDescription,
  validateMarketOutcomes,
  validateMarketOdds,
  validateDate,
  validateFeePercentage,
  validatePublicKey
};

