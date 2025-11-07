import React from "react";
import { TrendingUp, Calendar, DollarSign } from "lucide-react";
import DashboardCard from "../../shared/DashboardCard";
import Chart from "../../shared/Chart";
import { Car } from "../../../../types";

interface AnalyticsSectionProps {
  avgRating: number;
  totalEarnings: number;
  ownerCars: Car[];
}

type CarWithStats = Car & { totalRentals?: number };

const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({
  avgRating,
  totalEarnings,
  ownerCars,
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Utilization Rate"
          value="78%"
          icon={TrendingUp}
          change={{ value: 5.2, type: "increase" }}
        />
        <DashboardCard
          title="Avg Rental Duration"
          value="4.2 days"
          icon={Calendar}
        />
        <DashboardCard
          title="Customer Satisfaction"
          value={`${avgRating.toFixed(1)}/5`}
          icon={TrendingUp}
        />
        <DashboardCard
          title="Revenue per Car"
          value={`$${Math.round(totalEarnings / ownerCars.length)}`}
          icon={DollarSign}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Chart
          type="line"
          data={{
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            datasets: [
              {
                label: "Utilization Rate (%)",
                data: [65, 72, 78, 75, 82, 78],
                borderColor: "rgb(34, 197, 94)",
                backgroundColor: "rgba(34, 197, 94, 0.1)",
              },
            ],
          }}
          options={{
            plugins: {
              title: { display: true, text: "Car Utilization Trends" },
            },
          }}
        />
        <Chart
          type="bar"
          data={{
            labels: ownerCars.map((car) => `${car.brand} ${car.model}`),
            datasets: [
              {
                label: "Rentals",
                data: ownerCars.map(
                  (car) => (car as CarWithStats).totalRentals || 0
                ),
                backgroundColor: "rgba(59, 130, 246, 0.8)",
              },
            ],
          }}
          options={{
            plugins: { title: { display: true, text: "Rentals by Car" } },
          }}
        />
      </div>
    </div>
  );
};

export default AnalyticsSection;
