import React, { createContext, useContext, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { RouteConfig, getRouteConfig } from '../lib/preload';

interface LoaderContextValue {
  navigateWithLoader: (to: string) => void;
  getRouteConfig: (path: string) => RouteConfig;
}

const LoaderContext = createContext<LoaderContextValue | null>(null);

export const LoaderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();

  // Navigation: Navigate directly, let PageGate real preloading handle asset decoding
  const navigateWithLoader = useCallback(
    (to: string) => {
      navigate(to);
    },
    [navigate]
  );

  return (
    <LoaderContext.Provider value={{ navigateWithLoader, getRouteConfig }}>
      {children}
    </LoaderContext.Provider>
  );
};

export function useAppLoader(): LoaderContextValue {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error('useAppLoader must be used within a LoaderProvider');
  }
  return context;
}
