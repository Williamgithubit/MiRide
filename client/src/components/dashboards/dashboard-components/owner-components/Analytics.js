import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import './analytics.css';
import { TrendingUp, Calendar, DollarSign, Car, Clock, BarChart3, Download, RefreshCw, Filter, Star, AlertCircle, } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, } from 'recharts';
import { useGetOwnerAnalyticsQuery, useLazyGenerateReportQuery } from '../../../../store/Dashboard/dashboardApi';
import toast from 'react-hot-toast';
// Color palette for charts
const COLORS = {
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#F59E0B',
    danger: '#EF4444',
    purple: '#8B5CF6',
    pink: '#EC4899',
    indigo: '#6366F1',
    teal: '#14B8A6',
};
const CHART_COLORS = [
    COLORS.primary,
    COLORS.secondary,
    COLORS.accent,
    COLORS.danger,
    COLORS.purple,
    COLORS.pink,
    COLORS.indigo,
    COLORS.teal,
];
const SummaryCard = ({ title, value, subtitle, icon: Icon, trend, color = 'blue', }) => {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
        green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
        yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
        red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
        purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    };
    return (_jsx("div", { className: "bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400 mb-1", children: title }), _jsx("p", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: value }), subtitle && (_jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400 mt-1", children: subtitle })), trend && (_jsxs("div", { className: "flex items-center mt-2", children: [_jsx(TrendingUp, { className: `w-4 h-4 mr-1 ${trend.type === 'increase' ? 'text-green-500' : 'text-red-500'} ${trend.type === 'decrease' ? 'rotate-180' : ''}` }), _jsxs("span", { className: `text-sm font-medium ${trend.type === 'increase' ? 'text-green-600' : 'text-red-600'}`, children: [trend.value > 0 ? '+' : '', trend.value, "%"] }), _jsx("span", { className: "text-sm text-gray-500 ml-1", children: "vs last month" })] }))] }), _jsx("div", { className: `p-3 rounded-lg ${colorClasses[color]}`, children: _jsx(Icon, { className: "w-6 h-6" }) })] }) }));
};
const ChartCard = ({ title, children, className = '' }) => (_jsxs("div", { className: `bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`, children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white mb-4", children: title }), children] }));
const Analytics = () => {
    const [timePeriod, setTimePeriod] = useState('monthly');
    const [isExporting, setIsExporting] = useState(false);
    // Fetch analytics data
    const { data: analyticsData, isLoading, error, refetch, } = useGetOwnerAnalyticsQuery({ period: timePeriod });
    // Generate report query (lazy)
    const [generateReport, { isLoading: isGeneratingReport }] = useLazyGenerateReportQuery();
    // Memoized calculations
    const summaryCards = useMemo(() => {
        if (!analyticsData)
            return [];
        const thisMonthBookings = analyticsData.totalBookingsThisMonth || 0;
        const lastMonthBookings = analyticsData.totalBookings - thisMonthBookings;
        const bookingsTrend = lastMonthBookings > 0
            ? ((thisMonthBookings - lastMonthBookings) / lastMonthBookings) * 100
            : 0;
        const thisMonthRevenue = analyticsData.totalRevenueThisMonth || 0;
        const lastMonthRevenue = analyticsData.totalRevenue - thisMonthRevenue;
        const revenueTrend = lastMonthRevenue > 0
            ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
            : 0;
        return [
            {
                title: 'Total Bookings',
                value: analyticsData.totalBookings,
                subtitle: `${thisMonthBookings} this month`,
                icon: Calendar,
                trend: {
                    value: Math.round(bookingsTrend * 10) / 10,
                    type: (bookingsTrend >= 0 ? 'increase' : 'decrease'),
                },
                color: 'blue',
            },
            {
                title: 'Total Revenue',
                value: `$${(analyticsData.totalRevenue || 0).toLocaleString()}`,
                subtitle: `$${(thisMonthRevenue || 0).toLocaleString()} this month`,
                icon: DollarSign,
                trend: {
                    value: Math.round(revenueTrend * 10) / 10,
                    type: (revenueTrend >= 0 ? 'increase' : 'decrease'),
                },
                color: 'green',
            },
            {
                title: 'Active Cars',
                value: analyticsData.activeCars || 0,
                subtitle: `${analyticsData.inactiveCars || 0} inactive`,
                icon: Car,
                color: 'purple',
            },
            {
                title: 'Pending Requests',
                value: analyticsData.pendingRequests || 0,
                subtitle: 'Awaiting approval',
                icon: Clock,
                color: 'yellow',
            },
        ];
    }, [analyticsData]);
    // Handle export functionality
    const handleExport = async (format) => {
        setIsExporting(true);
        try {
            // Trigger the report generation
            const result = await generateReport({
                reportType: format,
                startDate: undefined, // You can add date range selection later
                endDate: undefined,
            }).unwrap();
            toast.success(`Analytics exported as ${format.toUpperCase()}`);
            // In a real implementation, you would trigger a download here with the result
            console.log('Generated report:', result);
        }
        catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export analytics');
        }
        finally {
            setIsExporting(false);
        }
    };
    // Loading state
    if (isLoading) {
        return (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "flex items-center justify-between", children: _jsx("h2", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: "Analytics" }) }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [...Array(4)].map((_, i) => (_jsx("div", { className: "bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6", children: _jsxs("div", { className: "animate-pulse", children: [_jsx("div", { className: "h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" }), _jsx("div", { className: "h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" }), _jsx("div", { className: "h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" })] }) }, i))) })] }));
    }
    // Error state
    if (error) {
        return (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "flex items-center justify-between", children: _jsx("h2", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: "Analytics" }) }), _jsx("div", { className: "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6", children: _jsxs("div", { className: "flex items-center", children: [_jsx(AlertCircle, { className: "w-6 h-6 text-red-600 dark:text-red-400 mr-3" }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-red-800 dark:text-red-200", children: "Failed to Load Analytics" }), _jsx("p", { className: "text-red-600 dark:text-red-400 mt-1", children: "Unable to fetch analytics data. Please try again." }), _jsx("button", { onClick: () => refetch(), className: "mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors", children: "Retry" })] })] }) })] }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: "Analytics" }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Filter, { className: "w-4 h-4 text-gray-500" }), _jsxs("select", { value: timePeriod, onChange: (e) => setTimePeriod(e.target.value), className: "px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent", children: [_jsx("option", { value: "weekly", children: "Weekly" }), _jsx("option", { value: "monthly", children: "Monthly" }), _jsx("option", { value: "yearly", children: "Yearly" })] })] }), _jsxs("button", { onClick: () => handleExport('csv'), disabled: isExporting || isGeneratingReport, className: "flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm", children: [_jsx(Download, { className: "w-4 h-4" }), "CSV"] }), _jsxs("button", { onClick: () => handleExport('pdf'), disabled: isExporting || isGeneratingReport, className: "flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm", children: [_jsx(Download, { className: "w-4 h-4" }), "PDF"] }), _jsxs("button", { onClick: () => refetch(), className: "flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm", children: [_jsx(RefreshCw, { className: "w-4 h-4" }), "Refresh"] })] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: summaryCards.map((card, index) => (_jsx(SummaryCard, { ...card }, index))) }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [_jsx(SummaryCard, { title: "Utilization Rate", value: `${(analyticsData?.utilizationRate || 0).toFixed(1)}%`, icon: BarChart3, color: "blue" }), _jsx(SummaryCard, { title: "Avg Rental Duration", value: `${(analyticsData?.averageRentalDuration || 0).toFixed(1)} days`, icon: Calendar, color: "green" }), _jsx(SummaryCard, { title: "Customer Satisfaction", value: `${(analyticsData?.customerSatisfaction || 0).toFixed(1)}/5`, icon: Star, color: "yellow" }), _jsx(SummaryCard, { title: "Revenue per Car", value: `$${(analyticsData?.revenuePerCar || 0).toLocaleString()}`, icon: DollarSign, color: "purple" })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsx(ChartCard, { title: "Bookings & Revenue Trend", children: _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(LineChart, { data: analyticsData?.bookingsTrend || [], children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", className: "opacity-30" }), _jsx(XAxis, { dataKey: "period", className: "text-xs", tick: { fill: 'currentColor' } }), _jsx(YAxis, { yAxisId: "bookings", orientation: "left", className: "text-xs", tick: { fill: 'currentColor' } }), _jsx(YAxis, { yAxisId: "revenue", orientation: "right", className: "text-xs", tick: { fill: 'currentColor' } }), _jsx(Tooltip, { contentStyle: {
                                            backgroundColor: 'var(--tooltip-bg)',
                                            border: '1px solid var(--tooltip-border)',
                                            borderRadius: '8px',
                                        } }), _jsx(Legend, {}), _jsx(Bar, { yAxisId: "bookings", dataKey: "bookings", fill: COLORS.primary, name: "Bookings", radius: [4, 4, 0, 0] }), _jsx(Line, { yAxisId: "revenue", type: "monotone", dataKey: "revenue", stroke: COLORS.secondary, strokeWidth: 3, name: "Revenue ($)", dot: { fill: COLORS.secondary, strokeWidth: 2, r: 4 } })] }) }) }), _jsx(ChartCard, { title: "Booking Status Distribution", children: _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: analyticsData?.bookingStatusDistribution || [], cx: "50%", cy: "50%", labelLine: false, label: ({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`, outerRadius: 80, fill: "#8884d8", dataKey: "count", children: (analyticsData?.bookingStatusDistribution || []).map((entry, index) => (_jsx(Cell, { fill: CHART_COLORS[index % CHART_COLORS.length] }, `cell-${index}`))) }), _jsx(Tooltip, {})] }) }) })] }), _jsx(ChartCard, { title: "Top Rented Cars", children: _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(BarChart, { data: analyticsData?.topRentedCars?.slice(0, 8) || [], children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", className: "opacity-30" }), _jsx(XAxis, { dataKey: "carName", className: "text-xs", tick: { fill: 'currentColor' }, angle: -45, textAnchor: "end", height: 80 }), _jsx(YAxis, { yAxisId: "count", orientation: "left", className: "text-xs", tick: { fill: 'currentColor' } }), _jsx(YAxis, { yAxisId: "revenue", orientation: "right", className: "text-xs", tick: { fill: 'currentColor' } }), _jsx(Tooltip, { contentStyle: {
                                    backgroundColor: 'var(--tooltip-bg)',
                                    border: '1px solid var(--tooltip-border)',
                                    borderRadius: '8px',
                                } }), _jsx(Legend, {}), _jsx(Bar, { yAxisId: "count", dataKey: "rentalCount", fill: COLORS.accent, name: "Rental Count", radius: [4, 4, 0, 0] }), _jsx(Bar, { yAxisId: "revenue", dataKey: "totalRevenue", fill: COLORS.purple, name: "Revenue ($)", radius: [4, 4, 0, 0] })] }) }) }), _jsx(ChartCard, { title: "Recent Bookings", children: _jsxs("div", { className: "overflow-x-auto", children: [_jsxs("table", { className: "w-full text-sm text-left", children: [_jsx("thead", { className: "text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3", children: "Booking ID" }), _jsx("th", { className: "px-6 py-3", children: "Customer" }), _jsx("th", { className: "px-6 py-3", children: "Car" }), _jsx("th", { className: "px-6 py-3", children: "Period" }), _jsx("th", { className: "px-6 py-3", children: "Amount" }), _jsx("th", { className: "px-6 py-3", children: "Status" })] }) }), _jsx("tbody", { children: (analyticsData?.recentBookings || []).slice(0, 10).map((booking) => (_jsxs("tr", { className: "bg-white dark:bg-gray-800 border-b dark:border-gray-700", children: [_jsxs("td", { className: "px-6 py-4 font-medium text-gray-900 dark:text-white", children: ["#", booking.id.toString().padStart(4, '0')] }), _jsx("td", { className: "px-6 py-4", children: _jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-900 dark:text-white", children: booking.customerName }), _jsx("div", { className: "text-gray-500 dark:text-gray-400 text-xs", children: booking.customerEmail })] }) }), _jsx("td", { className: "px-6 py-4 text-gray-900 dark:text-white", children: booking.carName }), _jsx("td", { className: "px-6 py-4 text-gray-900 dark:text-white", children: _jsxs("div", { className: "text-sm", children: [new Date(booking.startDate).toLocaleDateString(), " -", new Date(booking.endDate).toLocaleDateString()] }) }), _jsxs("td", { className: "px-6 py-4 font-medium text-gray-900 dark:text-white", children: ["$", booking.totalAmount.toLocaleString()] }), _jsx("td", { className: "px-6 py-4", children: _jsx("span", { className: `px-2 py-1 text-xs font-medium rounded-full ${booking.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                                                        booking.status === 'active' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                                                            booking.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                                                                'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'}`, children: booking.status.replace('_', ' ').toUpperCase() }) })] }, booking.id))) })] }), (!analyticsData?.recentBookings || analyticsData.recentBookings.length === 0) && (_jsx("div", { className: "text-center py-8 text-gray-500 dark:text-gray-400", children: "No recent bookings found" }))] }) })] }));
};
export default Analytics;
