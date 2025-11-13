import React from "react";
import { Plus } from "lucide-react";
import Table, { Column } from "../../shared/Table";
import { Car } from "../../../../store/Car/carApi";
import ActiveRentalsSection from "./ActiveRentalsSection";

interface CarListingsSectionProps {
  carColumns: Column[];
  ownerCars: Car[];
  onAddCarClick: () => void;
}

const CarListingsSection: React.FC<CarListingsSectionProps> = ({
  carColumns,
  ownerCars,
  onAddCarClick,
}) => {
  // Ensure data is properly formatted and not null/undefined
  const safeCarColumns: Column[] = Array.isArray(carColumns)
    ? (carColumns as Column[])
    : [];
  const safeOwnerCars: Car[] = Array.isArray(ownerCars)
    ? (ownerCars as Car[])
    : [];

  return (
    <div className="space-y-8">
      {/* Active Rentals Section */}
      <ActiveRentalsSection />

      {/* Car Listings Section */}
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            My Car Listings
          </h3>
          <button
            onClick={onAddCarClick}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Add New Car</span>
            <span className="sm:hidden">Add Car</span>
          </button>
        </div>
        {safeOwnerCars.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No cars listed yet. Add your first car to get started!</p>
          </div>
        ) : (
          <Table
            columns={safeCarColumns}
            data={safeOwnerCars}
            searchable
            filterable
          />
        )}
      </div>
    </div>
  );
};

export default CarListingsSection;
