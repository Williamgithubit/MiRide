import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Plus } from "lucide-react";
import Table from "../../shared/Table";
const CarListingsSection = ({ carColumns, ownerCars, onAddCarClick, }) => {
    // Ensure data is properly formatted and not null/undefined
    const safeCarColumns = Array.isArray(carColumns)
        ? carColumns
        : [];
    const safeOwnerCars = Array.isArray(ownerCars)
        ? ownerCars
        : [];
    return (_jsxs("div", { className: "space-y-4 sm:space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: "My Car Listings" }), _jsxs("button", { onClick: onAddCarClick, className: "flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base", children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), _jsx("span", { className: "hidden sm:inline", children: "Add New Car" }), _jsx("span", { className: "sm:hidden", children: "Add Car" })] })] }), safeOwnerCars.length === 0 ? (_jsx("div", { className: "text-center py-8 text-gray-500 dark:text-gray-400", children: _jsx("p", { children: "No cars listed yet. Add your first car to get started!" }) })) : (_jsx(Table, { columns: safeCarColumns, data: safeOwnerCars, searchable: true, filterable: true }))] }));
};
export default CarListingsSection;
