import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Eye, Edit, Trash2, Search, UserPlus, MoreHorizontal, CheckSquare, Square, UserCheck, UserX, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useGetUsersQuery, useUpdateUserMutation, useDeleteUserMutation, useToggleUserStatusMutation, useBulkUserActionMutation, useGetUserStatsQuery, useCreateUserMutation } from '../../../../store/User/userManagementApi';
const UserManagement = () => {
    // State management
    const [filters, setFilters] = useState({
        search: '',
        role: 'all',
        status: 'all',
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc'
    });
    const [searchInput, setSearchInput] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [showDetailsModal, setShowDetailsModal] = useState(null);
    const [showEditModal, setShowEditModal] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(null);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [newUserData, setNewUserData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'customer',
        phone: '',
        isActive: true
    });
    const [editUserData, setEditUserData] = useState({});
    // API queries and mutations
    const { data: usersData, isLoading, error, refetch } = useGetUsersQuery(filters);
    const { data: userStats } = useGetUserStatsQuery();
    const [createUser] = useCreateUserMutation();
    const [updateUser] = useUpdateUserMutation();
    const [deleteUser] = useDeleteUserMutation();
    const [toggleUserStatus] = useToggleUserStatusMutation();
    const [bulkUserAction] = useBulkUserActionMutation();
    // Debounced search effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [searchInput]);
    // Computed values
    const users = usersData?.users || [];
    const totalPages = usersData?.totalPages || 1;
    const isAllSelected = users.length > 0 && selectedUsers.length === users.length;
    const isSomeSelected = selectedUsers.length > 0 && selectedUsers.length < users.length;
    // Handlers
    const handleSearch = (value) => {
        setSearchInput(value);
    };
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    };
    const handleSort = (sortBy) => {
        setFilters(prev => ({
            ...prev,
            sortBy: sortBy,
            sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc'
        }));
    };
    const handleSelectAll = () => {
        if (isAllSelected) {
            setSelectedUsers([]);
        }
        else {
            setSelectedUsers(users.map(user => user.id));
        }
    };
    const handleSelectUser = (userId) => {
        setSelectedUsers(prev => prev.includes(userId)
            ? prev.filter(id => id !== userId)
            : [...prev, userId]);
    };
    const handleToggleStatus = async (user) => {
        try {
            await toggleUserStatus({ userId: user.id, isActive: !user.isActive }).unwrap();
            toast.success(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`);
        }
        catch (error) {
            toast.error('Failed to update user status');
        }
    };
    const handleDeleteUser = async (userId) => {
        try {
            await deleteUser(userId).unwrap();
            toast.success('User deleted successfully');
            setShowDeleteModal(null);
            setSelectedUsers(prev => prev.filter(id => id !== userId));
        }
        catch (error) {
            toast.error('Failed to delete user');
        }
    };
    const handleBulkAction = async (action) => {
        try {
            const result = await bulkUserAction({ userIds: selectedUsers, action }).unwrap();
            toast.success(`${result.affectedCount} users ${action}d successfully`);
            setSelectedUsers([]);
            setShowBulkModal(false);
        }
        catch (error) {
            toast.error(`Failed to ${action} users`);
        }
    };
    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await createUser(newUserData).unwrap();
            toast.success('User created successfully');
            setShowAddUserModal(false);
            setNewUserData({
                name: '',
                email: '',
                password: '',
                role: 'customer',
                phone: '',
                isActive: true
            });
        }
        catch (error) {
            toast.error(error?.data?.message || 'Failed to create user');
        }
    };
    const handleEditUser = async (e) => {
        e.preventDefault();
        if (!showEditModal)
            return;
        try {
            await updateUser({ userId: showEditModal.id, data: editUserData }).unwrap();
            toast.success('User updated successfully');
            setShowEditModal(null);
            setEditUserData({});
        }
        catch (error) {
            toast.error(error?.data?.message || 'Failed to update user');
        }
    };
    const openEditModal = (user) => {
        setShowEditModal(user);
        setEditUserData({
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone || '',
            isActive: user.isActive
        });
    };
    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'owner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'customer': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    };
    const getStatusBadgeColor = (isActive) => {
        return isActive
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    };
    const getSortIcon = (column) => {
        if (filters.sortBy !== column)
            return _jsx(ArrowUpDown, { className: "w-4 h-4" });
        return filters.sortOrder === 'asc'
            ? _jsx(ArrowUp, { className: "w-4 h-4" })
            : _jsx(ArrowDown, { className: "w-4 h-4" });
    };
    if (error) {
        return (_jsxs("div", { className: "text-center py-8", children: [_jsx("p", { className: "text-red-600 dark:text-red-400", children: "Error loading users. Please try again." }), _jsx("button", { onClick: () => refetch(), className: "mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700", children: "Retry" })] }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: "User Management" }), _jsx("p", { className: "text-gray-600 dark:text-gray-400", children: "Manage system users and their permissions" })] }), _jsxs("button", { onClick: () => setShowAddUserModal(true), className: "flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors", children: [_jsx(UserPlus, { className: "w-4 h-4" }), "Add New User"] })] }), userStats && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx("div", { className: "bg-white dark:bg-gray-800 p-4 rounded-lg shadow", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Total Users" }), _jsx("p", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: userStats.totalUsers })] }), _jsx("div", { className: "p-2 bg-blue-100 dark:bg-blue-900 rounded-lg", children: _jsx(Eye, { className: "w-6 h-6 text-blue-600 dark:text-blue-400" }) })] }) }), _jsx("div", { className: "bg-white dark:bg-gray-800 p-4 rounded-lg shadow", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Active Users" }), _jsx("p", { className: "text-2xl font-bold text-green-600 dark:text-green-400", children: userStats.activeUsers })] }), _jsx("div", { className: "p-2 bg-green-100 dark:bg-green-900 rounded-lg", children: _jsx(UserCheck, { className: "w-6 h-6 text-green-600 dark:text-green-400" }) })] }) }), _jsx("div", { className: "bg-white dark:bg-gray-800 p-4 rounded-lg shadow", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Inactive Users" }), _jsx("p", { className: "text-2xl font-bold text-red-600 dark:text-red-400", children: userStats.inactiveUsers })] }), _jsx("div", { className: "p-2 bg-red-100 dark:bg-red-900 rounded-lg", children: _jsx(UserX, { className: "w-6 h-6 text-red-600 dark:text-red-400" }) })] }) }), _jsx("div", { className: "bg-white dark:bg-gray-800 p-4 rounded-lg shadow", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "New This Month" }), _jsx("p", { className: "text-2xl font-bold text-purple-600 dark:text-purple-400", children: userStats.newUsersThisMonth })] }), _jsx("div", { className: "p-2 bg-purple-100 dark:bg-purple-900 rounded-lg", children: _jsx(UserPlus, { className: "w-6 h-6 text-purple-600 dark:text-purple-400" }) })] }) })] })), _jsxs("div", { className: "bg-white dark:bg-gray-800 p-4 rounded-lg shadow", children: [_jsxs("div", { className: "flex flex-col lg:flex-row gap-4", children: [_jsx("div", { className: "flex-1", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" }), _jsx("input", { type: "text", placeholder: "Search users by name or email...", value: searchInput, onChange: (e) => handleSearch(e.target.value), className: "w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" })] }) }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("select", { value: filters.role, onChange: (e) => handleFilterChange('role', e.target.value), className: "px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white", children: [_jsx("option", { value: "all", children: "All Roles" }), _jsx("option", { value: "admin", children: "Admin" }), _jsx("option", { value: "owner", children: "Owner" }), _jsx("option", { value: "customer", children: "Customer" })] }), _jsxs("select", { value: filters.status, onChange: (e) => handleFilterChange('status', e.target.value), className: "px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white", children: [_jsx("option", { value: "all", children: "All Status" }), _jsx("option", { value: "active", children: "Active" }), _jsx("option", { value: "inactive", children: "Inactive" })] })] })] }), selectedUsers.length > 0 && (_jsx("div", { className: "mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("span", { className: "text-sm text-blue-700 dark:text-blue-300", children: [selectedUsers.length, " user(s) selected"] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => setShowBulkModal(true), className: "px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700", children: "Bulk Actions" }), _jsx("button", { onClick: () => setSelectedUsers([]), className: "px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700", children: "Clear Selection" })] })] }) }))] }), _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden", children: [isLoading ? (_jsxs("div", { className: "p-8 text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" }), _jsx("p", { className: "mt-2 text-gray-600 dark:text-gray-400", children: "Loading users..." })] })) : users.length === 0 ? (_jsx("div", { className: "p-8 text-center", children: _jsx("p", { className: "text-gray-600 dark:text-gray-400", children: "No users found" }) })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "hidden md:block overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-gray-50 dark:bg-gray-700", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-3 text-left", children: _jsx("button", { onClick: handleSelectAll, className: "flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white", children: isAllSelected ? (_jsx(CheckSquare, { className: "w-4 h-4" })) : isSomeSelected ? (_jsx(Square, { className: "w-4 h-4 bg-blue-600" })) : (_jsx(Square, { className: "w-4 h-4" })) }) }), _jsx("th", { className: "px-4 py-3 text-left", children: _jsxs("button", { onClick: () => handleSort('name'), className: "flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200", children: ["Name ", getSortIcon('name')] }) }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Email" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Role" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Status" }), _jsx("th", { className: "px-4 py-3 text-left", children: _jsxs("button", { onClick: () => handleSort('createdAt'), className: "flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200", children: ["Join Date ", getSortIcon('createdAt')] }) }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Actions" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-200 dark:divide-gray-600", children: users.map((user) => (_jsxs("tr", { className: "hover:bg-gray-50 dark:hover:bg-gray-700", children: [_jsx("td", { className: "px-4 py-3", children: _jsx("button", { onClick: () => handleSelectUser(user.id), className: "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white", children: selectedUsers.includes(user.id) ? (_jsx(CheckSquare, { className: "w-4 h-4 text-blue-600" })) : (_jsx(Square, { className: "w-4 h-4" })) }) }), _jsx("td", { className: "px-4 py-3", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-sm font-medium text-gray-700 dark:text-gray-300", children: user.name.charAt(0).toUpperCase() }), _jsx("div", { className: "ml-3", children: _jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-white", children: user.name }) })] }) }), _jsx("td", { className: "px-4 py-3 text-sm text-gray-600 dark:text-gray-400", children: user.email }), _jsx("td", { className: "px-4 py-3", children: _jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`, children: user.role.charAt(0).toUpperCase() + user.role.slice(1) }) }), _jsx("td", { className: "px-4 py-3", children: _jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(user.isActive)}`, children: user.isActive ? 'Active' : 'Inactive' }) }), _jsx("td", { className: "px-4 py-3 text-sm text-gray-600 dark:text-gray-400", children: new Date(user.createdAt).toLocaleDateString() }), _jsx("td", { className: "px-4 py-3", children: _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("button", { onClick: () => setShowDetailsModal(user), className: "p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded", title: "View Details", children: _jsx(Eye, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => openEditModal(user), className: "p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded", title: "Edit User", children: _jsx(Edit, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => handleToggleStatus(user), className: `p-1 rounded ${user.isActive
                                                                        ? 'text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900'
                                                                        : 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900'}`, title: user.isActive ? 'Deactivate' : 'Activate', children: user.isActive ? _jsx(UserX, { className: "w-4 h-4" }) : _jsx(UserCheck, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => setShowDeleteModal(user), className: "p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded", title: "Delete User", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }) })] }, user.id))) })] }) }), _jsx("div", { className: "md:hidden space-y-4 p-4", children: users.map((user) => (_jsxs("div", { className: "bg-gray-50 dark:bg-gray-700 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("button", { onClick: () => handleSelectUser(user.id), className: "mr-3 text-gray-600 dark:text-gray-400", children: selectedUsers.includes(user.id) ? (_jsx(CheckSquare, { className: "w-4 h-4 text-blue-600" })) : (_jsx(Square, { className: "w-4 h-4" })) }), _jsx("div", { className: "w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-sm font-medium text-gray-700 dark:text-gray-300", children: user.name.charAt(0).toUpperCase() }), _jsxs("div", { className: "ml-3", children: [_jsx("p", { className: "font-medium text-gray-900 dark:text-white", children: user.name }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: user.email })] })] }), _jsx("button", { className: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300", children: _jsx(MoreHorizontal, { className: "w-5 h-5" }) })] }), _jsxs("div", { className: "mt-3 flex items-center justify-between", children: [_jsxs("div", { className: "flex gap-2", children: [_jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`, children: user.role.charAt(0).toUpperCase() + user.role.slice(1) }), _jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(user.isActive)}`, children: user.isActive ? 'Active' : 'Inactive' })] }), _jsx("span", { className: "text-xs text-gray-500 dark:text-gray-400", children: new Date(user.createdAt).toLocaleDateString() })] }), _jsxs("div", { className: "mt-3 flex justify-end gap-1", children: [_jsx("button", { onClick: () => setShowDetailsModal(user), className: "p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded", children: _jsx(Eye, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => openEditModal(user), className: "p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded", children: _jsx(Edit, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => handleToggleStatus(user), className: `p-2 rounded ${user.isActive
                                                        ? 'text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900'
                                                        : 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900'}`, children: user.isActive ? _jsx(UserX, { className: "w-4 h-4" }) : _jsx(UserCheck, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => setShowDeleteModal(user), className: "p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded", children: _jsx(Trash2, { className: "w-4 h-4" }) })] })] }, user.id))) })] })), totalPages > 1 && (_jsx("div", { className: "px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: ["Page ", filters.page, " of ", totalPages] }), _jsxs("select", { value: filters.limit, onChange: (e) => handleFilterChange('limit', Number(e.target.value)), className: "px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white", children: [_jsx("option", { value: 5, children: "5 per page" }), _jsx("option", { value: 10, children: "10 per page" }), _jsx("option", { value: 25, children: "25 per page" }), _jsx("option", { value: 50, children: "50 per page" })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: () => handleFilterChange('page', Math.max(1, filters.page - 1)), disabled: filters.page === 1, className: "p-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-600", children: _jsx(ChevronLeft, { className: "w-4 h-4" }) }), Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            const pageNum = Math.max(1, Math.min(totalPages - 4, filters.page - 2)) + i;
                                            if (pageNum > totalPages)
                                                return null;
                                            return (_jsx("button", { onClick: () => handleFilterChange('page', pageNum), className: `px-3 py-1 rounded text-sm ${filters.page === pageNum
                                                    ? 'bg-blue-600 text-white'
                                                    : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'}`, children: pageNum }, pageNum));
                                        }), _jsx("button", { onClick: () => handleFilterChange('page', Math.min(totalPages, filters.page + 1)), disabled: filters.page === totalPages, className: "p-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-600", children: _jsx(ChevronRight, { className: "w-4 h-4" }) })] })] }) }))] }), showDetailsModal && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6", children: [_jsx("h3", { className: "text-lg font-semibold mb-4 text-gray-900 dark:text-white", children: "User Details" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Name" }), _jsx("p", { className: "text-gray-900 dark:text-white", children: showDetailsModal.name })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Email" }), _jsx("p", { className: "text-gray-900 dark:text-white", children: showDetailsModal.email })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Role" }), _jsx("p", { className: "text-gray-900 dark:text-white", children: showDetailsModal.role })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Status" }), _jsx("p", { className: "text-gray-900 dark:text-white", children: showDetailsModal.isActive ? 'Active' : 'Inactive' })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Join Date" }), _jsx("p", { className: "text-gray-900 dark:text-white", children: new Date(showDetailsModal.createdAt).toLocaleDateString() })] }), showDetailsModal.lastLogin && (_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Last Login" }), _jsx("p", { className: "text-gray-900 dark:text-white", children: new Date(showDetailsModal.lastLogin).toLocaleDateString() })] }))] }), _jsx("div", { className: "mt-6 flex justify-end", children: _jsx("button", { onClick: () => setShowDetailsModal(null), className: "px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700", children: "Close" }) })] }) })), showDeleteModal && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6", children: [_jsx("h3", { className: "text-lg font-semibold mb-4 text-red-600", children: "Delete User" }), _jsxs("p", { className: "text-gray-600 dark:text-gray-400 mb-6", children: ["Are you sure you want to delete ", _jsx("strong", { children: showDeleteModal.name }), "? This action cannot be undone."] }), _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx("button", { onClick: () => setShowDeleteModal(null), className: "px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700", children: "Cancel" }), _jsx("button", { onClick: () => handleDeleteUser(showDeleteModal.id), className: "px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700", children: "Delete" })] })] }) })), showAddUserModal && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6", children: [_jsx("h3", { className: "text-lg font-semibold mb-4 text-gray-900 dark:text-white", children: "Add New User" }), _jsxs("form", { onSubmit: handleCreateUser, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Name *" }), _jsx("input", { type: "text", required: true, value: newUserData.name, onChange: (e) => setNewUserData(prev => ({ ...prev, name: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Email *" }), _jsx("input", { type: "email", required: true, value: newUserData.email, onChange: (e) => setNewUserData(prev => ({ ...prev, email: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Password *" }), _jsx("input", { type: "password", required: true, value: newUserData.password, onChange: (e) => setNewUserData(prev => ({ ...prev, password: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Phone" }), _jsx("input", { type: "tel", value: newUserData.phone, onChange: (e) => setNewUserData(prev => ({ ...prev, phone: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Role *" }), _jsxs("select", { required: true, value: newUserData.role, onChange: (e) => setNewUserData(prev => ({ ...prev, role: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white", children: [_jsx("option", { value: "customer", children: "Customer" }), _jsx("option", { value: "owner", children: "Owner" }), _jsx("option", { value: "admin", children: "Admin" })] })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", id: "isActive", checked: newUserData.isActive, onChange: (e) => setNewUserData(prev => ({ ...prev, isActive: e.target.checked })), className: "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" }), _jsx("label", { htmlFor: "isActive", className: "ml-2 block text-sm text-gray-700 dark:text-gray-300", children: "Active User" })] }), _jsxs("div", { className: "flex justify-end gap-2 pt-4", children: [_jsx("button", { type: "button", onClick: () => {
                                                setShowAddUserModal(false);
                                                setNewUserData({
                                                    name: '',
                                                    email: '',
                                                    password: '',
                                                    role: 'customer',
                                                    phone: '',
                                                    isActive: true
                                                });
                                            }, className: "px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700", children: "Cancel" }), _jsx("button", { type: "submit", className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700", children: "Create User" })] })] })] }) })), showEditModal && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6", children: [_jsx("h3", { className: "text-lg font-semibold mb-4 text-gray-900 dark:text-white", children: "Edit User" }), _jsxs("form", { onSubmit: handleEditUser, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Name" }), _jsx("input", { type: "text", value: editUserData.name || '', onChange: (e) => setEditUserData(prev => ({ ...prev, name: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Email" }), _jsx("input", { type: "email", value: editUserData.email || '', onChange: (e) => setEditUserData(prev => ({ ...prev, email: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Phone" }), _jsx("input", { type: "tel", value: editUserData.phone || '', onChange: (e) => setEditUserData(prev => ({ ...prev, phone: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Role" }), _jsxs("select", { value: editUserData.role || '', onChange: (e) => setEditUserData(prev => ({ ...prev, role: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white", children: [_jsx("option", { value: "customer", children: "Customer" }), _jsx("option", { value: "owner", children: "Owner" }), _jsx("option", { value: "admin", children: "Admin" })] })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", id: "editIsActive", checked: editUserData.isActive || false, onChange: (e) => setEditUserData(prev => ({ ...prev, isActive: e.target.checked })), className: "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" }), _jsx("label", { htmlFor: "editIsActive", className: "ml-2 block text-sm text-gray-700 dark:text-gray-300", children: "Active User" })] }), _jsxs("div", { className: "flex justify-end gap-2 pt-4", children: [_jsx("button", { type: "button", onClick: () => {
                                                setShowEditModal(null);
                                                setEditUserData({});
                                            }, className: "px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700", children: "Cancel" }), _jsx("button", { type: "submit", className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700", children: "Update User" })] })] })] }) }))] }));
};
export default UserManagement;
