'use client';

import { useState, useEffect } from 'react';
import axiosInstance from '@/app/utils/axiosInstance';
import { AlertCircle, CheckCircle, Clock, Mail, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface EmailLog {
  id: string;
  recipientEmail: string;
  subject: string;
  emailType: string;
  orderNumber: string | null;
  status: 'processing' | 'sent' | 'failed' | 'permanently_failed';
  attemptNumber: number;
  errorMessage: string | null;
  failureReason: string | null;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface EmailStats {
  totalSent: number;
  totalFailed: number;
  sentToday: number;
  sentThisMonth: number;
  byType: Array<{
    emailType: string;
    _count: { id: number };
  }>;
}

interface QueueStats {
  active: number;
  waiting: number;
  completed: number;
  failed: number;
  delayed: number;
  failedJobs: number;
}

export default function EmailLogsPage() {
  const [emails, setEmails] = useState<EmailLog[]>([]);
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [queueStats, setQueueStats] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [filter] = useState<'all' | 'failed' | 'sent'>('failed');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [page, filter]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch statistics
      const statsRes = await axiosInstance.get('/api/admin/email/statistics');
      setStats(statsRes.data.data);

      // Fetch queue stats
      const queueRes = await axiosInstance.get('/api/admin/email/queue/stats');
      setQueueStats(queueRes.data.data);

      // Fetch emails
      const emailsRes = await axiosInstance.get(
        `/api/admin/email/failed?page=${page}&limit=${limit}`
      );
      setEmails(emailsRes.data.data.emails);
      setTotalPages(emailsRes.data.data.pagination.pages);
    } catch (error: any) {
      console.error('Error fetching data:', error);

      if (error.response?.status === 403) {
        toast.error('You do not have permission to view email logs.');
      } else {
        toast.error('Failed to load email logs');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (emailLogId: string) => {
    try {
      setRetrying(emailLogId);

      await axiosInstance.post(`/api/admin/email/retry/${emailLogId}`);

      toast.success('Email retry queued!');
      setTimeout(() => fetchData(), 1000);
    } catch (error: any) {
      console.error('Error retrying email:', error);
      toast.error('Failed to retry email');
    } finally {
      setRetrying(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-yellow-100 text-yellow-800';
      case 'permanently_failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-4 h-4" />;
      case 'processing':
        return <Clock className="w-4 h-4" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4" />;
      case 'permanently_failed':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Mail className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading email logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Email Management</h1>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Sent</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.totalSent}
                  </p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Failed</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">
                    {stats.totalFailed}
                  </p>
                </div>
                <AlertCircle className="w-12 h-12 text-red-500 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Today</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {stats.sentToday}
                  </p>
                </div>
                <Mail className="w-12 h-12 text-blue-500 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">This Month</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">
                    {stats.sentThisMonth}
                  </p>
                </div>
                <Mail className="w-12 h-12 text-purple-500 opacity-20" />
              </div>
            </div>
          </div>
        )}

        {/* Queue Status */}
        {queueStats && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Queue Status</h2>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Active</p>
                <p className="text-2xl font-bold text-blue-600">{queueStats.active}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Waiting</p>
                <p className="text-2xl font-bold text-yellow-600">{queueStats.waiting}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Completed</p>
                <p className="text-2xl font-bold text-green-600">{queueStats.completed}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Failed</p>
                <p className="text-2xl font-bold text-red-600">{queueStats.failed}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Delayed</p>
                <p className="text-2xl font-bold text-purple-600">{queueStats.delayed}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Failed Jobs</p>
                <p className="text-2xl font-bold text-red-600">{queueStats.failedJobs}</p>
              </div>
            </div>
          </div>
        )}

        {/* Email Types Breakdown */}
        {stats && stats.byType.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Emails by Type</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.byType.map((type) => (
                <div key={type.emailType} className="border rounded p-3">
                  <p className="text-gray-600 text-sm capitalize">{type.emailType}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {type._count.id}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Failed Emails Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Failed Emails</h2>
          </div>

          {emails.length === 0 ? (
            <div className="p-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3 opacity-50" />
              <p className="text-gray-600">No failed emails! 🎉</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Error
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Sent At
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {emails.map((email) => (
                    <tr key={email.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 truncate">
                        {email.recipientEmail}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 truncate">
                        {email.subject}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium capitalize">
                          {email.emailType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {email.orderNumber || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium w-fit ${getStatusColor(
                            email.status
                          )}`}
                        >
                          {getStatusIcon(email.status)}
                          {email.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-red-600 truncate">
                        <span title={email.failureReason || email.errorMessage || ''}>
                          {(
                            email.failureReason ||
                            email.errorMessage ||
                            'No error'
                          ).substring(0, 30)}
                          {(email.failureReason || email.errorMessage || '').length > 30
                            ? '...'
                            : ''}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {email.sentAt ? formatDate(email.sentAt) : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {email.status === 'permanently_failed' && (
                          <button
                            onClick={() => handleRetry(email.id)}
                            disabled={retrying === email.id}
                            className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 text-xs font-medium"
                          >
                            {retrying === email.id ? (
                              <>
                                <RefreshCw className="w-3 h-3 animate-spin" />
                                Retrying...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="w-3 h-3" />
                                Retry
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}