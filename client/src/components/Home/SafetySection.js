import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Shield, Phone, Eye, UserCheck, AlertCircle, Star } from 'lucide-react';
const SafetySection = () => {
    const safetyFeatures = [
        {
            icon: Shield,
            title: 'Verified Drivers',
            description: 'All drivers undergo comprehensive background checks and regular vehicle inspections.',
            color: 'text-blue-600',
            bgColor: 'bg-blue-100'
        },
        {
            icon: Eye,
            title: 'Real-Time Tracking',
            description: 'Share your trip with friends and family. GPS tracking for every ride.',
            color: 'text-green-600',
            bgColor: 'bg-green-100'
        },
        {
            icon: Phone,
            title: '24/7 Support',
            description: 'Emergency assistance and customer support available around the clock.',
            color: 'text-purple-600',
            bgColor: 'bg-purple-100'
        },
        {
            icon: UserCheck,
            title: 'Identity Verification',
            description: 'Two-way verification system ensures both riders and drivers are verified.',
            color: 'text-orange-600',
            bgColor: 'bg-orange-100'
        },
        {
            icon: AlertCircle,
            title: 'Emergency Button',
            description: 'One-touch emergency button connects you directly to local authorities.',
            color: 'text-red-600',
            bgColor: 'bg-red-100'
        },
        {
            icon: Star,
            title: 'Rating System',
            description: 'Mutual rating system maintains high standards and accountability.',
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-100'
        }
    ];
    return (_jsx("section", { id: "safety", className: "py-20 bg-gradient-to-br from-blue-50 to-indigo-100", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "text-center mb-16", children: [_jsx("h2", { className: "text-4xl font-bold text-gray-900 mb-4", children: "Your Safety, Our Priority" }), _jsx("p", { className: "text-xl text-gray-600 max-w-3xl mx-auto", children: "We've built multiple layers of safety features to ensure every ride is secure and trustworthy." })] }), _jsx("div", { className: "grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16", children: safetyFeatures.map((feature, index) => (_jsxs("div", { className: "bg-white p-8 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2", children: [_jsx("div", { className: `inline-flex p-4 rounded-xl ${feature.bgColor} mb-6`, children: _jsx(feature.icon, { className: `h-8 w-8 ${feature.color}` }) }), _jsx("h3", { className: "text-xl font-bold text-gray-900 mb-3", children: feature.title }), _jsx("p", { className: "text-gray-600 leading-relaxed", children: feature.description })] }, index))) }), _jsxs("div", { className: "bg-white p-8 rounded-2xl shadow-lg", children: [_jsx("h3", { className: "text-2xl font-bold text-gray-900 text-center mb-8", children: "Safety by the Numbers" }), _jsxs("div", { className: "grid md:grid-cols-4 gap-8 text-center", children: [_jsxs("div", { children: [_jsx("div", { className: "text-3xl font-bold text-blue-600 mb-2", children: "99.9%" }), _jsx("div", { className: "text-gray-600", children: "Safe Trips" })] }), _jsxs("div", { children: [_jsx("div", { className: "text-3xl font-bold text-green-600 mb-2", children: "24/7" }), _jsx("div", { className: "text-gray-600", children: "Support Available" })] }), _jsxs("div", { children: [_jsx("div", { className: "text-3xl font-bold text-purple-600 mb-2", children: "100%" }), _jsx("div", { className: "text-gray-600", children: "Verified Drivers" })] }), _jsxs("div", { children: [_jsx("div", { className: "text-3xl font-bold text-orange-600 mb-2", children: "4.9/5" }), _jsx("div", { className: "text-gray-600", children: "Safety Rating" })] })] })] })] }) }));
};
export default SafetySection;
