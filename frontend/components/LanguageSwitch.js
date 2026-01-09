import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { X } from 'lucide-react';

const LanguageSwitch = () => {
  const { language, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef(null);
  const buttonRef = useRef(null);

  // Handle click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleLanguageChange = (newLanguage) => {
    changeLanguage(newLanguage);
    setIsOpen(false);
  };

  return (
    <>
      {/* Language Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white border border-gray-200 hover:border-gold-500 hover:bg-gold-50 transition-all duration-200 shadow-sm hover:shadow-md"
        aria-label="Select Language"
      >
        <span className="text-sm font-medium text-gray-700">
          {language === 'ar' ? 'الع' : 'Eng'}
        </span>
      </button>

      {/* Language Selection Modal */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black bg-opacity-30 z-50" />
          
          {/* Modal */}
          <div
            ref={modalRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsOpen(false);
              }
            }}
          >
            <div className="bg-white rounded-lg shadow-xl w-full max-w-xs p-6 relative">
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Title */}
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Language</h2>

              {/* Language Options */}
              <div className="space-y-3">
                {/* English Option */}
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`w-full px-4 py-3 rounded-md border-2 text-left transition-all duration-200 ${
                    language === 'en'
                      ? 'border-gold-600 bg-gold-50 text-gray-900 font-medium'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  Eng
                </button>

                {/* Arabic Option */}
                <button
                  onClick={() => handleLanguageChange('ar')}
                  className={`w-full px-4 py-3 rounded-md border-2 text-left transition-all duration-200 ${
                    language === 'ar'
                      ? 'border-gold-600 bg-gold-50 text-gray-900 font-medium'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  الع
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default LanguageSwitch;
