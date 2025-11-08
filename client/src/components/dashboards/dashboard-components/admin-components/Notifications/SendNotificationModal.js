import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch } from 'react-redux';
import { sendNotification } from '../../../../../store/Admin/adminNotificationsSlice';
import { FaTimes, FaPaperPlane } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
const SendNotificationModal = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        recipient: 'All',
        type: 'System',
        link: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.message.trim()) {
            toast.error('Title and message are required');
            return;
        }
        setIsSubmitting(true);
        try {
            await dispatch(sendNotification(formData)).unwrap();
            toast.success('Notification sent successfully!');
            setFormData({
                title: '',
                message: '',
                recipient: 'All',
                type: 'System',
                link: '',
            });
            onClose();
        }
        catch (error) {
            toast.error('Failed to send notification');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    if (!isOpen)
        return null;
    const modalContent = (_jsxs("div", { className: "fixed inset-0 z-50 overflow-y-auto", "aria-labelledby": "modal-title", role: "dialog", "aria-modal": "true", children: [_jsx("div", { className: "fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity z-40", "aria-hidden": "true", onClick: onClose }), _jsx("div", { className: "flex items-center justify-center min-h-screen px-3 sm:px-4 py-4 sm:py-6 relative z-50", children: _jsxs("div", { className: "relative bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all w-full max-w-2xl max-h-[90vh] overflow-y-auto", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10", children: [_jsx("h3", { className: "text-base sm:text-lg font-semibold text-gray-900 dark:text-white", children: "Send New Notification" }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 p-1", children: _jsx(FaTimes, { size: 18, className: "sm:w-5 sm:h-5" }) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "px-4 sm:px-6 py-4", children: [_jsxs("div", { className: "space-y-3 sm:space-y-4", children: [_jsxs("div", { children: [_jsxs("label", { htmlFor: "title", className: "block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: ["Title ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { type: "text", id: "title", name: "title", value: formData.title, onChange: handleChange, className: "w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white", placeholder: "Enter notification title", required: true })] }), _jsxs("div", { children: [_jsxs("label", { htmlFor: "message", className: "block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: ["Message ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("textarea", { id: "message", name: "message", value: formData.message, onChange: handleChange, rows: 4, className: "w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white", placeholder: "Enter notification message", required: true })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "recipient", className: "block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Recipient" }), _jsxs("select", { id: "recipient", name: "recipient", value: formData.recipient, onChange: handleChange, className: "w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white", children: [_jsx("option", { value: "All", children: "All Users" }), _jsx("option", { value: "Owner", children: "Owners Only" }), _jsx("option", { value: "Customer", children: "Customers Only" })] })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "type", className: "block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Type" }), _jsxs("select", { id: "type", name: "type", value: formData.type, onChange: handleChange, className: "w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white", children: [_jsx("option", { value: "System", children: "System" }), _jsx("option", { value: "Booking", children: "Booking" }), _jsx("option", { value: "Payment", children: "Payment" }), _jsx("option", { value: "Review", children: "Review" })] })] })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "link", className: "block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Link (Optional)" }), _jsx("input", { type: "url", id: "link", name: "link", value: formData.link, onChange: handleChange, className: "w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white", placeholder: "https://example.com" })] }), _jsx("div", { className: "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-2.5 sm:p-3", children: _jsxs("p", { className: "text-xs sm:text-sm text-blue-800 dark:text-blue-200", children: [_jsx("strong", { children: "Note:" }), " This notification will be sent to", ' ', formData.recipient === 'All'
                                                        ? 'all users (owners and customers)'
                                                        : formData.recipient === 'Owner'
                                                            ? 'all car owners'
                                                            : 'all customers', "."] }) })] }), _jsxs("div", { className: "flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800", children: [_jsx("button", { type: "button", onClick: onClose, className: "w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500", disabled: isSubmitting, children: "Cancel" }), _jsxs("button", { type: "submit", className: "w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2", disabled: isSubmitting, children: [_jsx(FaPaperPlane, { className: "text-xs" }), _jsx("span", { children: isSubmitting ? 'Sending...' : 'Send Notification' })] })] })] })] }) })] }));
    // Use portal to render modal at document body level
    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) {
        console.error('Modal root element not found');
        return null;
    }
    return createPortal(modalContent, modalRoot);
};
export default SendNotificationModal;
