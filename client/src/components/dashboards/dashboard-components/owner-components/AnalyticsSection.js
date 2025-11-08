import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { TrendingUp, Calendar, DollarSign } from "lucide-react";
import DashboardCard from "../../shared/DashboardCard";
import Chart from "../../shared/Chart";
const AnalyticsSection = ({ avgRating, totalEarnings, ownerCars, }) => {
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [_jsx(DashboardCard, { title: "Utilization Rate", value: "78%", icon: TrendingUp, change: { value: 5.2, type: "increase" } }), _jsx(DashboardCard, { title: "Avg Rental Duration", value: "4.2 days", icon: Calendar }), _jsx(DashboardCard, { title: "Customer Satisfaction", value: `${avgRating.toFixed(1)}/5`, icon: TrendingUp }), _jsx(DashboardCard, { title: "Revenue per Car", value: `$${Math.round(totalEarnings / ownerCars.length)}`, icon: DollarSign })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsx(Chart, { type: "line", data: {
                            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                            datasets: [
                                {
                                    label: "Utilization Rate (%)",
                                    data: [65, 72, 78, 75, 82, 78],
                                    borderColor: "rgb(34, 197, 94)",
                                    backgroundColor: "rgba(34, 197, 94, 0.1)",
                                },
                            ],
                        }, options: {
                            plugins: {
                                title: { display: true, text: "Car Utilization Trends" },
                            },
                        } }), _jsx(Chart, { type: "bar", data: {
                            labels: ownerCars.map((car) => `${car.brand} ${car.model}`),
                            datasets: [
                                {
                                    label: "Rentals",
                                    data: ownerCars.map((car) => car.totalRentals || 0),
                                    backgroundColor: "rgba(59, 130, 246, 0.8)",
                                },
                            ],
                        }, options: {
                            plugins: { title: { display: true, text: "Rentals by Car" } },
                        } })] })] }));
};
export default AnalyticsSection;
