import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEnvelope, FaSpinner, FaCheckCircle, FaExclamationCircle, FaArrowLeft } from "react-icons/fa";
import { toast } from "react-toastify";
import { useForgotPasswordMutation } from "../store/Auth/authApi";
import MiRideLogo from "../assets/MiRide Logo.png";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate email
    if (!email.trim()) {
      setError("Email address is required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      await forgotPassword({ email: email.trim() }).unwrap();
      setIsSubmitted(true);
      toast.success("Password reset link sent! Check your email.");
    } catch (err: any) {
      const errorMessage = err?.data?.message || "Failed to send reset link. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Success state - show confirmation message
  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg text-center">
          <div className="flex justify-center mb-6">
            <img src={MiRideLogo} alt="MiRide" className="h-16 w-auto" />
          </div>
          
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaCheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Check Your Email
          </h2>
          
          <p className="text-gray-600 mb-6">
            We've sent a password reset link to{" "}
            <span className="font-semibold text-gray-800">{email}</span>
          </p>
          
          <p className="text-sm text-gray-500 mb-8">
            Didn't receive the email? Check your spam folder or{" "}
            <button
              onClick={() => {
                setIsSubmitted(false);
                setEmail("");
              }}
              className="text-green-600 hover:text-green-700 font-medium underline"
            >
              try again
            </button>
          </p>
          
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-green-800 text-white rounded-md font-medium hover:bg-green-700 transition-colors"
          >
            <FaArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg">
        <div className="flex justify-center mb-6">
          <img src={MiRideLogo} alt="MiRide" className="h-16 w-auto" />
        </div>
        
        <h2 className="text-3xl font-bold text-center text-primary-500 mb-2">
          Forgot Password?
        </h2>
        
        <p className="text-center text-gray-600 mb-6">
          No worries! Enter your email and we'll send you a reset link.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-start gap-3">
            <FaExclamationCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                disabled={isLoading}
                placeholder="Enter your email address"
                className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all duration-200 ${
                  isLoading ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                }`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 flex items-center justify-center gap-2 ${
              isLoading
                ? "bg-green-600 cursor-not-allowed"
                : "bg-green-800 hover:bg-green-700"
            }`}
          >
            {isLoading && <FaSpinner className="animate-spin h-5 w-5" />}
            {isLoading ? "Sending..." : "Send Reset Link"}
          </button>

          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-green-700 transition-colors"
            >
              <FaArrowLeft className="w-3 h-3" />
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
