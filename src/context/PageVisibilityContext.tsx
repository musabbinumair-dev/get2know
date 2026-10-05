import { createContext, useContext } from 'react';

export interface PageVisibilityContextValue {
  isPageVisible: boolean;
}

export const PageVisibilityContext = createContext<PageVisibilityContextValue>({
  isPageVisible: false,
});

export function usePageVisible(): boolean {
  return useContext(PageVisibilityContext).isPageVisible;
}
