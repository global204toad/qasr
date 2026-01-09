// Product description mappings (English description -> translation key)
export const productDescriptionMappings = {
    'Premium-grade Iranian pistachios — perfectly roasted, rich in flavor, and known for their natural sweetness and crunch.': 'iranianPistachiosDesc',
    'Premium-grade Iranian pistachios - perfectly roasted, rich in flavor, and known for their natural sweetness and crunch': 'iranianPistachiosDesc',
    'Premium-grade Iranian pistachios — perfectly roasted, rich in flavor, and known for their natural sweetness and crunch': 'iranianPistachiosDesc',
    // Add more mappings as needed for other products
};

// Function to get description translation
export const getDescriptionTranslation = (description, language = 'ar') => {
    if (!description) return '';

    // Check if there's a mapping for this description
    const key = productDescriptionMappings[description] || productDescriptionMappings[description.trim()];

    if (key) {
        // Return the translated description
        return translations[language]?.[key] || description;
    }

    // If no mapping found, return original description
    return description;
};
