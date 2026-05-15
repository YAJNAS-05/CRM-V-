import { useEffect } from 'react';
import { useBlocker } from 'react-router-dom';

/**
 * Hook to warn user before navigating away from a form with unsaved changes.
 * Shows browser native alert on tab close/refresh, and React Router navigation blocker for route changes.
 * 
 * @param isDirty Boolean indicating if form has unsaved changes
 * @returns Blocker object for conditional modal display
 */
export const useUnsavedChangesWarning = (isDirty: boolean) => {
  // Browser native alert on tab close / refresh
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  // React Router navigation blocker for route changes
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname
  );

  return blocker;
};
