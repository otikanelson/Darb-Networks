import React from 'react';
import { useCountry } from '../../context/CountryContext';
import './WavingFlag.css';

const WavingFlag = ({ className = '' }) => {
  const { country } = useCountry();

  // Flag image URLs from reliable sources
  const flagImages = {
    NG: 'https://flagcdn.com/w640/ng.png',
    GH: 'https://flagcdn.com/w640/gh.png',
    KE: 'https://flagcdn.com/w640/ke.png',
    ZA: 'https://flagcdn.com/w640/za.png',
    EG: 'https://flagcdn.com/w640/eg.png',
    RW: 'https://flagcdn.com/w640/rw.png',
  };

  return (
    <div className={`waving-flag-container ${className}`}>
      <div className="waving-flag">
        <img 
          src={flagImages[country.code]} 
          alt={`${country.name} flag`}
          className="flag-image"
          key={country.code} // Force re-render on country change
        />
        
        {/* Wave overlay for depth effect */}
        <div className="flag-wave-overlay" />
      </div>
      
      {/* Flagpole */}
      <div className="flagpole" />
    </div>
  );
};

export default WavingFlag;
