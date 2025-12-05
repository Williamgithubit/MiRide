import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectRevenueReport } from '../../../../../store/Admin/adminReportsSlice';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  FaDollarSign,
  FaMoneyBillWave,
  FaChartLine,
  FaHourglassHalf,
  FaFileCsv,
  FaFilePdf,
} from 'react-icons/fa';
import {
  exportToCSV,
  exportRevenueReportToPDF,
  formatCurrency,
} from '../../../../../utils/exportUtils';
import tokenStorage from '../../../../../utils/tokenStorage';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const RevenueReports: React.FC = () => {
  const report = useSelector(selectRevenueReport);

  const [paymentStats, setPaymentStats] = useState<any | null>(null);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsError, setPaymentsError] = useState<string | null>(null);

  // Fetch fallback payment stats
  useEffect(() => {
    const fetchPaymentStats = async () => {
      setPaymentsLoading(true);
      setPaymentsError(null);
      try {
        const token = tokenStorage.getToken();
        const base = process.env.REACT_APP_API_BASE_URL || '';
        const res = await fetch(`${base}/api/admin/payments/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || 'Failed to fetch payment stats');
        }

        const data = await res.json();
        setPaymentStats(data);
      } catch (err) {
        setPaymentsError((err as Error).message || 'Error fetching payment stats');
      } finally {
        setPaymentsLoading(false);
      }
    };

    fetchPaymentStats();
  }, []);

  // Determine which data source to use
  const reportHasTotals = report && Number(report.totalRevenue || 0) > 0;
  const paymentsHaveTotals = paymentStats && Number(paymentStats.totalRevenue || 0) > 0;

  const totalRevenue = reportHasTotals
    ? Number(report.totalRevenue || 0)
    : paymentsHaveTotals
    ? Number(paymentStats.totalRevenue || 0)
    : 0;

  const totalPayouts = reportHasTotals
    ? Number(report.totalPayouts || 0)
    : paymentsHaveTotals
    ? Number(paymentStats.totalPayouts || 0)
    : 0;

  const totalCommissions = reportHasTotals
    ? Number(report.totalCommissions || 0)
    : paymentsHaveTotals
    ? Number(paymentStats.platformCommission || paymentStats.totalCommissions || 0)
    : 0;

  const pendingPayouts = reportHasTotals
    ? Number(report.pendingPayouts || 0)
    : paymentsHaveTotals
    ? Number(paymentStats.pendingPayments || 0)
    : 0;

  const revenueByMonth = report?.revenueByMonth || [];
  const revenueByCategory = report?.revenueByCategory || [];

  const handleExportCSV = () => {
    const data = [
      { metric: 'Total Revenue', value: totalRevenue },
      { metric: 'Total Payouts', value: totalPayouts },
      { metric: 'Total Commissions', value: totalCommissions },
      { metric: 'Pending Payouts', value: pendingPayouts },
    ];
    exportToCSV(data, 'revenue_report');
  };

  const handleExportPDF = () => {
    const payload = reportHasTotals ? report : paymentStats || {};
    exportRevenueReportToPDF(payload);
  };

  const stats = [
    {
      label: 'Total Revenue',
      value: totalRevenue,
      icon: <FaDollarSign />,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Total Payouts',
      value: totalPayouts,
      icon: <FaMoneyBillWave />,
      color: 'bg-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      label: 'Total Commissions',
      value: totalCommissions,
      icon: <FaChartLine />,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      label: 'Pending Payouts',
      value: pendingPayouts,
      icon: <FaHourglassHalf />,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Export Buttons */}
      <div className="flex justify-end gap-3">
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <FaFileCsv />
          <span>Export CSV</span>
        </button>
        <button
          onClick={handleExportPDF}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <FaFilePdf />
          <span>Export PDF</span>
        </button>
      </div>

      {/* Fallback Notice */}
      {!reportHasTotals && paymentsHaveTotals && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-sm">
          Showing totals derived from rental/payment stats (fallback). For transaction-level data, ensure Payment records exist.
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`${stat.bgColor} rounded-lg p-6 border border-gray-200 dark:border-gray-700`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 ${stat.color} text-white rounded-lg`}>
                {stat.icon}
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {formatCurrency(stat.value)}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Monthly Revenue Trend */}
      {revenueByMonth.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Monthly Revenue Trend
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '0.5rem' }}
                formatter={(value: number) => formatCurrency(Number(value || 0))}
              />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#3B82F6', r: 5 }} name="Revenue" />
              <Line type="monotone" dataKey="payouts" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', r: 5 }} name="Payouts" />
              <Line type="monotone" dataKey="commissions" stroke="#8B5CF6" strokeWidth={3} dot={{ fill: '#8B5CF6', r: 5 }} name="Commissions" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Category - Pie Chart */}
        {revenueByCategory.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Revenue by Category
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenueByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, revenue, percent }: any) =>
                    `${category}: ${formatCurrency(Number(revenue || 0))} (${((percent ?? 0) * 100).toFixed(0)}%)`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {revenueByCategory.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '0.5rem' }}
                  formatter={(value: number) => formatCurrency(Number(value || 0))}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Monthly Comparison - Bar Chart */}
        {revenueByMonth.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Monthly Comparison
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '0.5rem' }}
                  formatter={(value: number) => formatCurrency(Number(value || 0))}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#3B82F6" name="Revenue" />
                <Bar dataKey="commissions" fill="#8B5CF6" name="Commissions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Monthly Revenue Table */}
      {revenueByMonth.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Monthly Revenue Breakdown</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Month</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Payouts</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Commissions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Profit Margin</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {revenueByMonth.map((item: any, index: number) => {
                  const rev = Number(item.revenue || 0);
                  const comm = Number(item.commissions || 0);
                  const profitMargin = rev > 0 ? ((comm / rev) * 100).toFixed(1) : '0.0';
                  return (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.month}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{formatCurrency(rev)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{formatCurrency(Number(item.payouts || 0))}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{formatCurrency(comm)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                          {profitMargin}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Revenue by Category Table */}
      {revenueByCategory.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue by Category</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Percentage</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {revenueByCategory.map((item: any, index: number) => {
                  const percentage = totalRevenue > 0 ? ((Number(item.revenue || 0) / totalRevenue) * 100).toFixed(1) : '0.0';
                  return (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {item.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {formatCurrency(Number(item.revenue || 0))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-[100px]">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span>{percentage}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueReports;