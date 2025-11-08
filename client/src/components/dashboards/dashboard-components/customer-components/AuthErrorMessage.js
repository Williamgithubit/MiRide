import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AlertTriangle, RefreshCw, LogIn } from 'lucide-react';
export const AuthErrorMessage = ({ hasValidUserId, isAuthenticated, customerError, onRetry, onLogin }) => {
    // Don't show anything if everything is valid
    if (hasValidUserId && isAuthenticated && !customerError) {
        return null;
    }
    const getErrorMessage = () => {
        if (!isAuthenticated) {
            return {
                title: "Authentication Required",
                message: "Please log in to access your dashboard.",
                action: "login",
                icon: LogIn
            };
        }
        if (!hasValidUserId) {
            return {
                title: "Invalid User Session",
                message: "Your user session appears to be corrupted. Please log out and log back in.",
                action: "retry",
                icon: AlertTriangle
            };
        }
        if (customerError) {
            return {
                title: "Failed to Load User Data",
                message: customerError?.data?.message || "Unable to fetch your profile information. Please try again.",
                action: "retry",
                icon: RefreshCw
            };
        }
        return {
            title: "Unknown Error",
            message: "An unexpected error occurred. Please try refreshing the page.",
            action: "retry",
            icon: AlertTriangle
        };
    };
    const error = getErrorMessage();
    const Icon = error.icon;
    return (_jsx("div", { className: "flex items-center justify-center min-h-[400px] p-8", children: _jsxs("div", { className: "text-center max-w-md", children: [_jsx("div", { className: "flex justify-center mb-4", children: _jsx("div", { className: "p-3 bg-red-100 dark:bg-red-900/20 rounded-full", children: _jsx(Icon, { className: "w-8 h-8 text-red-600 dark:text-red-400" }) }) }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white mb-2", children: error.title }), _jsx("p", { className: "text-gray-600 dark:text-gray-300 mb-6", children: error.message }), _jsxs("div", { className: "flex gap-3 justify-center", children: [error.action === "login" && onLogin && (_jsxs("button", { onClick: onLogin, className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2", children: [_jsx(LogIn, { className: "w-4 h-4" }), "Log In"] })), error.action === "retry" && onRetry && (_jsxs("button", { onClick: onRetry, className: "px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2", children: [_jsx(RefreshCw, { className: "w-4 h-4" }), "Try Again"] })), _jsx("button", { onClick: () => window.location.reload(), className: "px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors", children: "Refresh Page" })] })] }) }));
};
export default AuthErrorMessage;
