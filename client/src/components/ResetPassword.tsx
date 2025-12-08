import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaSpinner, 
  FaCheckCircle, 
  FaExclamationCircle,
  FaTimesCircle,
  FaArrowLeft,
  FaCheck
} from "react-icons/fa";
import { toast } from "react-toastify";
import { useResetPasswordMutation, useVerifyResetTokenQuery } from "../store/Auth/authApi";
import MiRideLogo from "../assets/MiRide Logo.png";

// Password strength checker
const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
  let score = 0;
  
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  
  if (score <= 2) return { score, label: "Weak", color: "bg-red-500" };
  if (score <= 4) return { score, label: "Medium", color: "bg-yellow-500" };
  return { score, label: "Strong", color: "bg-green-500" };
};

// Password requirements
const passwordRequirements = [
  { id: "length", label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { id: "lowercase", label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { id: "uppercase", label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { id: "number", label: "One number", test: (p: string) => /[0-9]/.test(p) },
];

const ResetPassword: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // RTK Query hooks
  const { data: tokenData, isLoading: isVerifying, isError: isTokenInvalid } = useVerifyResetTokenQuery(
    token || "",
    { skip: !token }
  );
  
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();

  // Password strength
  const passwordStrength = getPasswordStrength(password);

  // Redirect to login after successful reset
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        navigate("/login", { 
          state: { message: "Password reset successfully! Please login with your new password." }
        });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate password
    if (!password) {
      setError("Password is required");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await resetPassword({ 
        token: token || "", 
        password, 
        confirmPassword 
      }).unwrap();
      
      setIsSuccess(true);
      toast.success("Password reset successfully!");
    } catch (err: any) {
      const errorMessage = err?.data?.message || "Failed to reset password. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Loading state while verifying token
  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg text-center">
          <div className="flex justify-center mb-6">
            <img src={MiRideLogo} alt="MiRide" className="h-16 w-auto" />
          </div>
          <FaSpinner className="animate-spin h-12 w-12 text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  // Invalid or expired token
  if (isTokenInvalid || (tokenData && !tokenData.valid)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg text-center">
          <div className="flex justify-center mb-6">
            <img src={MiRideLogo} alt="MiRide" className="h-16 w-auto" />
          </div>
          
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaTimesCircle className="w-8 h-8 text-red-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Invalid or Expired Link
          </h2>
          
          <p className="text-gray-600 mb-8">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          
          <div className="space-y-3">
            <Link
              to="/forgot-password"
              className="block w-full py-3 px-4 bg-green-800 text-white rounded-lg font-medium hover:bg-green-700 transition-colors text-center"
            >
              Request New Link
            </Link>
            
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 text-gray-600 hover:text-green-700 transition-colors"
            >
              <FaArrowLeft className="w-3 h-3" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
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
            Password Reset Successful!
          </h2>
          
          <p className="text-gray-600 mb-6">
            Your password has been reset successfully. You will be redirected to the login page shortly.
          </p>
          
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-green-800 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Continue to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg">
        <div className="flex justify-center mb-6">
          <img src={MiRideLogo} alt="MiRide" className="h-16 w-auto" />
        </div>
        
        <h2 className="text-3xl font-bold text-center text-primary-500 mb-2">
          Reset Password
        </h2>
        
        <p className="text-center text-gray-600 mb-6">
          Enter your new password below.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-start gap-3">
            <FaExclamationCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                disabled={isResetting}
                placeholder="Enter new password"
                className={`w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all duration-200 ${
                  isResetting ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isResetting}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                    />
                  </div>
                  <span className={`text-xs font-medium ${
                    passwordStrength.label === "Weak" ? "text-red-600" :
                    passwordStrength.label === "Medium" ? "text-yellow-600" : "text-green-600"
                  }`}>
                    {passwordStrength.label}
                  </span>
                </div>
                
                {/* Password Requirements */}
                <div className="grid grid-cols-2 gap-1 mt-2">
                  {passwordRequirements.map((req) => (
                    <div 
                      key={req.id}
                      className={`flex items-center gap-1 text-xs ${
                        req.test(password) ? "text-green-600" : "text-gray-400"
                      }`}
                    >
                      {req.test(password) ? (
                        <FaCheck className="w-3 h-3" />
                      ) : (
                        <div className="w-3 h-3 rounded-full border border-gray-300" />
                      )}
                      {req.label}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError("");
                }}
                disabled={isResetting}
                placeholder="Confirm new password"
                className={`w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all duration-200 ${
                  isResetting ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isResetting}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
              </button>
            </div>
            
            {/* Password Match Indicator */}
            {confirmPassword && (
              <div className={`flex items-center gap-1 mt-1 text-xs ${
                password === confirmPassword ? "text-green-600" : "text-red-600"
              }`}>
                {password === confirmPassword ? (
                  <>
                    <FaCheck className="w-3 h-3" />
                    Passwords match
                  </>
                ) : (
                  <>
                    <FaTimesCircle className="w-3 h-3" />
                    Passwords do not match
                  </>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isResetting || password.length < 8 || password !== confirmPassword}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 flex items-center justify-center gap-2 ${
              isResetting || password.length < 8 || password !== confirmPassword
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-800 hover:bg-green-700"
            }`}
          >
            {isResetting && <FaSpinner className="animate-spin h-5 w-5" />}
            {isResetting ? "Resetting..." : "Reset Password"}
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

export default ResetPassword;
