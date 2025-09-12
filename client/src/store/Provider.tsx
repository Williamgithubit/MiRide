import React from 'react';
import { Provider } from 'react-redux';
// Import from centralized store export
import store from './index';

interface ReduxProviderProps {
  children: React.ReactNode;
}

// Enhanced Redux Provider with proper store initialization
export const ReduxProvider: React.FC<ReduxProviderProps> = ({ children }) => {
  // Use the store directly from the centralized export
  return <Provider store={store}>{children}</Provider>;
};

export default ReduxProvider;
