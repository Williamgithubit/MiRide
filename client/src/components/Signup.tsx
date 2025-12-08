import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaUser, FaCar, FaEnvelope, FaLock, FaSpinner, FaCheck, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import useReduxAuth from '../store/hooks/useReduxAuth';
import MiRideLogo from '../assets/MiRide Logo.png';

// Password strength checker
const getPasswordStrength = (password: string): { score: number; label: string; color: string; bgColor: string } => {
  let score = 0;
  
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  
  if (score <= 2) return { score, label: "Weak", color: "text-red-600", bgColor: "bg-red-500" };
  if (score <= 4) return { score, label: "Medium", color: "text-yellow-600", bgColor: "bg-yellow-500" };
  return { score, label: "Strong", color: "text-green-600", bgColor: "bg-green-500" };
};

// Password requirements
const passwordRequirements = [
  { id: "length", label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { id: "lowercase", label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { id: "uppercase", label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { id: "number", label: "One number", test: (p: string) => /[0-9]/.test(p) },
];

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'customer' as 'customer' | 'owner',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();
  
  // Use Redux auth hook instead of context
  const { register, isLoading: loading, error: reduxError } = useReduxAuth();

  // Calculate password strength
  const passwordStrength = useMemo(() => getPasswordStrength(formData.password), [formData.password]);
  
  // Check if passwords match
  const passwordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (role: 'customer' | 'owner') => {
    setFormData({ ...formData, role });
  };

  // Update error state when Redux error changes
  useEffect(() => {
    if (reduxError) {
      setError(reduxError);
    }
  }, [reduxError]);

  const handleSubmit = async (e: React.FormEvent) => {
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
      
    } catch (err: any) {
      // Show error toast
      toast.error(err instanceof Error ? err.message : 'Registration failed');
      // Error is already handled by the Redux hook and displayed via the error state
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 mt-8 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* MiRide Logo */}
          <div className="flex justify-center mb-4">
            <img src={MiRideLogo} alt="MiRide" className="h-16 w-auto" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Create Your Account
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Join With Us Today and Get Started
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 text-green-700 px-4 py-2 rounded mb-4 text-sm">
              {success}
            </div>
          )}

          {/* Role Selection */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3 text-center">
              What are you Register For
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleRoleChange('customer')}
                disabled={loading}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  loading 
                    ? 'cursor-not-allowed opacity-50' 
                    : formData.role === 'customer'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <FaUser className="h-6 w-6 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">To rent</span>
                  <span className="text-xs text-gray-500">Find cars to rent</span>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => handleRoleChange('owner')}
                disabled={loading}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  loading 
                    ? 'cursor-not-allowed opacity-50' 
                    : formData.role === 'owner'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <FaCar className="h-6 w-6 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">To list my car</span>
                  <span className="text-xs text-gray-500">Make money from your car</span>
                </div>
              </button>
            </div>
            
            {!formData.role && (
              <p className="text-red-500 text-xs mt-2 text-center">
                Please select what you want to do
              </p>
            )}
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <FaUser className={`absolute left-3 top-3 h-4 w-4 transition-colors ${loading ? 'text-gray-300' : 'text-gray-400'}`} />
                <input
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-800 focus:border-transparent transition-all duration-200 ${
                    loading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                  }`}
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <div className="relative">
                <FaEnvelope className={`absolute left-3 top-3 h-4 w-4 transition-colors ${loading ? 'text-gray-300' : 'text-gray-400'}`} />
                <input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-800 focus:border-transparent transition-all duration-200 ${
                    loading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                  }`}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <FaLock className={`absolute left-3 top-3 h-4 w-4 transition-colors ${loading ? 'text-gray-300' : 'text-gray-400'}`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-800 focus:border-transparent transition-all duration-200 ${
                    loading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className={`absolute right-3 top-3 transition-colors ${
                    loading ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {showPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${passwordStrength.bgColor}`}
                        style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${passwordStrength.color}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  
                  {/* Password Requirements */}
                  <div className="grid grid-cols-2 gap-1">
                    {passwordRequirements.map((req) => (
                      <div 
                        key={req.id}
                        className={`flex items-center gap-1 text-xs ${
                          req.test(formData.password) ? "text-green-600" : "text-gray-400"
                        }`}
                      >
                        {req.test(formData.password) ? (
                          <FaCheck className="w-3 h-3 flex-shrink-0" />
                        ) : (
                          <div className="w-3 h-3 rounded-full border border-gray-300 flex-shrink-0" />
                        )}
                        <span>{req.label}</span>
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
                <FaLock className={`absolute left-3 top-3 h-4 w-4 transition-colors ${loading ? 'text-gray-300' : 'text-gray-400'}`} />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="••••••••"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-800 focus:border-transparent transition-all duration-200 ${
                    loading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  disabled={loading}
                  className={`absolute right-3 top-3 transition-colors ${
                    loading ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {showConfirm ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                </button>
              </div>
              
              {/* Password Match Indicator */}
              {formData.confirmPassword && (
                <div className={`flex items-center gap-1 mt-1 text-xs ${
                  passwordsMatch ? "text-green-600" : "text-red-600"
                }`}>
                  {passwordsMatch ? (
                    <>
                      <FaCheck className="w-3 h-3" />
                      <span>Passwords match</span>
                    </>
                  ) : (
                    <>
                      <FaTimes className="w-3 h-3" />
                      <span>Passwords do not match</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white transition-all duration-200 bg-green-900 hover:bg-green-700 ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
              }`}
            >
              {loading ? (
                <FaSpinner className="animate-spin mr-2 h-4 w-4" />
              ) : (
                <span className="mr-2">→</span>
              )}
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
