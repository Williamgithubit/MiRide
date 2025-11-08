import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import Header from "./Header";
const Contact = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    });
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        alert("Message sent! We'll respond shortly.");
        setFormData({ name: "", email: "", message: "" });
    };
    return (_jsxs(_Fragment, { children: [_jsx(Header, {}), _jsxs("section", { className: "py-16 px-4 md:px-10 lg:px-48 bg-white mt-12", children: [_jsx("h2", { className: "text-3xl font-bold text-gray-800 mb-6 text-center", children: "Contact Us" }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6 max-w-xl mx-auto", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "name", className: "block text-sm font-medium text-gray-700", children: "Name" }), _jsx("input", { type: "text", id: "name", name: "name", required: true, className: "w-full mt-1 border border-gray-300 rounded-md px-4 py-2", value: formData.name, onChange: handleChange })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-700", children: "Email" }), _jsx("input", { type: "email", id: "email", name: "email", required: true, className: "w-full mt-1 border border-gray-300 rounded-md px-4 py-2", value: formData.email, onChange: handleChange })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "message", className: "block text-sm font-medium text-gray-700", children: "Message" }), _jsx("textarea", { id: "message", name: "message", required: true, rows: 5, className: "w-full mt-1 border border-gray-300 rounded-md px-4 py-2", value: formData.message, onChange: handleChange })] }), _jsx("button", { type: "submit", className: "w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition", children: "Send Message" })] })] })] }));
};
export default Contact;
