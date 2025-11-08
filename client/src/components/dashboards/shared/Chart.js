import { jsx as _jsx } from "react/jsx-runtime";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);
const Chart = ({ type, data, options = {}, className = '' }) => {
    const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: 'rgb(107, 114, 128)', // gray-500
                    usePointStyle: true,
                },
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: 'white',
                bodyColor: 'white',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
            },
        },
        scales: type !== 'doughnut' ? {
            x: {
                grid: {
                    color: 'rgba(107, 114, 128, 0.1)',
                },
                ticks: {
                    color: 'rgb(107, 114, 128)',
                },
            },
            y: {
                grid: {
                    color: 'rgba(107, 114, 128, 0.1)',
                },
                ticks: {
                    color: 'rgb(107, 114, 128)',
                },
            },
        } : undefined,
        ...options,
    };
    const renderChart = () => {
        switch (type) {
            case 'line':
                return _jsx(Line, { data: data, options: defaultOptions });
            case 'bar':
                return _jsx(Bar, { data: data, options: defaultOptions });
            case 'doughnut':
                return _jsx(Doughnut, { data: data, options: defaultOptions });
            default:
                return null;
        }
    };
    return (_jsx("div", { className: `bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 ${className}`, children: _jsx("div", { className: "h-48 sm:h-64 w-full", children: renderChart() }) }));
};
export default Chart;
