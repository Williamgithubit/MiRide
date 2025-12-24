import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  FaEye,
  FaEyeSlash,
  FaSpinner,
  FaExclamationCircle,
  FaCheckCircle,
  FaTimesCircle,
  FaUserSlash,
  FaEnvelope,
  FaLock,
  FaWifi,
} from "react-icons/fa";
import { toast } from "react-toastify";
import useReduxAuth from "../store/hooks/useReduxAuth";
import { clearError } from "../store/Auth/authSlice";
import MiRideLogo from "../assets/MiRide Logo.png";

// Error icon mapping based on error type
const getErrorIcon = (errorMessage: string) => {
  const lowerMessage = errorMessage.toLowerCase();
  if (lowerMessage.includes("password")) {
    return <FaLock className="w-5 h-5" />;
  }
  if (
    lowerMessage.includes("email") ||
    lowerMessage.includes("account found")
  ) {
    return <FaEnvelope className="w-5 h-5" />;
  }
  if (
    lowerMessage.includes("disabled") ||
    lowerMessage.includes("deactivated")
  ) {
    return <FaUserSlash className="w-5 h-5" />;
  }
  if (
    lowerMessage.includes("connect") ||
    lowerMessage.includes("network") ||
    lowerMessage.includes("server error")
  ) {
    return <FaWifi className="w-5 h-5" />;
  }
  return <FaExclamationCircle className="w-5 h-5" />;
};

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Use Redux auth hook instead of context
  const { login, isLoading: loading, error: reduxError } = useReduxAuth();

  // Clear any persisted errors on component mount (page load/refresh)
  useEffect(() => {
    dispatch(clearError());
    setError("");
  }, [dispatch]);

  // Update error state when Redux error changes
  useEffect(() => {
    const state = location.state as {
      message?: string;
      email?: string;
      redirectTo?: string;
    } | null;
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

  // Update error state when Redux error changes - only for new errors after mount
  useEffect(() => {
    if (reduxError) {
      setError(reduxError);
    }
  }, [reduxError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      // Normalize email for Gmail addresses (remove dots from local part)
      let normalizedEmail = email.toLowerCase().trim();
      if (normalizedEmail.endsWith("@gmail.com")) {
        const [localPart, domain] = normalizedEmail.split("@");
        normalizedEmail = `${localPart.replace(/\./g, "")}@${domain}`;
      }

      // Use the login function from Redux auth hook
      // Trim inputs before sending to backend
      await login({ email: normalizedEmail, password: password.trim() });

      // Handle remember me functionality
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      // Show success toast using react-toastify
      toast.success("Login successful!");

      // Redirect to the intended URL or dashboard
      const redirectTo = (location.state as any)?.redirectTo || "/dashboard";
      navigate(redirectTo);
    } catch (err: any) {
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg">
        <div className="flex justify-center mb-6">
          <img src={MiRideLogo} alt="MiRide" className="h-16 w-auto" />
        </div>
        <h2 className="text-3xl font-bold text-center text-primary-500 mb-6">
          Sign In to Your Account
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-start gap-3 animate-shake">
            <div className="flex-shrink-0 mt-0.5 text-red-500">
              {getErrorIcon(error)}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{error}</p>
              {error.toLowerCase().includes("password") && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs text-red-600 hover:text-red-800 underline mt-1"
                >
                  Reset your password
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setError("")}
              className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors"
            >
              <FaTimesCircle className="w-4 h-4" />
            </button>
          </div>
        )}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-3">
            <FaCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <p className="text-sm font-medium flex-1">{successMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className={`w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-800 transition-all duration-200 ${
                loading ? "bg-gray-100 cursor-not-allowed" : "bg-white"
              }`}
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className={`w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-800 transition-all duration-200 ${
                loading ? "bg-gray-100 cursor-not-allowed" : "bg-white"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              className={`absolute right-3 top-9 text-gray-500 transition-colors ${
                loading
                  ? "cursor-not-allowed opacity-50"
                  : "hover:text-gray-700"
              }`}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe((prev) => !prev)}
              />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-primary-500 hover:underline cursor-pointer"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md font-medium text-white transition-all duration-200 cursor-pointer flex items-center justify-center ${
              loading
                ? "bg-green-600 cursor-not-allowed"
                : "bg-green-800 hover:bg-green-700"
            }`}
          >
            {loading && <FaSpinner className="animate-spin mr-2 h-4 w-4" />}
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-center text-sm mt-3">
            Don’t have an account?{" "}
            <button
              type="button"
              onClick={handleSignupRedirect}
              className="text-primary-500 hover:underline cursor-pointer"
            >
              Sign up
            </button>
            <br />
            or
            <br />
            <button
              type="button"
              onClick={handleHomeRedirect}
              className="text-primary-500 hover:underline ml-1 cursor-pointer"
            >
              Go to Home
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
