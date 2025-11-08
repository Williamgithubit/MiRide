import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CreditCard, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import DashboardCard from '../../shared/DashboardCard';
import { useCustomerData } from './useCustomerData';
const CustomerPayments = () => {
    const { totalSpent, totalBookings, customerRentals } = useCustomerData();
    // Filter rentals with payment information and sort by date
    const paymentsData = (customerRentals || [])
        .filter(rental => rental.paymentStatus) // Only show rentals with payment status
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const getPaymentStatusConfig = (status) => {
        switch (status) {
            case 'paid':
                return {
                    color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
                    icon: CheckCircle,
                    label: 'Paid'
                };
            case 'pending':
                return {
                    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
                    icon: Clock,
                    label: 'Pending'
                };
            case 'failed':
                return {
                    color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
                    icon: XCircle,
                    label: 'Failed'
                };
            case 'refunded':
                return {
                    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
                    icon: CheckCircle,
                    label: 'Refunded'
                };
            default:
                return {
                    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
                    icon: Clock,
                    label: 'Unknown'
                };
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsx(DashboardCard, { title: "Total Spent", value: `$${(Number(totalSpent) || 0).toFixed(2)}`, icon: CreditCard }), _jsx(DashboardCard, { title: "Average per Booking", value: `$${totalBookings > 0 ? ((Number(totalSpent) || 0) / totalBookings).toFixed(2) : '0.00'}`, icon: CreditCard })] }), _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-md p-6", children: [_jsx("h4", { className: "text-lg font-semibold mb-4 text-gray-900 dark:text-white", children: "Payment History" }), paymentsData.length > 0 ? (_jsx("div", { className: "space-y-4", children: paymentsData.map(rental => {
                            const paymentConfig = getPaymentStatusConfig(rental.paymentStatus || 'pending');
                            const PaymentIcon = paymentConfig.icon;
                            const carName = rental.car
                                ? `${rental.car.year} ${rental.car.brand} ${rental.car.model}`
                                : 'N/A';
                            return (_jsxs("div", { className: "flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsxs("p", { className: "font-medium text-gray-900 dark:text-white", children: ["Booking #", rental.id.toString().padStart(4, '0')] }), _jsxs("span", { className: `inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${paymentConfig.color}`, children: [_jsx(PaymentIcon, { className: "w-3 h-3" }), paymentConfig.label] })] }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-300", children: carName }), _jsxs("div", { className: "flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1", children: [_jsx(Calendar, { className: "w-3 h-3" }), _jsxs("span", { children: [new Date(rental.startDate).toLocaleDateString(), " - ", new Date(rental.endDate).toLocaleDateString()] })] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("p", { className: "font-semibold text-lg text-gray-900 dark:text-white", children: ["$", (Number(rental.totalAmount) || Number(rental.totalCost) || 0).toFixed(2)] }), _jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: new Date(rental.createdAt).toLocaleDateString() })] })] }, rental.id));
                        }) })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(CreditCard, { className: "w-12 h-12 text-gray-400 mx-auto mb-3" }), _jsx("p", { className: "text-gray-500 dark:text-gray-400", children: "No payment records found" }), _jsx("p", { className: "text-sm text-gray-400 dark:text-gray-500 mt-1", children: "Your payment history will appear here once you make bookings" })] }))] })] }));
};
export default CustomerPayments;
