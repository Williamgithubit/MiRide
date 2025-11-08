import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updatePlatformConfig } from '../../../../../store/Admin/adminSettingsSlice';
import { FaBuilding, FaImage, FaDollarSign, FaPercent, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
const PlatformConfiguration = ({ config }) => {
    const dispatch = useDispatch();
    const { isSaving } = useSelector((state) => state.adminSettings);
    const [formData, setFormData] = useState({
        companyName: config?.companyName || '',
        companyLogo: config?.companyLogo || '',
        defaultCurrency: config?.defaultCurrency || 'USD',
        taxPercentage: config?.taxPercentage || 0,
        serviceFeePercentage: config?.serviceFeePercentage || 0,
        supportEmail: config?.supportEmail || '',
        supportPhone: config?.supportPhone || '',
        companyAddress: config?.companyAddress || '',
    });
    const [isEditing, setIsEditing] = useState(false);
    const logoInputRef = useRef(null);
    const currencies = [
        { code: 'USD', name: 'US Dollar', symbol: '$' },
        { code: 'EUR', name: 'Euro', symbol: '€' },
        { code: 'GBP', name: 'British Pound', symbol: '£' },
        { code: 'LRD', name: 'Liberian Dollar', symbol: 'L$' },
        { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
        { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵' },
    ];
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name.includes('Percentage') ? parseFloat(value) || 0 : value,
        }));
    };
    const handleLogoChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setFormData(prev => ({
                    ...prev,
                    companyLogo: event.target?.result,
                }));
            };
            reader.readAsDataURL(file);
        }
    };
    const handleSave = async () => {
        try {
            await dispatch(updatePlatformConfig(formData)).unwrap();
            setIsEditing(false);
        }
        catch (error) {
            console.error('Failed to update platform configuration:', error);
        }
    };
    const handleCancel = () => {
        setFormData({
            companyName: config?.companyName || '',
            companyLogo: config?.companyLogo || '',
            defaultCurrency: config?.defaultCurrency || 'USD',
            taxPercentage: config?.taxPercentage || 0,
            serviceFeePercentage: config?.serviceFeePercentage || 0,
            supportEmail: config?.supportEmail || '',
            supportPhone: config?.supportPhone || '',
            companyAddress: config?.companyAddress || '',
        });
        setIsEditing(false);
    };
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: "Platform Configuration" }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400 mt-1", children: "Manage global system settings and company information" })] }), _jsx("button", { onClick: () => setIsEditing(!isEditing), className: "px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors", children: isEditing ? 'Cancel' : 'Edit Configuration' })] }), _jsxs("div", { className: "bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow", children: [_jsxs("h4", { className: "text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2", children: [_jsx(FaBuilding, { className: "text-blue-600" }), "Company Information"] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6", children: [_jsxs("div", { className: "flex flex-col items-center space-y-4 lg:col-span-1", children: [_jsxs("div", { className: "relative", children: [_jsx("div", { className: "w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-600 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-500", children: formData.companyLogo ? (_jsx("img", { src: formData.companyLogo, alt: "Company Logo", className: "w-full h-full object-contain" })) : (_jsx(FaImage, { className: "w-6 h-6 sm:w-8 sm:h-8 text-gray-400" })) }), isEditing && (_jsx("button", { onClick: () => logoInputRef.current?.click(), className: "absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 bg-blue-600 hover:bg-blue-700 text-white p-1.5 sm:p-2 rounded-full shadow-lg transition-colors", children: _jsx(FaImage, { className: "w-2.5 h-2.5 sm:w-3 sm:h-3" }) }))] }), _jsx("input", { ref: logoInputRef, type: "file", accept: "image/*", onChange: handleLogoChange, className: "hidden" }), _jsxs("p", { className: "text-xs text-gray-500 dark:text-gray-400 text-center", children: ["Company Logo", _jsx("br", {}), "(Recommended: 200x200px)"] })] }), _jsxs("div", { className: "lg:col-span-2 space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Company Name" }), _jsxs("div", { className: "relative", children: [_jsx(FaBuilding, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" }), _jsx("input", { type: "text", name: "companyName", value: formData.companyName, onChange: handleInputChange, disabled: !isEditing, placeholder: "Enter company name", className: "w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Company Address" }), _jsxs("div", { className: "relative", children: [_jsx(FaMapMarkerAlt, { className: "absolute left-3 top-3 text-gray-400 w-4 h-4" }), _jsx("textarea", { name: "companyAddress", value: formData.companyAddress, onChange: handleInputChange, disabled: !isEditing, placeholder: "Enter company address", rows: 3, className: "w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors resize-none" })] })] })] })] })] }), _jsxs("div", { className: "bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow", children: [_jsxs("h4", { className: "text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2", children: [_jsx(FaDollarSign, { className: "text-green-600" }), "Financial Settings"] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Default Currency" }), _jsxs("div", { className: "relative", children: [_jsx(FaDollarSign, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" }), _jsx("select", { name: "defaultCurrency", value: formData.defaultCurrency, onChange: handleInputChange, disabled: !isEditing, className: "w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors", children: currencies.map((currency) => (_jsxs("option", { value: currency.code, children: [currency.symbol, " ", currency.name, " (", currency.code, ")"] }, currency.code))) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Tax Percentage (%)" }), _jsxs("div", { className: "relative", children: [_jsx(FaPercent, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" }), _jsx("input", { type: "number", name: "taxPercentage", value: formData.taxPercentage, onChange: handleInputChange, disabled: !isEditing, min: "0", max: "100", step: "0.1", placeholder: "0.0", className: "w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Service Fee (%)" }), _jsxs("div", { className: "relative", children: [_jsx(FaPercent, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" }), _jsx("input", { type: "number", name: "serviceFeePercentage", value: formData.serviceFeePercentage, onChange: handleInputChange, disabled: !isEditing, min: "0", max: "100", step: "0.1", placeholder: "0.0", className: "w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors" })] })] })] })] }), _jsxs("div", { className: "bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow", children: [_jsxs("h4", { className: "text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2", children: [_jsx(FaEnvelope, { className: "text-purple-600" }), "Support Information"] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Support Email" }), _jsxs("div", { className: "relative", children: [_jsx(FaEnvelope, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" }), _jsx("input", { type: "email", name: "supportEmail", value: formData.supportEmail, onChange: handleInputChange, disabled: !isEditing, placeholder: "support@company.com", className: "w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Support Phone" }), _jsxs("div", { className: "relative", children: [_jsx(FaPhone, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" }), _jsx("input", { type: "tel", name: "supportPhone", value: formData.supportPhone, onChange: handleInputChange, disabled: !isEditing, placeholder: "+1 (555) 123-4567", className: "w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors" })] })] })] })] }), isEditing && (_jsxs("div", { className: "flex flex-col sm:flex-row gap-3 pt-4", children: [_jsx("button", { onClick: handleSave, disabled: isSaving, className: "w-full sm:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2", children: isSaving ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white" }), "Saving..."] })) : ('Save Configuration') }), _jsx("button", { onClick: handleCancel, className: "w-full sm:w-auto px-6 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors", children: "Cancel" })] }))] }));
};
export default PlatformConfiguration;
