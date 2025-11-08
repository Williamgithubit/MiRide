import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaUser, FaCar, FaEnvelope, FaLock, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import useReduxAuth from '../store/hooks/useReduxAuth';
const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'customer',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const navigate = useNavigate();
    // Use Redux auth hook instead of context
    const { register, isLoading: loading, error: reduxError } = useReduxAuth();
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const handleRoleChange = (role) => {
        setFormData({ ...formData, role });
    };
    // Update error state when Redux error changes
    useEffect(() => {
        if (reduxError) {
            setError(reduxError);
        }
    }, [reduxError]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        // Enhanced validation for required fields
        const name = formData.name?.trim();
        const email = formData.email?.trim();
        const phone = formData.phone?.trim() || '';
        const role = formData.role || 'customer';
        const password = formData.password;
        // Validate name field
        if (!name) {
            setError('Name is required');
            toast.error('Name is required');
            return;
        }
        // Validate email field
        if (!email) {
            setError('Email is required');
            toast.error('Email is required');
            return;
        }
        // Validate password match
        if (password !== formData.confirmPassword) {
            setError('Passwords do not match');
            toast.error('Passwords do not match');
            return;
        }
        // Debug form data before submission
        console.log('Form data before submission:', {
            name,
            email,
            phone,
            role,
            passwordLength: password?.length || 0
        });
        try {
            // Create registration data with explicit values and proper types
            const registrationData = {
                name, // Explicitly use the validated name
                email,
                password,
                phone,
                role,
            };
            console.log('Registration data being sent:', JSON.stringify(registrationData));
            // Send registration data to the register function
            await register(registrationData);
            // Show success message and toast
            setSuccess('Account created successfully! Redirecting to login page...');
            toast.success('Account created successfully!');
            // Redirect to login page after a short delay
            setTimeout(() => {
                navigate('/login', {
                    state: {
                        message: 'Your account has been created successfully! Please log in with your credentials.',
                        email: formData.email
                    }
                });
            }, 2000);
        }
        catch (err) {
            // Show error toast
            toast.error(err instanceof Error ? err.message : 'Registration failed');
            // Error is already handled by the Redux hook and displayed via the error state
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-gray-50 mt-8 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "max-w-md w-full space-y-8", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "mx-auto h-12 w-12 bg-green-900 rounded-full flex items-center justify-center mb-4", children: _jsx(FaUser, { className: "h-6 w-6 text-white" }) }), _jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-2", children: "Create Your Account" }), _jsx("p", { className: "text-sm text-gray-600 mb-6", children: "Join With Us Today and Get Started" })] }), _jsxs("div", { className: "bg-white rounded-lg shadow-sm p-8", children: [error && (_jsx("div", { className: "bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-sm", children: error })), success && (_jsx("div", { className: "bg-green-100 text-green-700 px-4 py-2 rounded mb-4 text-sm", children: success })), _jsxs("div", { className: "mb-6", children: [_jsx("p", { className: "text-sm font-medium text-gray-700 mb-3 text-center", children: "What are you Register For" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx("button", { type: "button", onClick: () => handleRoleChange('customer'), disabled: loading, className: `p-4 rounded-lg border-2 transition-all duration-200 ${loading
                                                ? 'cursor-not-allowed opacity-50'
                                                : formData.role === 'customer'
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'}`, children: _jsxs("div", { className: "flex flex-col items-center space-y-2", children: [_jsx(FaUser, { className: "h-6 w-6 text-gray-600" }), _jsx("span", { className: "text-sm font-medium text-gray-900", children: "To rent" }), _jsx("span", { className: "text-xs text-gray-500", children: "Find cars to rent" })] }) }), _jsx("button", { type: "button", onClick: () => handleRoleChange('owner'), disabled: loading, className: `p-4 rounded-lg border-2 transition-all duration-200 ${loading
                                                ? 'cursor-not-allowed opacity-50'
                                                : formData.role === 'owner'
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'}`, children: _jsxs("div", { className: "flex flex-col items-center space-y-2", children: [_jsx(FaCar, { className: "h-6 w-6 text-gray-600" }), _jsx("span", { className: "text-sm font-medium text-gray-900", children: "To list my car" }), _jsx("span", { className: "text-xs text-gray-500", children: "Make money from your car" })] }) })] }), !formData.role && (_jsx("p", { className: "text-red-500 text-xs mt-2 text-center", children: "Please select what you want to do" }))] }), _jsxs("form", { className: "space-y-4", onSubmit: handleSubmit, children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Full Name" }), _jsxs("div", { className: "relative", children: [_jsx(FaUser, { className: `absolute left-3 top-3 h-4 w-4 transition-colors ${loading ? 'text-gray-300' : 'text-gray-400'}` }), _jsx("input", { name: "name", type: "text", placeholder: "John Doe", value: formData.name, onChange: handleChange, disabled: loading, required: true, className: `w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-800 focus:border-transparent transition-all duration-200 ${loading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}` })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Email address" }), _jsxs("div", { className: "relative", children: [_jsx(FaEnvelope, { className: `absolute left-3 top-3 h-4 w-4 transition-colors ${loading ? 'text-gray-300' : 'text-gray-400'}` }), _jsx("input", { name: "email", type: "email", placeholder: "you@example.com", value: formData.email, onChange: handleChange, disabled: loading, required: true, className: `w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-800 focus:border-transparent transition-all duration-200 ${loading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}` })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Password" }), _jsxs("div", { className: "relative", children: [_jsx(FaLock, { className: `absolute left-3 top-3 h-4 w-4 transition-colors ${loading ? 'text-gray-300' : 'text-gray-400'}` }), _jsx("input", { type: showPassword ? 'text' : 'password', name: "password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", required: true, value: formData.password, onChange: handleChange, disabled: loading, className: `w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-800 focus:border-transparent transition-all duration-200 ${loading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}` }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), disabled: loading, className: `absolute right-3 top-3 transition-colors ${loading ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-gray-600'}`, children: showPassword ? _jsx(FaEyeSlash, { className: "h-4 w-4" }) : _jsx(FaEye, { className: "h-4 w-4" }) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Confirm Password" }), _jsxs("div", { className: "relative", children: [_jsx(FaLock, { className: `absolute left-3 top-3 h-4 w-4 transition-colors ${loading ? 'text-gray-300' : 'text-gray-400'}` }), _jsx("input", { type: showConfirm ? 'text' : 'password', name: "confirmPassword", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", required: true, value: formData.confirmPassword, onChange: handleChange, disabled: loading, className: `w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-800 focus:border-transparent transition-all duration-200 ${loading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}` }), _jsx("button", { type: "button", onClick: () => setShowConfirm(!showConfirm), disabled: loading, className: `absolute right-3 top-3 transition-colors ${loading ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-gray-600'}`, children: showConfirm ? _jsx(FaEyeSlash, { className: "h-4 w-4" }) : _jsx(FaEye, { className: "h-4 w-4" }) })] })] }), _jsxs("button", { type: "submit", disabled: loading, className: `w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white transition-all duration-200 bg-green-900 hover:bg-green-700 ${loading
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'}`, children: [loading ? (_jsx(FaSpinner, { className: "animate-spin mr-2 h-4 w-4" })) : (_jsx("span", { className: "mr-2", children: "\u2192" })), loading ? 'Creating Account...' : 'Create Account'] })] })] })] }) }));
};
export default Signup;
