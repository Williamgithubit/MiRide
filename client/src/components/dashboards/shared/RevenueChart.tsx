import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface RevenueData {
  name: string;
  revenue: number;
  bookings: number;
}

interface RevenueChartProps {
  data: RevenueData[];
  title: string;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data, title }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" orientation="left" stroke="#104911" />
            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
            <Tooltip
              formatter={(value, name) => {
                if (name === "revenue") {
                  return [`$${value}`, "Revenue"];
                }
                return [value, "Bookings"];
              }}
            />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="revenue"
              name="Revenue ($)"
              fill="#104911"
            />
            <Bar
              yAxisId="right"
              dataKey="bookings"
              name="Bookings"
              fill="#82ca9d"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;
