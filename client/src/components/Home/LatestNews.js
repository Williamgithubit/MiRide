import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Calendar, ArrowRight, User } from 'lucide-react';
const LatestNews = () => {
    const newsArticles = [
        {
            id: 1,
            title: 'Best Places to Visit with a Rental Car',
            excerpt: 'Discover amazing destinations that are perfect for road trips and explore hidden gems with the freedom of your own rental car.',
            image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            author: 'Sarah Mitchell',
            date: '2024-01-15',
            category: 'Travel Tips',
            readTime: '5 min read'
        },
        {
            id: 2,
            title: 'The Future of Electric Car Rentals',
            excerpt: 'Learn about our commitment to sustainability and how electric vehicles are revolutionizing the car rental industry.',
            image: 'https://images.unsplash.com/photo-1593941707882-a5bac6861d75?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            author: 'David Chen',
            date: '2024-01-12',
            category: 'Innovation',
            readTime: '7 min read'
        },
        {
            id: 3,
            title: 'Complete Car Rental Guide for Beginners',
            excerpt: 'Everything you need to know about renting a car for the first time, from booking to returning your vehicle safely.',
            image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            author: 'Emily Johnson',
            date: '2024-01-10',
            category: 'Guide',
            readTime: '8 min read'
        }
    ];
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };
    return (_jsx("section", { className: "py-20 bg-gray-50 w-full", children: _jsxs("div", { className: "w-full px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "text-center mb-12 sm:mb-16", children: [_jsx("h2", { className: "text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4", children: "Latest News" }), _jsx("p", { className: "text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4", children: "Stay updated with the latest trends, tips, and insights from the world of car rentals and travel." })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8", children: newsArticles.map((article) => (_jsxs("article", { className: "bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group", children: [_jsxs("div", { className: "relative h-48 overflow-hidden", children: [_jsx("img", { src: article.image, alt: article.title, className: "w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" }), _jsx("div", { className: "absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold", children: article.category }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" })] }), _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex items-center text-sm text-gray-500 mb-3", children: [_jsxs("div", { className: "flex items-center mr-4", children: [_jsx(User, { className: "h-4 w-4 mr-1" }), _jsx("span", { children: article.author })] }), _jsxs("div", { className: "flex items-center mr-4", children: [_jsx(Calendar, { className: "h-4 w-4 mr-1" }), _jsx("span", { children: formatDate(article.date) })] }), _jsx("span", { className: "text-green-600", children: article.readTime })] }), _jsx("h3", { className: "text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors duration-200", children: article.title }), _jsx("p", { className: "text-gray-600 mb-4 leading-relaxed", children: article.excerpt }), _jsxs("button", { className: "flex items-center text-green-600 hover:text-green-700 font-semibold transition-colors duration-200 group/link", children: [_jsx("span", { children: "Read More" }), _jsx(ArrowRight, { className: "h-4 w-4 ml-2 transition-transform duration-200 group-hover/link:translate-x-1" })] })] })] }, article.id))) }), _jsx("div", { className: "text-center mt-12", children: _jsx("button", { className: "bg-green-600 text-white px-8 py-3 rounded-xl hover:bg-green-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold", children: "View All Articles" }) })] }) }));
};
export default LatestNews;
