import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { FaSort, FaSortUp, FaSortDown, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
const DataTable = ({ columns, data, title, onEdit, onDelete, onView, actions = true, pagination = true, itemsPerPage = 10, searchable = true, }) => {
    const [sortConfig, setSortConfig] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    // Sorting logic
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };
    const sortedData = React.useMemo(() => {
        if (!sortConfig)
            return data;
        return [...data].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }, [data, sortConfig]);
    // Search logic
    const filteredData = React.useMemo(() => {
        if (!searchTerm)
            return sortedData;
        return sortedData.filter(item => Object.keys(item).some(key => String(item[key]).toLowerCase().includes(searchTerm.toLowerCase())));
    }, [sortedData, searchTerm]);
    // Pagination logic
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = React.useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredData, currentPage, itemsPerPage]);
    const getSortIcon = (columnKey) => {
        if (!sortConfig || sortConfig.key !== columnKey) {
            return _jsx(FaSort, { className: "ml-1 text-gray-400" });
        }
        return sortConfig.direction === 'asc' ? (_jsx(FaSortUp, { className: "ml-1 text-blue-600" })) : (_jsx(FaSortDown, { className: "ml-1 text-blue-600" }));
    };
    return (_jsxs("div", { className: "bg-white rounded-lg shadow-md overflow-hidden", children: [_jsxs("div", { className: "p-4 border-b border-gray-200", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-800", children: title }), searchable && (_jsx("div", { className: "mt-2", children: _jsx("input", { type: "text", placeholder: "Search...", className: "w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value) }) }))] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [columns.map((column) => (_jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: column.sortable ? (_jsxs("button", { className: "flex items-center focus:outline-none", onClick: () => handleSort(column.key), children: [column.header, getSortIcon(column.key)] })) : (column.header) }, column.key))), actions && (onEdit || onDelete || onView) && (_jsx("th", { scope: "col", className: "px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Actions" }))] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: paginatedData.length > 0 ? (paginatedData.map((item, index) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [columns.map((column) => (_jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: column.render ? column.render(item[column.key], item) : item[column.key] }, column.key))), actions && (onEdit || onDelete || onView) && (_jsx("td", { className: "px-6 py-4 whitespace-nowrap text-right text-sm font-medium", children: _jsxs("div", { className: "flex justify-end space-x-2", children: [onView && (_jsx("button", { onClick: () => onView(item), className: "text-blue-600 hover:text-blue-900", children: _jsx(FaEye, {}) })), onEdit && (_jsx("button", { onClick: () => onEdit(item), className: "text-indigo-600 hover:text-indigo-900", children: _jsx(FaEdit, {}) })), onDelete && (_jsx("button", { onClick: () => onDelete(item), className: "text-red-600 hover:text-red-900", children: _jsx(FaTrash, {}) }))] }) }))] }, index)))) : (_jsx("tr", { children: _jsx("td", { colSpan: columns.length + (actions ? 1 : 0), className: "px-6 py-4 text-center text-sm text-gray-500", children: "No data available" }) })) })] }) }), pagination && totalPages > 1 && (_jsxs("div", { className: "px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6", children: [_jsxs("div", { className: "flex-1 flex justify-between sm:hidden", children: [_jsx("button", { onClick: () => setCurrentPage(prev => Math.max(prev - 1, 1)), disabled: currentPage === 1, className: `relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === 1
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'}`, children: "Previous" }), _jsx("button", { onClick: () => setCurrentPage(prev => Math.min(prev + 1, totalPages)), disabled: currentPage === totalPages, className: `ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === totalPages
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'}`, children: "Next" })] }), _jsxs("div", { className: "hidden sm:flex-1 sm:flex sm:items-center sm:justify-between", children: [_jsx("div", { children: _jsxs("p", { className: "text-sm text-gray-700", children: ["Showing ", _jsx("span", { className: "font-medium", children: (currentPage - 1) * itemsPerPage + 1 }), " to", ' ', _jsx("span", { className: "font-medium", children: Math.min(currentPage * itemsPerPage, filteredData.length) }), ' ', "of ", _jsx("span", { className: "font-medium", children: filteredData.length }), " results"] }) }), _jsx("div", { children: _jsxs("nav", { className: "relative z-0 inline-flex rounded-md shadow-sm -space-x-px", "aria-label": "Pagination", children: [_jsx("button", { onClick: () => setCurrentPage(1), disabled: currentPage === 1, className: `relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1
                                                ? 'text-gray-300 cursor-not-allowed'
                                                : 'text-gray-500 hover:bg-gray-50'}`, children: "First" }), _jsx("button", { onClick: () => setCurrentPage(prev => Math.max(prev - 1, 1)), disabled: currentPage === 1, className: `relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${currentPage === 1
                                                ? 'text-gray-300 cursor-not-allowed'
                                                : 'text-gray-500 hover:bg-gray-50'}`, children: "Previous" }), [...Array(totalPages)].map((_, i) => {
                                            const pageNumber = i + 1;
                                            // Show current page, and 1 page before and after
                                            if (pageNumber === 1 ||
                                                pageNumber === totalPages ||
                                                (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)) {
                                                return (_jsx("button", { onClick: () => setCurrentPage(pageNumber), className: `relative inline-flex items-center px-4 py-2 border ${currentPage === pageNumber
                                                        ? 'bg-blue-50 border-blue-500 text-blue-600 z-10'
                                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'} text-sm font-medium`, children: pageNumber }, pageNumber));
                                            }
                                            // Show ellipsis
                                            if ((pageNumber === 2 && currentPage > 3) ||
                                                (pageNumber === totalPages - 1 && currentPage < totalPages - 2)) {
                                                return (_jsx("span", { className: "relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700", children: "..." }, pageNumber));
                                            }
                                            return null;
                                        }), _jsx("button", { onClick: () => setCurrentPage(prev => Math.min(prev + 1, totalPages)), disabled: currentPage === totalPages, className: `relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages
                                                ? 'text-gray-300 cursor-not-allowed'
                                                : 'text-gray-500 hover:bg-gray-50'}`, children: "Next" }), _jsx("button", { onClick: () => setCurrentPage(totalPages), disabled: currentPage === totalPages, className: `relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages
                                                ? 'text-gray-300 cursor-not-allowed'
                                                : 'text-gray-500 hover:bg-gray-50'}`, children: "Last" })] }) })] })] }))] }));
};
export default DataTable;
