import React, { createContext, useContext, useState, useEffect } from 'react';
import { getTranslation, getProductName, getCategoryName, getTagTranslation, getDescriptionTranslation } from '../lib/translations';


const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('ar'); // Default to Arabic
  const [isRTL, setIsRTL] = useState(true); // Default to RTL for Arabic

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && (savedLanguage === 'ar' || savedLanguage === 'en')) {
      setLanguage(savedLanguage);
      setIsRTL(savedLanguage === 'ar');
      document.documentElement.dir = savedLanguage === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = savedLanguage;
    } else {
      // Set default to Arabic
      setLanguage('ar');
      setIsRTL(true);
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    }
  }, []);

  // Update document direction when language changes
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRTL]);

  // Save language to localStorage and update RTL
  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    setIsRTL(newLanguage === 'ar');
    localStorage.setItem('language', newLanguage);

    // Update document direction
    document.documentElement.dir = newLanguage === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLanguage;
  };

  // Translation functions
  const t = (key) => getTranslation(key, language);
  const translateProduct = (productName) => getProductName(productName, language);
  const translateCategory = (categoryName) => getCategoryName(categoryName, language);
  const translateTag = (tag) => getTagTranslation(tag, language);
  const translateDescription = (description, productName) => getDescriptionTranslation(description, language, productName);

  const value = {
    language,
    isRTL,
    changeLanguage,
    t,
    translateProduct,
    translateCategory,
    translateTag,
    translateDescription,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
