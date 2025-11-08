import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from "react";
import { ChevronUp, ChevronDown, Search, Filter } from "lucide-react";
const Table = ({ columns, data, searchable = false, filterable = false, pagination = true, pageSize = 10, className = "", loading = false, }) => {
    const [sortConfig, setSortConfig] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    // Sorting logic
    const sortedData = React.useMemo(() => {
        if (!Array.isArray(data))
            return [];
        let sortableData = [...data];
        if (sortConfig !== null) {
            sortableData.sort((a, b) => {
                const aValue = a?.[sortConfig.key];
                const bValue = b?.[sortConfig.key];
                if (aValue == null && bValue == null)
                    return 0;
                if (aValue == null)
                    return 1;
                if (bValue == null)
                    return -1;
                if (aValue < bValue) {
                    return sortConfig.direction === "asc" ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === "asc" ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableData;
    }, [data, sortConfig]);
    // Search logic
    const filteredData = React.useMemo(() => {
        if (!searchTerm)
            return sortedData;
        return sortedData.filter((row) => columns.some((column) => {
            const value = row?.[column.key];
            return (value != null &&
                String(value).toLowerCase().includes(searchTerm.toLowerCase()));
        }));
    }, [sortedData, searchTerm, columns]);
    // Pagination logic
    const paginatedData = React.useMemo(() => {
        if (!pagination)
            return filteredData;
        const startIndex = (currentPage - 1) * pageSize;
        return filteredData.slice(startIndex, startIndex + pageSize);
    }, [filteredData, currentPage, pageSize, pagination]);
    const totalPages = Math.ceil(filteredData.length / pageSize);
    const handleSort = (key) => {
        let direction = "asc";
        if (sortConfig &&
            sortConfig.key === key &&
            sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };
    const getSortIcon = (columnKey) => {
        if (!sortConfig || sortConfig.key !== columnKey) {
            return _jsx(ChevronUp, { className: "w-4 h-4 text-gray-400" });
        }
        return sortConfig.direction === "asc" ? (_jsx(ChevronUp, { className: "w-4 h-4 text-blue-600" })) : (_jsx(ChevronDown, { className: "w-4 h-4 text-blue-600" }));
    };
    if (loading) {
        return (_jsx("div", { className: "flex justify-center items-center p-12", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" }) }));
    }
    return (_jsxs("div", { className: `bg-white dark:bg-gray-800 rounded-lg shadow-md ${className}`, children: [(searchable || filterable) && (_jsx("div", { className: "p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700", children: _jsxs("div", { className: "flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4", children: [searchable && (_jsxs("div", { className: "relative flex-1", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" }), _jsx("input", { type: "text", placeholder: "Search...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" })] })), filterable && (_jsxs("button", { className: "flex items-center justify-center px-4 py-2 text-sm text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 whitespace-nowrap", children: [_jsx(Filter, { className: "w-4 h-4 mr-2" }), "Filter"] }))] }) })), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-gray-50 dark:bg-gray-700", children: _jsx("tr", { children: columns.map((column) => (_jsx("th", { className: `px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${column.sortable
                                        ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                                        : ""}`, onClick: () => column.sortable && handleSort(column.key), children: _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx("span", { children: column.label }), column.sortable && getSortIcon(column.key)] }) }, column.key))) }) }), _jsx("tbody", { className: "bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700", children: paginatedData.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: columns.length, className: "px-6 py-8 text-center text-gray-500 dark:text-gray-400", children: "No data available" }) })) : (paginatedData.map((row, index) => (_jsx("tr", { className: "hover:bg-gray-50 dark:hover:bg-gray-700", children: columns.map((column) => (_jsx("td", { className: "px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white", children: column.render
                                        ? column.render(row?.[column.key], row)
                                        : row?.[column.key] || "-" }, column.key))) }, row?.id || index)))) })] }) }), pagination && totalPages > 1 && (_jsxs("div", { className: "px-3 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 dark:border-gray-700", children: [_jsxs("div", { className: "text-sm text-gray-700 dark:text-gray-300 order-2 sm:order-1", children: ["Showing ", (currentPage - 1) * pageSize + 1, " to", " ", Math.min(currentPage * pageSize, filteredData.length), " of", " ", filteredData.length, " results"] }), _jsxs("div", { className: "flex items-center space-x-1 sm:space-x-2 order-1 sm:order-2", children: [_jsxs("button", { onClick: () => setCurrentPage((prev) => Math.max(prev - 1, 1)), disabled: currentPage === 1, className: "px-2 sm:px-3 py-1 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700", children: [_jsx("span", { className: "hidden sm:inline", children: "Previous" }), _jsx("span", { className: "sm:hidden", children: "Prev" })] }), Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                let page;
                                if (totalPages <= 5) {
                                    page = i + 1;
                                }
                                else if (currentPage <= 3) {
                                    page = i + 1;
                                }
                                else if (currentPage >= totalPages - 2) {
                                    page = totalPages - 4 + i;
                                }
                                else {
                                    page = currentPage - 2 + i;
                                }
                                return (_jsx("button", { onClick: () => setCurrentPage(page), className: `px-2 sm:px-3 py-1 text-xs sm:text-sm border rounded-md ${currentPage === page
                                        ? "bg-blue-600 text-white border-blue-600"
                                        : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"}`, children: page }, page));
                            }), _jsxs("button", { onClick: () => setCurrentPage((prev) => Math.min(prev + 1, totalPages)), disabled: currentPage === totalPages, className: "px-2 sm:px-3 py-1 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700", children: [_jsx("span", { className: "hidden sm:inline", children: "Next" }), _jsx("span", { className: "sm:hidden", children: "Next" })] })] })] }))] }));
};
export default Table;
