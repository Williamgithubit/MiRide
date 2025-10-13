import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../../store/store';
import { sendNotification } from '../../../../../store/Admin/adminNotificationsSlice';
import { FaTimes, FaPaperPlane } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface SendNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SendNotificationModal: React.FC<SendNotificationModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    recipient: 'All',
    type: 'System',
    link: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error('Title and message are required');
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(sendNotification(formData)).unwrap();
      toast.success('Notification sent successfully!');
      setFormData({
        title: '',
        message: '',
        recipient: 'All',
        type: 'System',
        link: '',
      });
      onClose();
    } catch (error) {
      toast.error('Failed to send notification');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Background overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity z-40"
        aria-hidden="true"
        onClick={onClose}
      ></div>

      {/* Modal container */}
      <div className="flex items-center justify-center min-h-screen px-3 sm:px-4 py-4 sm:py-6 relative z-50">
        <div 
          className="relative bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              Send New Notification
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 p-1"
            >
              <FaTimes size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-4 sm:px-6 py-4">
            <div className="space-y-3 sm:space-y-4">
              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter notification title"
                  required
                />
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter notification message"
                  required
                />
              </div>

              {/* Recipient and Type Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Recipient */}
                <div>
                  <label
                    htmlFor="recipient"
                    className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Recipient
                  </label>
                  <select
                    id="recipient"
                    name="recipient"
                    value={formData.recipient}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="All">All Users</option>
                    <option value="Owner">Owners Only</option>
                    <option value="Customer">Customers Only</option>
                  </select>
                </div>

                {/* Type */}
                <div>
                  <label
                    htmlFor="type"
                    className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="System">System</option>
                    <option value="Booking">Booking</option>
                    <option value="Payment">Payment</option>
                    <option value="Review">Review</option>
                  </select>
                </div>
              </div>

              {/* Link (Optional) */}
              <div>
                <label
                  htmlFor="link"
                  className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Link (Optional)
                </label>
                <input
                  type="url"
                  id="link"
                  name="link"
                  value={formData.link}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="https://example.com"
                />
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-2.5 sm:p-3">
                <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
                  <strong>Note:</strong> This notification will be sent to{' '}
                  {formData.recipient === 'All'
                    ? 'all users (owners and customers)'
                    : formData.recipient === 'Owner'
                    ? 'all car owners'
                    : 'all customers'}
                  .
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                disabled={isSubmitting}
              >
                <FaPaperPlane className="text-xs" />
                <span>{isSubmitting ? 'Sending...' : 'Send Notification'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  // Use portal to render modal at document body level
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) {
    console.error('Modal root element not found');
    return null;
  }

  return createPortal(modalContent, modalRoot);
};

export default SendNotificationModal;
