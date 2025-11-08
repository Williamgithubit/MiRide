import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft, RotateCcw } from 'lucide-react';
const BookingCancelled = () => {
    const navigate = useNavigate();
    const handleGoToDashboard = () => {
        navigate('/customer-dashboard');
    };
    const handleTryAgain = () => {
        navigate('/customer-dashboard');
    };
    return (_jsx("div", { className: "min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4", children: _jsxs("div", { className: "max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center", children: [_jsxs("div", { className: "mb-6", children: [_jsx("div", { className: "mx-auto w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4", children: _jsx(XCircle, { className: "w-8 h-8 text-red-600 dark:text-red-400" }) }), _jsx("h1", { className: "text-2xl font-bold text-gray-900 dark:text-white mb-2", children: "Payment Cancelled" }), _jsx("p", { className: "text-gray-600 dark:text-gray-400", children: "Your payment was cancelled and no charges were made to your card. You can try booking again whenever you're ready." })] }), _jsx("div", { className: "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6", children: _jsx("p", { className: "text-yellow-800 dark:text-yellow-200 text-sm", children: "Your booking details are still available. Simply return to the dashboard to complete your reservation." }) }), _jsxs("div", { className: "space-y-3", children: [_jsxs("button", { onClick: handleTryAgain, className: "w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors", children: [_jsx(RotateCcw, { className: "w-4 h-4 mr-2" }), "Try Booking Again"] }), _jsxs("button", { onClick: handleGoToDashboard, className: "w-full flex items-center justify-center px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors", children: [_jsx(ArrowLeft, { className: "w-4 h-4 mr-2" }), "Back to Dashboard"] })] })] }) }));
};
export default BookingCancelled;
