import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Star, Quote } from 'lucide-react';
const Testimonials = () => {
    const testimonials = [
        {
            id: 1,
            name: 'Sarah Johnson',
            role: 'Business Executive',
            image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
            rating: 5,
            text: 'MiRide has completely transformed my travel experience. The cars are always clean, well-maintained, and the booking process is incredibly smooth. I\'ve been using their service for over a year now.',
            location: 'New York, NY'
        },
        {
            id: 2,
            name: 'Michael Chen',
            role: 'Travel Blogger',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
            rating: 5,
            text: 'As someone who travels frequently, I need reliable transportation. MiRide delivers every time with their premium fleet and exceptional customer service. Highly recommended!',
            location: 'Los Angeles, CA'
        },
        {
            id: 3,
            name: 'Emily Rodriguez',
            role: 'Marketing Director',
            image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
            rating: 5,
            text: 'The luxury vehicles and professional service make every trip special. Whether it\'s for business meetings or weekend getaways, MiRide never disappoints. Five stars!',
            location: 'Miami, FL'
        }
    ];
    return (_jsx("section", { className: "py-20 bg-white w-full", children: _jsxs("div", { className: "w-full px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "text-center mb-12 sm:mb-16", children: [_jsx("h2", { className: "text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4", children: "Only Quality For Clients" }), _jsx("p", { className: "text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4", children: "Don't just take our word for it. Here's what our satisfied customers have to say about their MiRide experience." })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8", children: testimonials.map((testimonial) => (_jsxs("div", { className: "bg-gray-50 rounded-2xl p-8 hover:bg-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 relative", children: [_jsx("div", { className: "absolute top-6 right-6 text-green-200", children: _jsx(Quote, { className: "h-8 w-8" }) }), _jsx("div", { className: "flex items-center mb-4", children: [...Array(testimonial.rating)].map((_, index) => (_jsx(Star, { className: "h-5 w-5 text-yellow-400 fill-current" }, index))) }), _jsxs("p", { className: "text-gray-700 mb-6 leading-relaxed", children: ["\"", testimonial.text, "\""] }), _jsxs("div", { className: "flex items-center", children: [_jsx("img", { src: testimonial.image, alt: testimonial.name, className: "w-12 h-12 rounded-full object-cover mr-4" }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-gray-900", children: testimonial.name }), _jsx("p", { className: "text-sm text-gray-600", children: testimonial.role }), _jsx("p", { className: "text-xs text-green-600", children: testimonial.location })] })] })] }, testimonial.id))) }), _jsxs("div", { className: "mt-16 grid grid-cols-1 md:grid-cols-3 gap-8", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4", children: _jsx("div", { className: "w-8 h-8 bg-green-600 rounded-full flex items-center justify-center", children: _jsx("span", { className: "text-white font-bold text-sm", children: "\u2713" }) }) }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "Easy Booking Process" }), _jsx("p", { className: "text-gray-600 text-sm", children: "Book your perfect car in just a few clicks with our streamlined process." })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4", children: _jsx("div", { className: "w-8 h-8 bg-green-600 rounded-full flex items-center justify-center", children: _jsx("span", { className: "text-white font-bold text-sm", children: "\u2605" }) }) }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "Premium Quality Cars" }), _jsx("p", { className: "text-gray-600 text-sm", children: "All vehicles are regularly maintained and cleaned to ensure the best experience." })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4", children: _jsx("div", { className: "w-8 h-8 bg-green-600 rounded-full flex items-center justify-center", children: _jsx("span", { className: "text-white font-bold text-sm", children: "24" }) }) }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "24/7 Customer Support" }), _jsx("p", { className: "text-gray-600 text-sm", children: "Our dedicated support team is available around the clock to assist you." })] })] })] }) }));
};
export default Testimonials;
