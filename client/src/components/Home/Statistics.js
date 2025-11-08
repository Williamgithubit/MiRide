import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Car, Users, MapPin, Award } from 'lucide-react';
const Statistics = () => {
    const stats = [
        {
            id: 1,
            icon: Car,
            number: '16,925',
            label: 'Total Cars',
            description: 'Premium vehicles in our fleet'
        },
        {
            id: 2,
            icon: Users,
            number: '8,945',
            label: 'Happy Customers',
            description: 'Satisfied clients worldwide'
        },
        {
            id: 3,
            icon: MapPin,
            number: '235',
            label: 'Locations',
            description: 'Cities and airports covered'
        },
        {
            id: 4,
            icon: Award,
            number: '15',
            label: 'Years Experience',
            description: 'In the car rental industry'
        }
    ];
    return (_jsx("section", { className: "py-20 bg-green-600 w-full", children: _jsxs("div", { className: "w-full px-4 sm:px-6 lg:px-8", children: [_jsx("div", { className: "absolute inset-0 opacity-10", children: _jsx("div", { className: "w-full h-full bg-gradient-to-br from-white/20 to-transparent" }) }), _jsxs("div", { className: "relative z-10", children: [_jsxs("div", { className: "text-center mb-12 sm:mb-16", children: [_jsx("h2", { className: "text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4", children: "Trusted by Thousands" }), _jsx("p", { className: "text-base sm:text-lg md:text-xl text-green-100 max-w-3xl mx-auto px-4", children: "Our numbers speak for themselves. Join the growing community of satisfied customers who choose MiRide." })] }), _jsx("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-8", children: stats.map((stat) => (_jsxs("div", { className: "text-center group", children: [_jsx("div", { className: "bg-white/20 backdrop-blur-sm w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white/30 transition-all duration-300", children: _jsx(stat.icon, { className: "h-8 w-8 text-white" }) }), _jsx("div", { className: "text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300", children: stat.number }), _jsx("h3", { className: "text-lg sm:text-xl font-semibold text-white mb-1", children: stat.label }), _jsx("p", { className: "text-sm text-green-100", children: stat.description })] }, stat.id))) }), _jsx("div", { className: "text-center mt-16", children: _jsxs("div", { className: "bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto", children: [_jsx("h3", { className: "text-2xl font-bold text-white mb-4", children: "Ready to Experience the Difference?" }), _jsx("p", { className: "text-green-100 mb-6", children: "Join thousands of satisfied customers and discover why MiRide is the preferred choice for car rentals." }), _jsx("button", { className: "bg-white text-green-600 px-8 py-3 rounded-xl hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold", children: "Start Your Journey" })] }) })] })] }) }));
};
export default Statistics;
