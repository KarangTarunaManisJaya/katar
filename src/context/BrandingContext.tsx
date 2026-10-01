import React, { createContext, useContext, useState, useEffect } from 'react';

interface BrandingContextType {
  logoUrl: string;
  kopLogoUrl: string;
  kopFileName: string;
  setLogoUrl: (url: string) => void;
  setKopLogoUrl: (url: string, fileName?: string) => void;
  resetLogo: () => void;
  resetKopLogo: () => void;
}

const BrandingContext = createContext<BrandingContextType>({
  logoUrl: '',
  kopLogoUrl: '',
  kopFileName: '',
  setLogoUrl: () => {},
  setKopLogoUrl: () => {},
  resetLogo: () => {},
  resetKopLogo: () => {},
});

export const BrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [logoUrl, setLogoUrlState] = useState<string>(() => localStorage.getItem('kt_custom_logo') || '');
  const [kopLogoUrl, setKopLogoUrlState] = useState<string>(() => localStorage.getItem('kt_kop_logo') || '');
  const [kopFileName, setKopFileNameState] = useState<string>(() => localStorage.getItem('kt_kop_filename') || '');

  const setLogoUrl = (url: string) => {
    setLogoUrlState(url);
    if (url) {
      localStorage.setItem('kt_custom_logo', url);
    } else {
      localStorage.removeItem('kt_custom_logo');
    }
  };

  const setKopLogoUrl = (url: string, fileName?: string) => {
    setKopLogoUrlState(url);
    if (url) {
      localStorage.setItem('kt_kop_logo', url);
    } else {
      localStorage.removeItem('kt_kop_logo');
    }
    if (fileName) {
      setKopFileNameState(fileName);
      localStorage.setItem('kt_kop_filename', fileName);
    }
  };

  const resetLogo = () => {
    setLogoUrlState('');
    localStorage.removeItem('kt_custom_logo');
  };

  const resetKopLogo = () => {
    setKopLogoUrlState('');
    setKopFileNameState('');
    localStorage.removeItem('kt_kop_logo');
    localStorage.removeItem('kt_kop_filename');
  };

  return (
    <BrandingContext.Provider
      value={{
        logoUrl,
        kopLogoUrl,
        kopFileName,
        setLogoUrl,
        setKopLogoUrl,
        resetLogo,
        resetKopLogo,
      }}
    >
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => useContext(BrandingContext);
