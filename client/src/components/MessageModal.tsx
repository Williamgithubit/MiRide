import React, { useState, useEffect } from 'react';
import { FaTimes, FaPaperPlane, FaBan } from 'react-icons/fa';
import { useSendMessageMutation } from '../store/Message/messageApi';
import toast from 'react-hot-toast';
import useReduxAuth from '../store/hooks/useReduxAuth';

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  carId: number;
  ownerId: string;
  ownerName: string;
  carName: string;
}

const MessageModal: React.FC<MessageModalProps> = ({
  isOpen,
  onClose,
  carId,
  ownerId,
  ownerName,
  carName,
}) => {
  const [messageText, setMessageText] = useState('');
  const [sendMessage, { isLoading }] = useSendMessageMutation();
  const { user } = useReduxAuth();

  // Check if user is an owner and show warning
  useEffect(() => {
    if (isOpen && user?.role === 'owner') {
      toast.error('Only customers can send inquiries to car owners', {
        duration: 4000,
        icon: <FaBan className="text-red-500" />,
      });
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  }, [isOpen, user?.role, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent owners from sending messages
    if (user?.role === 'owner') {
      toast.error('Only customers can send inquiries to car owners');
      onClose();
      return;
    }

    if (!messageText.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (messageText.length > 5000) {
      toast.error('Message is too long (max 5000 characters)');
      return;
    }

    try {
      await sendMessage({
        carId,
        ownerId,
        messageText: messageText.trim(),
      }).unwrap();

      toast.success('Message sent successfully!');
      setMessageText('');
      onClose();
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(error?.data?.error || 'Failed to send message');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/10 backdrop-blur-md p-4">
      <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Message Owner</h2>
            <p className="text-sm text-gray-600 mt-1">
              Send a message to {ownerName} about {carName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Your Message
            </label>
            <textarea
              id="message"
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Hi, I'm interested in renting this car. Is it available for..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              disabled={isLoading}
              maxLength={5000}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                Be specific about your rental dates and any questions you have
              </p>
              <p className="text-xs text-gray-500">
                {messageText.length}/5000
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !messageText.trim()}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Sending...
                </>
              ) : (
                <>
                  <FaPaperPlane className="w-4 h-4" />
                  Send Message
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MessageModal;
