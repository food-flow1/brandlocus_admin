'use client';

import { useState, useMemo, use, useCallback } from 'react';
import Link from 'next/link';
import SearchInput from '@/components/SearchInput';
import Button from '@/components/Button';
import DatePicker from '@/components/DatePicker';
import { ROUTES } from '@/constants/routes';
import { AiOutlineEdit } from 'react-icons/ai';
import { TbCloudDownload } from 'react-icons/tb';
import { useChatDetails, useUpdateAIResponse } from '@/hooks/useChatSessions';
import { ChatMessage, ChatDetailsFilterParams } from '@/lib/api/services/chatSessions';
import { useToast } from '@/components/Toast';
import { formatMessageContent } from '@/lib/utils/formatMessage';

interface ChatLogDetailsPageProps {
  params: Promise<{ id: string }>;
}

const ChatLogDetailsPage = ({ params }: ChatLogDetailsPageProps) => {
  const { id } = use(params);
  const sessionId = parseInt(id, 10);
  const { showToast } = useToast();

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
  const [editedAnswer, setEditedAnswer] = useState('');

  // Build API params
  const apiParams: ChatDetailsFilterParams = useMemo(() => ({
    sessionId,
    searchTerm: appliedSearchTerm || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  }), [sessionId, appliedSearchTerm, startDate, endDate]);

  // Fetch chat details from API
  const { data, isLoading, error, refetch } = useChatDetails(apiParams);

  // Update AI response mutation
  const updateAIResponse = useUpdateAIResponse(sessionId);

  // Handle search
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setAppliedSearchTerm(value);
  }, []);

  // Get messages from API response (data is directly an array)
  const chatMessages = data || [];
  const totalMessages = chatMessages.length;

  // Get user info from first message
  const userInfo = chatMessages.length > 0 ? chatMessages[0] : null;

  // Group messages into Q&A pairs (user question + AI response)
  const groupedMessages = useMemo(() => {
    const groups: { user: ChatMessage | null; assistant: ChatMessage | null; }[] = [];
    let currentGroup: { user: ChatMessage | null; assistant: ChatMessage | null } = { user: null, assistant: null };

    chatMessages.forEach((msg) => {
      if (msg.userType === 'USER') {
        if (currentGroup.user) {
          groups.push(currentGroup);
          currentGroup = { user: null, assistant: null };
        }
        currentGroup.user = msg;
      } else if (msg.userType === 'AI') {
        currentGroup.assistant = msg;
        groups.push(currentGroup);
        currentGroup = { user: null, assistant: null };
      }
    });

    if (currentGroup.user || currentGroup.assistant) {
      groups.push(currentGroup);
    }

    return groups;
  }, [chatMessages]);

  // Export chat to CSV (client-side)
  const handleExport = useCallback(() => {
    if (chatMessages.length === 0) return;

    // Escape CSV values to handle commas, quotes, and newlines
    const escapeCSV = (value: string) => {
      if (!value) return '';
      const escaped = value.replace(/"/g, '""');
      if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n')) {
        return `"${escaped}"`;
      }
      return escaped;
    };

    // Build CSV content
    const headers = ['Message ID', 'User Type', 'Content', 'Timestamp', 'Name', 'Industry', 'Business'];
    const csvRows = [
      headers.join(','),
      ...chatMessages.map(msg => [
        escapeCSV(String(msg.messageId)),
        escapeCSV(msg.userType),
        escapeCSV(msg.content),
        escapeCSV(msg.createdAt || ''),
        escapeCSV(msg.name || ''),
        escapeCSV(msg.industryName || ''),
        escapeCSV(msg.businessName || ''),
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chat-session-${sessionId}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, [chatMessages, sessionId]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    // Format date as YYYY-MM-DD for API
    const formattedDate = date.toISOString().split('T')[0];
    // Set both start and end date to the same day for single day filter
    setStartDate(formattedDate);
    setEndDate(formattedDate);
    setIsDatePickerOpen(false);
  };

  const handleEditClick = (message: ChatMessage) => {
    setEditingMessage(message);
    setEditedAnswer(message.content);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingMessage && editedAnswer.trim()) {
      updateAIResponse.mutate(
        { messageId: editingMessage.messageId, content: editedAnswer },
        {
          onSuccess: () => {
            setIsEditModalOpen(false);
            setEditingMessage(null);
            setEditedAnswer('');
            refetch(); // Refresh the chat messages
            showToast('AI response updated successfully', 'success');
          },
          onError: (error) => {
            console.error('Failed to update AI response:', error);
            showToast('Failed to update response. Please try again.', 'error');
          },
        }
      );
    }
  };

  const handleCancelEdit = () => {
    setIsEditModalOpen(false);
    setEditingMessage(null);
    setEditedAnswer('');
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Go Back Link */}
      <Link
        href={ROUTES.chatLog}
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4 sm:mb-6"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 12L6 8L10 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Go Back
      </Link>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-green-500" />
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-red-500 mb-4">Failed to load chat details</p>
          <Button text="Retry" onClick={() => refetch()} />
        </div>
      )}

      {/* Content */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Session Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Session Information</h2>

              <div className="flex flex-wrap items-start gap-4 sm:gap-6 lg:gap-8">
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-gray-600">Session ID:</span>
                  <span className="text-sm font-semibold text-gray-900">{sessionId}</span>
                </div>
                {userInfo && (
                  <>
                    <div className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-gray-600">User:</span>
                      <span className="text-sm font-semibold text-gray-900">{userInfo.name}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-gray-600">Business:</span>
                      <span className="text-sm font-semibold text-gray-900">{userInfo.businessName}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-gray-600">Industry:</span>
                      <span className="text-sm font-semibold text-gray-900">{userInfo.industryName}</span>
                    </div>
                  </>
                )}
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-gray-600">Total Messages:</span>
                  <span className="text-sm font-semibold text-gray-900">{totalMessages}</span>
                </div>
                {chatMessages.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-gray-600">Last Activity:</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatDate(chatMessages[chatMessages.length - 1].createdAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Search and Date Filter */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <div className="flex-1">
                <SearchInput
                  placeholder="Search messages"
                  value={searchTerm}
                  onSearch={handleSearch}
                />
              </div>
              <div className="relative w-full sm:w-auto">
                <Button
                  text="Select Dates"
                  icon={
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.6667 2.66667H3.33333C2.59695 2.66667 2 3.26362 2 4V13.3333C2 14.0697 2.59695 14.6667 3.33333 14.6667H12.6667C13.403 14.6667 14 14.0697 14 13.3333V4C14 3.26362 13.403 2.66667 12.6667 2.66667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M10.6667 1.33333V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M5.33333 1.33333V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M2 6.66667H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  }
                  onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                  fullWidth
                  className="sm:!w-auto"
                />
                <DatePicker
                  isOpen={isDatePickerOpen}
                  onClose={() => setIsDatePickerOpen(false)}
                  onDateSelect={handleDateSelect}
                  selectedDate={selectedDate}
                  position="right"
                />
              </div>
            </div>

            {/* Chat Transcript */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Chat Transcript</h2>
              <div className="space-y-4 sm:space-y-6 max-h-[400px] sm:max-h-[500px] lg:max-h-[600px] overflow-y-auto">
                {groupedMessages.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No messages found</p>
                ) : (
                  groupedMessages.map((group, index) => (
                    <div key={index} className="space-y-3 sm:space-y-4 border-b border-gray-100 pb-4 sm:pb-6 last:border-0 last:pb-0">
                      {/* Question - Left aligned */}
                      {group.user && (
                        <div className="flex justify-start">
                          <div className="max-w-[85%] sm:max-w-[75%] lg:max-w-[70%]">
                            <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">{group.user.name}</p>
                            <div className="bg-gray-100 rounded-lg p-2 sm:p-3">
                              <div className="text-sm sm:text-base text-gray-900">{formatMessageContent(group.user.content)}</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Answer - Right aligned */}
                      {group.assistant && (
                        <div className="flex justify-end items-start gap-1 sm:gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(group.assistant!);
                            }}
                            className="mt-5 sm:mt-6 flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
                            aria-label="Edit answer"
                          >
                            <AiOutlineEdit size={14} className="sm:w-4 sm:h-4" />
                          </button>
                          <div className="max-w-[85%] sm:max-w-[75%] lg:max-w-[70%]">
                            <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 text-right">AI Response</p>
                            <div className="bg-purple-100 rounded-lg p-2 sm:p-3">
                              <div className="text-sm sm:text-base text-gray-900">{formatMessageContent(group.assistant.content)}</div>
                            </div>
                          </div>
                        </div>
                      )}

                      <p className="text-xs sm:text-sm text-gray-500 text-center">
                        {formatTime(group.user?.createdAt || group.assistant?.createdAt || '')}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white flex flex-col justify-between lg:h-[80%] rounded-lg border border-gray-200 p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Chat Metadata */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Chat Metadata</h3>
                <div className="space-y-3">
                  <div className='sm:flex sm:items-center sm:gap-2'>
                    <span className="text-xs sm:text-sm font-medium text-gray-600">Session ID:</span>
                    <p className="text-xs sm:text-sm text-gray-900 mt-1 break-all">{sessionId}</p>
                  </div>
                  {userInfo && (
                    <>
                      <div className='sm:flex sm:items-center sm:gap-2'>
                        <span className="text-xs sm:text-sm font-medium text-gray-600">User:</span>
                        <p className="text-xs sm:text-sm text-gray-900 mt-1">{userInfo.name}</p>
                      </div>
                      <div className='sm:flex sm:items-center sm:gap-2'>
                        <span className="text-xs sm:text-sm font-medium text-gray-600">Business:</span>
                        <p className="text-xs sm:text-sm text-gray-900 mt-1">{userInfo.businessName}</p>
                      </div>
                      <div className='sm:flex sm:items-center sm:gap-2'>
                        <span className="text-xs sm:text-sm font-medium text-gray-600">Industry:</span>
                        <p className="text-xs sm:text-sm text-gray-900 mt-1">{userInfo.industryName}</p>
                      </div>
                    </>
                  )}
                  <div className='sm:flex sm:items-center sm:gap-2'>
                    <span className="text-xs sm:text-sm font-medium text-gray-600">Messages:</span>
                    <p className="text-xs sm:text-sm text-gray-900 mt-1">{totalMessages}</p>
                  </div>
                </div>
              </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 gap-3 pt-4 border-t border-gray-200">
            
              <Button
                icon={<TbCloudDownload size={18} className="sm:w-5 sm:h-5" />}
                text="Export"
                variant="primary"
                onClick={handleExport}
                disabled={chatMessages.length === 0}
                fullWidth
                className="sm:!w-auto"
              />
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Edit AI Response</h3>
              <button
                onClick={handleCancelEdit}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close modal"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Original Content:
                </label>
                <div className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3">
                  {editingMessage?.content && formatMessageContent(editingMessage.content)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI Response:
                </label>
                <textarea
                  value={editedAnswer}
                  onChange={(e) => setEditedAnswer(e.target.value)}
                  className="w-full min-h-[150px] px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-y"
                  placeholder="Enter AI response..."
                />
              </div>

              {/* Live Preview */}
              {editedAnswer && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preview:
                  </label>
                  <div className="text-sm text-gray-900 bg-purple-50 rounded-lg p-3 max-h-[200px] overflow-y-auto border border-purple-200">
                    {formatMessageContent(editedAnswer)}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-4 sm:p-6 border-t border-gray-200">
              <Button
                text="Cancel"
                variant="default"
                onClick={handleCancelEdit}
                disabled={updateAIResponse.isPending}
              />
              <Button
                text={updateAIResponse.isPending ? "Saving..." : "Save"}
                variant="primary"
                onClick={handleSaveEdit}
                disabled={updateAIResponse.isPending || !editedAnswer.trim()}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatLogDetailsPage;