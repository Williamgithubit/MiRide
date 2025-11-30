import { useState, useEffect } from 'react';

interface UseSplashScreenOptions {
  minDisplayTime?: number;
  checkReadyState?: boolean;
}

export const useSplashScreen = (options: UseSplashScreenOptions = {}) => {
  const { minDisplayTime = 2000, checkReadyState = true } = options;
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isReadyStateComplete = false;

    // Check if document is ready
    const checkDocumentReady = () => {
      if (document.readyState === 'complete') {
        isReadyStateComplete = true;
        return true;
      }
      return false;
    };

    // Initial check
    if (checkReadyState) {
      checkDocumentReady();
    } else {
      isReadyStateComplete = true;
    }

    // Listen for load event
    const handleLoad = () => {
      isReadyStateComplete = true;
      checkIfReady();
    };

    if (checkReadyState) {
      window.addEventListener('load', handleLoad);
    }

    // Minimum display time
    timeoutId = setTimeout(() => {
      setIsReady(true);
      checkIfReady();
    }, minDisplayTime);

    const checkIfReady = () => {
      if (isReadyStateComplete && isReady) {
        setIsLoading(false);
      }
    };

    return () => {
      clearTimeout(timeoutId);
      if (checkReadyState) {
        window.removeEventListener('load', handleLoad);
      }
    };
  }, [minDisplayTime, checkReadyState, isReady]);

  return { isLoading, setIsLoading };
};
