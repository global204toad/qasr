/**
 * Pricing Calculator Utility
 * 
 * Implements proportional pricing rules:
 * - 1kg = Base Price
 * - 500g = Base Price ÷ 2 (50%)
 * - 250g = Base Price ÷ 4 (25%)
 */

/**
 * Calculate proportional price based on weight in grams
 * @param {number} basePrice1kg - Base price for 1kg (1000g)
 * @param {number} grams - Weight in grams
 * @returns {number} Calculated price rounded to whole number
 */
function calculateProportionalPrice(basePrice1kg, grams) {
  if (!basePrice1kg || basePrice1kg <= 0) {
    throw new Error('Base price must be a positive number');
  }
  
  if (!grams || grams <= 0) {
    throw new Error('Grams must be a positive number');
  }

  // Calculate proportional price: (grams / 1000) * basePrice1kg
  const proportionalPrice = (grams / 1000) * basePrice1kg;
  
  // Round to whole number (no decimals for EGP)
  return Math.round(proportionalPrice);
}

/**
 * Generate standard weight options with proportional pricing
 * @param {number} basePrice1kg - Base price for 1kg
 * @returns {Array} Array of weight options with proportional prices
 */
function generateWeightOptions(basePrice1kg) {
  if (!basePrice1kg || basePrice1kg <= 0) {
    throw new Error('Base price must be a positive number');
  }

  return [
    {
      label: '250g',
      grams: 250,
      price: calculateProportionalPrice(basePrice1kg, 250)
    },
    {
      label: '500g',
      grams: 500,
      price: calculateProportionalPrice(basePrice1kg, 500)
    },
    {
      label: '1kg',
      grams: 1000,
      price: calculateProportionalPrice(basePrice1kg, 1000)
    }
  ];
}

/**
 * Validate that weight options follow proportional pricing rules
 * @param {Array} weightOptions - Array of weight options to validate
 * @param {number} tolerance - Allowed difference in price (default: 1 EGP for rounding)
 * @returns {Object} Validation result with isValid and errors array
 */
function validateWeightOptions(weightOptions, tolerance = 1) {
  const errors = [];
  
  if (!Array.isArray(weightOptions) || weightOptions.length === 0) {
    return {
      isValid: true,
      errors: [],
      message: 'No weight options to validate'
    };
  }

  // Find the 1kg option as base reference
  const baseOption = weightOptions.find(opt => opt.grams === 1000);
  
  if (!baseOption) {
    errors.push('No 1kg (1000g) base option found');
    return {
      isValid: false,
      errors,
      message: 'Missing base (1kg) weight option'
    };
  }

  const basePrice = baseOption.price;

  // Validate each option
  weightOptions.forEach((option, index) => {
    const expectedPrice = calculateProportionalPrice(basePrice, option.grams);
    const actualPrice = option.price;
    const difference = Math.abs(expectedPrice - actualPrice);

    if (difference > tolerance) {
      errors.push(
        `Weight option ${index} (${option.label}, ${option.grams}g): ` +
        `Expected price ${expectedPrice}, but got ${actualPrice} ` +
        `(difference: ${difference})`
      );
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    message: errors.length === 0 
      ? 'All weight options follow proportional pricing'
      : `Found ${errors.length} pricing inconsistencies`
  };
}

/**
 * Fix weight options to use proportional pricing based on 1kg base price
 * @param {Array} weightOptions - Current weight options
 * @returns {Array} Fixed weight options with proportional pricing
 */
function fixWeightOptions(weightOptions) {
  if (!Array.isArray(weightOptions) || weightOptions.length === 0) {
    return weightOptions;
  }

  // Find the 1kg option as base reference
  const baseOption = weightOptions.find(opt => opt.grams === 1000);
  
  if (!baseOption) {
    // If no 1kg option, find the largest weight option
    const sortedByWeight = [...weightOptions].sort((a, b) => b.grams - a.grams);
    const largestOption = sortedByWeight[0];
    
    // Calculate what the 1kg price would be
    const basePrice1kg = Math.round((largestOption.price / largestOption.grams) * 1000);
    
    return weightOptions.map(option => ({
      ...option,
      price: calculateProportionalPrice(basePrice1kg, option.grams)
    }));
  }

  const basePrice = baseOption.price;

  // Recalculate all prices based on base
  return weightOptions.map(option => ({
    ...option,
    price: calculateProportionalPrice(basePrice, option.grams)
  }));
}

module.exports = {
  calculateProportionalPrice,
  generateWeightOptions,
  validateWeightOptions,
  fixWeightOptions
};
