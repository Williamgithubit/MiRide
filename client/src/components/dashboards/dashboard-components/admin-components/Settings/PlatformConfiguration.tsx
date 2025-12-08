import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../../store/store';
import { updatePlatformConfig, uploadCompanyLogo, PlatformConfig } from '../../../../../store/Admin/adminSettingsSlice';
import { FaBuilding, FaImage, FaDollarSign, FaPercent, FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock, FaCalendarAlt, FaHandHoldingUsd } from 'react-icons/fa';

interface PlatformConfigurationProps {
  config: PlatformConfig | null;
}

const PlatformConfiguration: React.FC<PlatformConfigurationProps> = ({ config }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isSaving } = useSelector((state: RootState) => state.adminSettings);
  
  const [formData, setFormData] = useState({
    companyName: config?.companyName || '',
    companyLogo: config?.companyLogo || '',
    defaultCurrency: config?.defaultCurrency || 'USD',
    taxPercentage: config?.taxPercentage || 0,
    serviceFeePercentage: config?.serviceFeePercentage || 0,
    supportEmail: config?.supportEmail || '',
    supportPhone: config?.supportPhone || '',
    companyAddress: config?.companyAddress || '',
    commissionRate: config?.commissionRate || 15,
    minBookingDuration: config?.minBookingDuration || 1,
    maxBookingDuration: config?.maxBookingDuration || 30,
    cancellationPolicyHours: config?.cancellationPolicyHours || 24,
    lateFeePercentage: config?.lateFeePercentage || 10,
  });

  // Update form data when config changes
  useEffect(() => {
    if (config) {
      setFormData({
        companyName: config.companyName || '',
        companyLogo: config.companyLogo || '',
        defaultCurrency: config.defaultCurrency || 'USD',
        taxPercentage: config.taxPercentage || 0,
        serviceFeePercentage: config.serviceFeePercentage || 0,
        supportEmail: config.supportEmail || '',
        supportPhone: config.supportPhone || '',
        companyAddress: config.companyAddress || '',
        commissionRate: config.commissionRate || 15,
        minBookingDuration: config.minBookingDuration || 1,
        maxBookingDuration: config.maxBookingDuration || 30,
        cancellationPolicyHours: config.cancellationPolicyHours || 24,
        lateFeePercentage: config.lateFeePercentage || 10,
      });
    }
  }, [config]);

  const [isEditing, setIsEditing] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'LRD', name: 'Liberian Dollar', symbol: 'L$' },
    { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
    { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('Percentage') || name.includes('Rate') || name.includes('Duration') || name.includes('Hours')
        ? parseFloat(value) || 0 
        : value,
    }));
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Upload to Cloudinary via backend
        const result = await dispatch(uploadCompanyLogo(file)).unwrap();
        setFormData(prev => ({
          ...prev,
          companyLogo: result.companyLogo,
        }));
      } catch (error) {
        console.error('Failed to upload company logo:', error);
      }
    }
  };

  const handleSave = async () => {
    try {
      await dispatch(updatePlatformConfig(formData)).unwrap();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update platform configuration:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      companyName: config?.companyName || '',
      companyLogo: config?.companyLogo || '',
      defaultCurrency: config?.defaultCurrency || 'USD',
      taxPercentage: config?.taxPercentage || 0,
      serviceFeePercentage: config?.serviceFeePercentage || 0,
      supportEmail: config?.supportEmail || '',
      supportPhone: config?.supportPhone || '',
      companyAddress: config?.companyAddress || '',
      commissionRate: config?.commissionRate || 15,
      minBookingDuration: config?.minBookingDuration || 1,
      maxBookingDuration: config?.maxBookingDuration || 30,
      cancellationPolicyHours: config?.cancellationPolicyHours || 24,
      lateFeePercentage: config?.lateFeePercentage || 10,
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Platform Configuration
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage global system settings and company information
          </p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          {isEditing ? 'Cancel' : 'Edit Configuration'}
        </button>
      </div>

      {/* Company Information */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FaBuilding className="text-blue-600" />
          Company Information
        </h4>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Company Logo */}
          <div className="flex flex-col items-center space-y-4 lg:col-span-1">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-600 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-500">
                {formData.companyLogo ? (
                  <img
                    src={formData.companyLogo}
                    alt="Company Logo"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <FaImage className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                )}
              </div>
              {isEditing && (
                <button
                  onClick={() => logoInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 bg-blue-600 hover:bg-blue-700 text-white p-1.5 sm:p-2 rounded-full shadow-lg transition-colors"
                >
                  <FaImage className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              )}
            </div>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="hidden"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Company Logo<br />
              (Recommended: 200x200px)
            </p>
          </div>

          {/* Company Details */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company Name
              </label>
              <div className="relative">
                <FaBuilding className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Enter company name"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company Address
              </label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <textarea
                  name="companyAddress"
                  value={formData.companyAddress}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Enter company address"
                  rows={3}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Settings */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FaDollarSign className="text-green-600" />
          Financial Settings
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Default Currency
            </label>
            <div className="relative">
              <FaDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                name="defaultCurrency"
                value={formData.defaultCurrency}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
              >
                {currencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.name} ({currency.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tax Percentage (%)
            </label>
            <div className="relative">
              <FaPercent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="number"
                name="taxPercentage"
                value={formData.taxPercentage}
                onChange={handleInputChange}
                disabled={!isEditing}
                min="0"
                max="100"
                step="0.1"
                placeholder="0.0"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Service Fee (%)
            </label>
            <div className="relative">
              <FaPercent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="number"
                name="serviceFeePercentage"
                value={formData.serviceFeePercentage}
                onChange={handleInputChange}
                disabled={!isEditing}
                min="0"
                max="100"
                step="0.1"
                placeholder="0.0"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Commission & Booking Policies */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FaHandHoldingUsd className="text-yellow-600" />
          Commission & Booking Policies
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Commission Rate (%)
            </label>
            <div className="relative">
              <FaPercent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="number"
                name="commissionRate"
                value={formData.commissionRate}
                onChange={handleInputChange}
                disabled={!isEditing}
                min="0"
                max="100"
                step="0.1"
                placeholder="15"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Platform commission on each booking</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Min Booking Duration (days)
            </label>
            <div className="relative">
              <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="number"
                name="minBookingDuration"
                value={formData.minBookingDuration}
                onChange={handleInputChange}
                disabled={!isEditing}
                min="1"
                max="30"
                step="1"
                placeholder="1"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Max Booking Duration (days)
            </label>
            <div className="relative">
              <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="number"
                name="maxBookingDuration"
                value={formData.maxBookingDuration}
                onChange={handleInputChange}
                disabled={!isEditing}
                min="1"
                max="365"
                step="1"
                placeholder="30"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cancellation Policy (hours)
            </label>
            <div className="relative">
              <FaClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="number"
                name="cancellationPolicyHours"
                value={formData.cancellationPolicyHours}
                onChange={handleInputChange}
                disabled={!isEditing}
                min="0"
                max="168"
                step="1"
                placeholder="24"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Free cancellation before this time</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Late Fee (%)
            </label>
            <div className="relative">
              <FaPercent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="number"
                name="lateFeePercentage"
                value={formData.lateFeePercentage}
                onChange={handleInputChange}
                disabled={!isEditing}
                min="0"
                max="100"
                step="0.1"
                placeholder="10"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Fee for late returns per day</p>
          </div>
        </div>
      </div>

      {/* Support Information */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FaEnvelope className="text-purple-600" />
          Support Information
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Support Email
            </label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="email"
                name="supportEmail"
                value={formData.supportEmail}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="support@company.com"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Support Phone
            </label>
            <div className="relative">
              <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="tel"
                name="supportPhone"
                value={formData.supportPhone}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="+1 (555) 123-4567"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save/Cancel Buttons */}
      {isEditing && (
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full sm:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              'Save Configuration'
            )}
          </button>
          <button
            onClick={handleCancel}
            className="w-full sm:w-auto px-6 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default PlatformConfiguration;
