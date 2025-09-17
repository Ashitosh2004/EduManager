import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Institute } from '@/types';

interface InstituteContextType {
  selectedInstitute: Institute | null;
  setSelectedInstitute: (institute: Institute | null) => void;
  institutes: Institute[];
  setInstitutes: (institutes: Institute[]) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const InstituteContext = createContext<InstituteContextType | undefined>(undefined);

export const useInstitute = () => {
  const context = useContext(InstituteContext);
  if (context === undefined) {
    throw new Error('useInstitute must be used within an InstituteProvider');
  }
  return context;
};

interface InstituteProviderProps {
  children: ReactNode;
}

export const InstituteProvider: React.FC<InstituteProviderProps> = ({ children }) => {
  const [selectedInstitute, setSelectedInstitute] = useState<Institute | null>(null);
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [loading, setLoading] = useState(false);

  const value: InstituteContextType = {
    selectedInstitute,
    setSelectedInstitute,
    institutes,
    setInstitutes,
    loading,
    setLoading,
  };

  return (
    <InstituteContext.Provider value={value}>
      {children}
    </InstituteContext.Provider>
  );
};
