import React, { useState } from 'react';
import { 
  FaEnvelope, 
  FaEnvelopeOpen, 
  FaCar, 
  FaUser, 
  FaClock,
  FaTrash,
  FaFilter,
  FaInbox
} from 'react-icons/fa';
import { 
  useGetOwnerMessagesQuery, 
  useMarkMessageAsReadMutation,
  useDeleteMessageMutation 
} from '../../../../store/Message/messageApi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const OwnerMessages: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [selectedCarId, setSelectedCarId] = useState<number | undefined>(undefined);
  
  const { data, isLoading, error, refetch } = useGetOwnerMessagesQuery({
    unreadOnly: filter === 'unread',
    carId: selectedCarId,
  });

  const [markAsRead] = useMarkMessageAsReadMutation();
  const [deleteMessage] = useDeleteMessageMutation();

  const handleMarkAsRead = async (messageId: number) => {
    try {
      await markAsRead(messageId).unwrap();
      toast.success('Message marked as read');
      refetch();
    } catch (error: any) {
      console.error('Error marking message as read:', error);
      toast.error(error?.data?.error || 'Failed to mark message as read');
    }
  };

  const handleDelete = async (messageId: number) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      await deleteMessage(messageId).unwrap();
      toast.success('Message deleted');
      refetch();
    } catch (error: any) {
      console.error('Error deleting message:', error);
      toast.error(error?.data?.error || 'Failed to delete message');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Error loading messages</h2>
        <p className="text-gray-600">Failed to load your messages. Please try again later.</p>
      </div>
    );
  }

  const messages = data?.messages || [];
  const unreadCount = messages.filter(m => !m.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Messages</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage inquiries from potential renters about your cars
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Messages</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{data?.total || 0}</p>
              </div>
              <FaInbox className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Unread</p>
                <p className="text-2xl font-bold text-orange-600">{unreadCount}</p>
              </div>
              <FaEnvelope className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Read</p>
                <p className="text-2xl font-bold text-green-600">{messages.length - unreadCount}</p>
              </div>
              <FaEnvelopeOpen className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter:</span>
            </div>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              All Messages
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Unread Only
            </button>
          </div>
        </div>

        {/* Messages List */}
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
              <FaInbox className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No messages yet</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {filter === 'unread' 
                  ? "You don't have any unread messages"
                  : "When renters send you inquiries, they'll appear here"}
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow ${
                  !message.isRead ? 'border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="p-6">
                  {/* Message Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Sender Avatar */}
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {(() => {
                          const name = message.sender?.name || `${message.sender?.firstName || ''} ${message.sender?.lastName || ''}`.trim();
                          const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                          return initials || 'U';
                        })()}
                      </div>
                      
                      {/* Message Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {message.sender?.name || `${message.sender?.firstName || ''} ${message.sender?.lastName || ''}`.trim() || 'Unknown User'}
                          </h3>
                          {!message.isRead && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                              New
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <div className="flex items-center gap-1">
                            <FaUser className="w-3 h-3" />
                            <span>{message.sender?.email}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FaCar className="w-3 h-3" />
                            <span>
                              {message.car?.brand} {message.car?.model} ({message.car?.year})
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FaClock className="w-3 h-3" />
                            <span>
                              {format(new Date(message.createdAt), 'MMM dd, yyyy h:mm a')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      {!message.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(message.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Mark as read"
                        >
                          <FaEnvelopeOpen className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(message.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Delete message"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className="pl-16">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{message.messageText}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination info */}
        {messages.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Showing {messages.length} of {data?.total || 0} messages
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerMessages;
