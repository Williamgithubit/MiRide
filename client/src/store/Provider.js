import { jsx as _jsx } from "react/jsx-runtime";
import { Provider } from 'react-redux';
// Import from centralized store export
import store from './index';
// Enhanced Redux Provider with proper store initialization
export const ReduxProvider = ({ children }) => {
    // Use the store directly from the centralized export
    return _jsx(Provider, { store: store, children: children });
};
export default ReduxProvider;
