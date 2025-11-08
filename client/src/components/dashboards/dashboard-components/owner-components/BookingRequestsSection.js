import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useGetOwnerBookingsQuery, useApproveBookingMutation, useRejectBookingMutation } from "../../../../store/Rental/rentalApi";
import BookingRequestsTable from './booking-requests/BookingRequestsTable';
import { ApprovalModal, RejectionModal } from './booking-requests/BookingActionModals';
import BookingDetailsModal from './booking-requests/BookingDetailsModal';
import { FaSync } from 'react-icons/fa';
export const BookingRequestsSection = () => {
    const [updating, setUpdating] = useState({});
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [showRejectionModal, setShowRejectionModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    // Use RTK Query hooks
    const { data: rentals = [], isLoading: loading, error: rentalsError, refetch } = useGetOwnerBookingsQuery();
    const [approveBooking] = useApproveBookingMutation();
    const [rejectBooking] = useRejectBookingMutation();
    // Transform Rental[] to BookingRequest[] with filtering
    const allBookings = rentals.map((rental) => {
        // Extract image URL from car.images array or use imageUrl directly
        let carImageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0xNiAyNEg0OEw0NiAzNkg0MFYzMkgzNlYzNkgzMFYzMkgyNlYzNkgyMFYzMkgxOFYzNkgxNkwyNCAyNFoiIGZpbGw9IiNGRkZGRkYiLz4KPHN2Zz4K';
        if (rental.car?.images && Array.isArray(rental.car.images) && rental.car.images.length > 0) {
            // Find primary image or use first image
            const primaryImage = rental.car.images.find((img) => img.isPrimary);
            const rawImageUrl = primaryImage?.imageUrl || rental.car.images[0]?.imageUrl;
            // Convert relative URLs to absolute URLs
            if (rawImageUrl) {
                carImageUrl = rawImageUrl.startsWith('http') ? rawImageUrl : `http://localhost:4000${rawImageUrl}`;
            }
        }
        else if (rental.car?.imageUrl) {
            // Convert relative URLs to absolute URLs
            carImageUrl = rental.car.imageUrl.startsWith('http') ? rental.car.imageUrl : `http://localhost:4000${rental.car.imageUrl}`;
        }
        return {
            id: rental.id.toString(),
            car: {
                id: rental.car?.id?.toString() || rental.carId.toString(),
                make: rental.car?.brand || rental.car?.brand || rental.car?.name?.split(" ")[0] || "Unknown",
                model: rental.car?.model || rental.car?.name || "Unknown",
                year: rental.car?.year || new Date().getFullYear(),
                image: carImageUrl,
            },
            customer: {
                id: rental.customer?.id?.toString() || rental.customerId.toString(),
                name: rental.customer?.name || "Unknown Customer",
                email: rental.customer?.email || "unknown@email.com",
            },
            startDate: rental.startDate,
            endDate: rental.endDate,
            totalCost: Number(rental.totalAmount) || Number(rental.totalCost) || 0,
            status: rental.status,
            createdAt: rental.createdAt,
            paymentStatus: rental.paymentStatus,
        };
    });
    // Filter bookings based on status
    const bookings = React.useMemo(() => {
        if (statusFilter === 'all') {
            return allBookings;
        }
        return allBookings.filter(booking => booking.status === statusFilter);
    }, [allBookings, statusFilter]);
    const handleApprove = (bookingId) => {
        const booking = bookings.find(b => b.id === bookingId);
        if (booking) {
            setSelectedBooking(booking);
            setShowApprovalModal(true);
        }
    };
    const handleReject = (bookingId) => {
        const booking = bookings.find(b => b.id === bookingId);
        if (booking) {
            setSelectedBooking(booking);
            setShowRejectionModal(true);
        }
    };
    const handleViewDetails = (booking) => {
        setSelectedBooking(booking);
        setShowDetailsModal(true);
    };
    const confirmApproval = async () => {
        if (!selectedBooking)
            return;
        try {
            setUpdating(prev => ({ ...prev, [selectedBooking.id]: true }));
            await approveBooking(parseInt(selectedBooking.id)).unwrap();
            toast.success("Booking approved successfully!");
            setShowApprovalModal(false);
            setSelectedBooking(null);
        }
        catch (error) {
            console.error("Error approving booking:", error);
            toast.error("Failed to approve booking");
        }
        finally {
            setUpdating(prev => ({ ...prev, [selectedBooking.id]: false }));
        }
    };
    const confirmRejection = async (reason) => {
        if (!selectedBooking)
            return;
        try {
            setUpdating(prev => ({ ...prev, [selectedBooking.id]: true }));
            await rejectBooking({
                id: parseInt(selectedBooking.id),
                reason
            }).unwrap();
            toast.success("Booking rejected successfully!");
            setShowRejectionModal(false);
            setSelectedBooking(null);
        }
        catch (error) {
            console.error("Error rejecting booking:", error);
            toast.error("Failed to reject booking");
        }
        finally {
            setUpdating(prev => ({ ...prev, [selectedBooking.id]: false }));
        }
    };
    // Handle errors
    React.useEffect(() => {
        if (rentalsError) {
            console.error("Error fetching rentals:", rentalsError);
            toast.error("Failed to load booking requests");
        }
    }, [rentalsError]);
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold tracking-tight text-gray-900 dark:text-white", children: "Booking Requests" }), _jsxs("p", { className: "text-sm text-gray-500 dark:text-gray-400 mt-1", children: ["Manage and review customer booking requests (", bookings.length, " ", statusFilter === 'all' ? 'total' : statusFilter.replace('_', ' '), " bookings)"] })] }), _jsxs("div", { className: "flex items-center justify-end gap-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("label", { htmlFor: "status-filter", className: "text-sm font-medium text-gray-700 dark:text-gray-300", children: "Status:" }), _jsxs("select", { id: "status-filter", value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), className: "px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500", children: [_jsx("option", { value: "all", children: "All Status" }), _jsx("option", { value: "pending_approval", children: "Pending Approval" }), _jsx("option", { value: "approved", children: "Approved" }), _jsx("option", { value: "active", children: "Active" }), _jsx("option", { value: "completed", children: "Completed" }), _jsx("option", { value: "rejected", children: "Rejected" }), _jsx("option", { value: "cancelled", children: "Cancelled" })] })] }), _jsxs("button", { onClick: () => refetch(), disabled: loading, className: "px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center space-x-2", children: [_jsx(FaSync, { className: `w-4 h-4 ${loading ? 'animate-spin' : ''}` }), _jsx("span", { className: "hidden sm:inline", children: loading ? "Refreshing..." : "Refresh" }), _jsx("span", { className: "sm:hidden", children: "\u21BB" })] })] })] }), _jsx(BookingRequestsTable, { bookings: bookings, loading: loading, onApprove: handleApprove, onReject: handleReject, onViewDetails: handleViewDetails, updating: updating }), _jsx(ApprovalModal, { isOpen: showApprovalModal, onClose: () => {
                    setShowApprovalModal(false);
                    setSelectedBooking(null);
                }, onConfirm: confirmApproval, booking: selectedBooking, loading: updating[selectedBooking?.id || ''] }), _jsx(RejectionModal, { isOpen: showRejectionModal, onClose: () => {
                    setShowRejectionModal(false);
                    setSelectedBooking(null);
                }, onConfirm: confirmRejection, booking: selectedBooking, loading: updating[selectedBooking?.id || ''] }), _jsx(BookingDetailsModal, { isOpen: showDetailsModal, onClose: () => {
                    setShowDetailsModal(false);
                    setSelectedBooking(null);
                }, booking: selectedBooking })] }));
};
