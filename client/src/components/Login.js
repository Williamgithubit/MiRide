import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";
import useReduxAuth from "../store/hooks/useReduxAuth";
const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const navigate = useNavigate();
    const location = useLocation();
    // Use Redux auth hook instead of context
    const { login, isLoading: loading, error: reduxError } = useReduxAuth();
    // Update error state when Redux error changes
    useEffect(() => {
        const state = location.state;
        if (state?.message) {
            setSuccessMessage(state.message);
            if (state.email) {
                setEmail(state.email);
            }
            // Clear the state to prevent showing the message again on refresh
            window.history.replaceState({}, document.title);
        }
        // Check for remembered email
        const rememberedEmail = localStorage.getItem("rememberedEmail");
        if (rememberedEmail) {
            setEmail(rememberedEmail);
            setRememberMe(true);
        }
    }, [location]);
    // Update error state when Redux error changes
    useEffect(() => {
        if (reduxError) {
            setError(reduxError);
        }
    }, [reduxError]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            // Use the login function from Redux auth hook
            // Trim inputs before sending to backend
            await login({ email: email.trim(), password: password.trim() });
            // Handle remember me functionality
            if (rememberMe) {
                localStorage.setItem("rememberedEmail", email);
            }
            else {
                localStorage.removeItem("rememberedEmail");
            }
            // Show success toast using react-toastify
            toast.success("Login successful!");
            // Redirect to the intended URL or dashboard
            const redirectTo = location.state?.redirectTo || "/dashboard";
            navigate(redirectTo);
        }
        catch (err) {
            // Show error toast using react-toastify
            toast.error(err.message || "Failed to login");
            // Error is already handled by the Redux hook and displayed via the error state
        }
    };
    const handleSignupRedirect = () => {
        navigate("/signup");
    };
    const handleHomeRedirect = () => {
        navigate("/");
    };
    const handleForgotPassword = () => {
        // Navigate to forgot-password page (endpoint exists on server as reset-password-request)
        navigate("/forgot-password");
    };
    useEffect(() => {
        const savedEmail = localStorage.getItem("rememberedEmail");
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberMe(true);
        }
    }, []);
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-100 px-4", children: _jsxs("div", { className: "max-w-md w-full bg-white p-8 rounded-2xl shadow-lg", children: [_jsx("h2", { className: "text-3xl font-bold text-center text-primary-500 mb-6", children: "Sign In to Your Account" }), error && (_jsx("div", { className: "bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-sm", children: error })), successMessage && (_jsx("div", { className: "bg-green-100 text-green-700 px-4 py-2 rounded mb-4 text-sm", children: successMessage })), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Email Address" }), _jsx("input", { type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value), disabled: loading, className: `w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-800 transition-all duration-200 ${loading ? "bg-gray-100 cursor-not-allowed" : "bg-white"}` })] }), _jsxs("div", { className: "relative", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Password" }), _jsx("input", { type: showPassword ? "text" : "password", required: true, value: password, onChange: (e) => setPassword(e.target.value), disabled: loading, className: `w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-800 transition-all duration-200 ${loading ? "bg-gray-100 cursor-not-allowed" : "bg-white"}` }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), disabled: loading, className: `absolute right-3 top-9 text-gray-500 transition-colors ${loading
                                        ? "cursor-not-allowed opacity-50"
                                        : "hover:text-gray-700"}`, children: showPassword ? _jsx(FaEyeSlash, {}) : _jsx(FaEye, {}) })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("label", { className: "flex items-center space-x-2 text-sm text-gray-600", children: [_jsx("input", { type: "checkbox", checked: rememberMe, onChange: () => setRememberMe((prev) => !prev) }), _jsx("span", { children: "Remember me" })] }), _jsx("button", { type: "button", onClick: handleForgotPassword, className: "text-sm text-primary-500 hover:underline cursor-pointer", children: "Forgot password?" })] }), _jsxs("button", { type: "submit", disabled: loading, className: `w-full py-2 px-4 rounded-md font-medium text-white transition-all duration-200 cursor-pointer flex items-center justify-center ${loading
                                ? "bg-green-600 cursor-not-allowed"
                                : "bg-green-800 hover:bg-green-700"}`, children: [loading && _jsx(FaSpinner, { className: "animate-spin mr-2 h-4 w-4" }), loading ? "Logging in..." : "Login"] }), _jsxs("p", { className: "text-center text-sm mt-3", children: ["Don\u2019t have an account?", " ", _jsx("button", { type: "button", onClick: handleSignupRedirect, className: "text-primary-500 hover:underline cursor-pointer", children: "Sign up" }), _jsx("br", {}), "or", _jsx("br", {}), _jsx("button", { type: "button", onClick: handleHomeRedirect, className: "text-primary-500 hover:underline ml-1 cursor-pointer", children: "Go to Home" })] })] })] }) }));
};
export default Login;
