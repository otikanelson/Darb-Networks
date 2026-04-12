import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useCountry } from '../../context/CountryContext';

const CountrySelector = ({ variant = 'default' }) => {
  const { country, countries, changeCountry } = useCountry();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCountryChange = (countryCode) => {
    changeCountry(countryCode);
    setIsOpen(false);
  };

  // Variant styles
  const variants = {
    default: {
      button: 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50',
      dropdown: 'bg-white border-gray-200',
      text: 'text-gray-700',
    },
    hero: {
      button: 'bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20',
      dropdown: 'bg-white/95 backdrop-blur-md border-white/20',
      text: 'text-gray-700',
    },
    navbar: {
      button: 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100',
      dropdown: 'bg-white border-gray-200',
      text: 'text-gray-700',
    },
  };

  const style = variants[variant] || variants.default;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${style.button}`}
      >
        <Globe className="h-4 w-4" />
        <span className="font-medium text-sm">{country.name}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute right-0 mt-2 w-64 rounded-xl border shadow-lg overflow-hidden z-50 ${style.dropdown}`}>
          <div className="p-2">
            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Select Country
            </div>
            <div className="space-y-1">
              {Object.values(countries).map((c) => (
                <button
                  key={c.code}
                  onClick={() => handleCountryChange(c.code)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                    c.code === country.code
                      ? 'bg-primary-50 text-primary-700'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{c.flag}</span>
                    <div className="text-left">
                      <div className="font-medium text-sm">{c.name}</div>
                      <div className="text-xs text-gray-500">{c.currencySymbol} {c.currency}</div>
                    </div>
                  </div>
                  {c.code === country.code && (
                    <Check className="h-4 w-4 text-primary-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
          
          <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
            <p className="text-xs text-gray-500 text-center">
              More countries coming soon
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CountrySelector;
