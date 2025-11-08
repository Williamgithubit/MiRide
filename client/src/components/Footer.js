import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Car, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
const Footer = () => {
    const companyLinks = [
        { name: 'About Us', href: '#' },
        { name: 'Careers', href: '#' },
        { name: 'Press', href: '#' },
        { name: 'Blog', href: '#' },
    ];
    const supportLinks = [
        { name: 'Help Center', href: '#' },
        { name: 'Safety', href: '#' },
        { name: 'Contact Us', href: '#' },
        { name: 'Lost & Found', href: '#' },
    ];
    const legalLinks = [
        { name: 'Privacy Policy', href: '#' },
        { name: 'Terms of Service', href: '#' },
        { name: 'Cookie Policy', href: '#' },
        { name: 'Accessibility', href: '#' },
    ];
    const socialLinks = [
        { icon: Facebook, href: '#', color: 'hover:text-blue-600' },
        { icon: Twitter, href: '#', color: 'hover:text-blue-400' },
        { icon: Instagram, href: '#', color: 'hover:text-pink-600' },
        { icon: Linkedin, href: '#', color: 'hover:text-blue-700' },
    ];
    return (_jsx("footer", { className: "bg-gray-900 text-white", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "py-16", children: [_jsxs("div", { className: "grid md:grid-cols-2 lg:grid-cols-5 gap-8", children: [_jsxs("div", { className: "lg:col-span-2 space-y-6", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "bg-blue-600 p-2 rounded-lg", children: _jsx(Car, { className: "h-6 w-6 text-white" }) }), _jsx("span", { className: "text-xl font-bold", children: "MiRide" })] }), _jsx("p", { className: "text-gray-400 leading-relaxed max-w-md", children: "Experience the future of transportation with MiRide. Safe, reliable, and convenient rides at your fingertips." }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center space-x-2 text-gray-400", children: [_jsx(Mail, { className: "h-4 w-4" }), _jsx("span", { children: "support@miride.com" })] }), _jsxs("div", { className: "flex items-center space-x-2 text-gray-400", children: [_jsx(Phone, { className: "h-4 w-4" }), _jsx("span", { children: "1-800-MiRide" })] }), _jsxs("div", { className: "flex items-center space-x-2 text-gray-400", children: [_jsx(MapPin, { className: "h-4 w-4" }), _jsx("span", { children: "Paynesville City, Liberia" })] })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-lg font-semibold mb-4", children: "Company" }), _jsx("ul", { className: "space-y-2", children: companyLinks.map((link, index) => (_jsx("li", { children: _jsx("a", { href: link.href, className: "text-gray-400 hover:text-white transition-colors", children: link.name }) }, index))) })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-lg font-semibold mb-4", children: "Support" }), _jsx("ul", { className: "space-y-2", children: supportLinks.map((link, index) => (_jsx("li", { children: _jsx("a", { href: link.href, className: "text-gray-400 hover:text-white transition-colors", children: link.name }) }, index))) })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-lg font-semibold mb-4", children: "Legal" }), _jsx("ul", { className: "space-y-2", children: legalLinks.map((link, index) => (_jsx("li", { children: _jsx("a", { href: link.href, className: "text-gray-400 hover:text-white transition-colors", children: link.name }) }, index))) })] })] }), _jsxs("div", { className: "mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center", children: [_jsx("p", { className: "text-gray-400 text-sm", children: "\u00A9 2024 Miride. All rights reserved." }), _jsx("div", { className: "flex space-x-4 mt-4 md:mt-0", children: socialLinks.map((social, index) => (_jsx("a", { href: social.href, className: `text-gray-400 transition-colors ${social.color}`, children: _jsx(social.icon, { className: "h-5 w-5" }) }, index))) })] })] }) }) }));
};
export default Footer;
