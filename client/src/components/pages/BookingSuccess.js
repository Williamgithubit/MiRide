import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, Car, CreditCard, ArrowRight, Download, MapPin, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import { useDispatch } from 'react-redux';
import { carApi } from '../../store/Car/carApi';
const BookingSuccess = () => {
    console.log('BookingSuccess component rendered');
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(true);
    const [bookingDetails, setBookingDetails] = useState(null);
    const sessionId = searchParams.get('session_id');
    useEffect(() => {
        if (sessionId) {
            fetchSessionDetails();
        }
        else {
            navigate('/customer-dashboard');
        }
    }, [sessionId, navigate]);
    const fetchSessionDetails = async () => {
        try {
            console.log('Fetching session details for:', sessionId);
            // Call the fallback endpoint to create booking and get session details
            const token = localStorage.getItem('token');
            const response = await fetch('/api/payments/create-booking-fallback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ sessionId })
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.success && data.sessionDetails) {
                const bookingDetails = {
                    sessionId: data.sessionDetails.sessionId,
                    carDetails: {
                        year: data.sessionDetails.carDetails.year.toString(),
                        make: data.sessionDetails.carDetails.make,
                        model: data.sessionDetails.carDetails.model,
                        image: data.sessionDetails.carDetails.image
                    },
                    bookingInfo: {
                        startDate: data.sessionDetails.bookingInfo.startDate,
                        endDate: data.sessionDetails.bookingInfo.endDate,
                        totalDays: data.sessionDetails.bookingInfo.totalDays,
                        pickupLocation: data.sessionDetails.bookingInfo.pickupLocation,
                        dropoffLocation: data.sessionDetails.bookingInfo.dropoffLocation,
                        specialRequests: data.sessionDetails.bookingInfo.specialRequests
                    },
                    pricing: {
                        basePrice: data.sessionDetails.pricing.basePrice,
                        insurance: data.sessionDetails.pricing.insurance,
                        gps: data.sessionDetails.pricing.gps,
                        childSeat: data.sessionDetails.pricing.childSeat,
                        additionalDriver: data.sessionDetails.pricing.additionalDriver,
                        totalAmount: data.sessionDetails.pricing.totalAmount
                    },
                    addOns: {
                        insurance: data.sessionDetails.addOns.insurance,
                        gps: data.sessionDetails.addOns.gps,
                        childSeat: data.sessionDetails.addOns.childSeat,
                        additionalDriver: data.sessionDetails.addOns.additionalDriver
                    },
                    paymentInfo: {
                        paymentMethod: data.sessionDetails.paymentInfo.paymentMethod,
                        transactionId: data.sessionDetails.paymentInfo.transactionId,
                        paymentDate: data.sessionDetails.paymentInfo.paymentDate
                    }
                };
                console.log('Setting booking details from API:', bookingDetails);
                setBookingDetails(bookingDetails);
                // Invalidate car cache to refresh availability status
                dispatch(carApi.util.invalidateTags([{ type: 'Car', id: 'LIST' }]));
                console.log('Car cache invalidated - availability should refresh');
                setIsLoading(false);
                toast.success('Payment successful! Your booking has been confirmed.');
            }
            else {
                throw new Error(data.message || 'Failed to create booking');
            }
        }
        catch (error) {
            console.error('Error fetching session details:', error);
            setIsLoading(false);
            toast.error('Error loading booking details. Please contact support.');
        }
    };
    const handleGoToDashboard = () => {
        navigate('/dashboard');
    };
    const generatePDFReceipt = () => {
        if (!bookingDetails)
            return;
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;
        // Header
        doc.setFontSize(20);
        doc.setTextColor(59, 130, 246); // Blue color
        doc.text('MiRide Car Rental', pageWidth / 2, 20, { align: 'center' });
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('Booking Receipt', pageWidth / 2, 35, { align: 'center' });
        // Booking Details
        let yPos = 55;
        doc.setFontSize(14);
        doc.setTextColor(34, 197, 94); // Green color
        doc.text('✓ Payment Successful', 20, yPos);
        yPos += 20;
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        // Car Information
        doc.text('Car Details:', 20, yPos);
        yPos += 10;
        doc.text(`${bookingDetails.carDetails.year} ${bookingDetails.carDetails.make} ${bookingDetails.carDetails.model}`, 30, yPos);
        yPos += 20;
        doc.text('Booking Information:', 20, yPos);
        yPos += 10;
        doc.text(`Pickup Date: ${new Date(bookingDetails.bookingInfo.startDate).toLocaleDateString()}`, 30, yPos);
        yPos += 8;
        doc.text(`Return Date: ${new Date(bookingDetails.bookingInfo.endDate).toLocaleDateString()}`, 30, yPos);
        yPos += 8;
        doc.text(`Total Days: ${bookingDetails.bookingInfo.totalDays}`, 30, yPos);
        yPos += 8;
        doc.text(`Pickup Location: ${bookingDetails.bookingInfo.pickupLocation}`, 30, yPos);
        yPos += 8;
        doc.text(`Dropoff Location: ${bookingDetails.bookingInfo.dropoffLocation}`, 30, yPos);
        if (bookingDetails.bookingInfo.specialRequests) {
            yPos += 8;
            doc.text(`Special Requests: ${bookingDetails.bookingInfo.specialRequests}`, 30, yPos);
        }
        yPos += 20;
        doc.text('Add-ons:', 20, yPos);
        yPos += 10;
        if (bookingDetails.addOns.insurance) {
            doc.text(`• Full Insurance Coverage: $${bookingDetails.pricing.insurance}`, 30, yPos);
            yPos += 8;
        }
        if (bookingDetails.addOns.gps) {
            doc.text(`• GPS Navigation: $${bookingDetails.pricing.gps}`, 30, yPos);
            yPos += 8;
        }
        if (bookingDetails.addOns.childSeat) {
            doc.text(`• Child Safety Seat: $${bookingDetails.pricing.childSeat}`, 30, yPos);
            yPos += 8;
        }
        if (bookingDetails.addOns.additionalDriver) {
            doc.text(`• Additional Driver: $${bookingDetails.pricing.additionalDriver}`, 30, yPos);
            yPos += 8;
        }
        yPos += 15;
        doc.text('Payment Summary:', 20, yPos);
        yPos += 10;
        doc.text(`Base Rental (${bookingDetails.bookingInfo.totalDays} days): $${bookingDetails.pricing.basePrice}`, 30, yPos);
        yPos += 8;
        doc.text(`Add-ons Total: $${bookingDetails.pricing.totalAmount - bookingDetails.pricing.basePrice}`, 30, yPos);
        yPos += 8;
        doc.setFontSize(14);
        doc.text(`Total Amount: $${bookingDetails.pricing.totalAmount}`, 30, yPos);
        yPos += 20;
        doc.setFontSize(12);
        doc.text('Payment Information:', 20, yPos);
        yPos += 10;
        doc.text(`Payment Method: ${bookingDetails.paymentInfo.paymentMethod}`, 30, yPos);
        yPos += 8;
        doc.text(`Transaction ID: ${bookingDetails.paymentInfo.transactionId}`, 30, yPos);
        yPos += 8;
        doc.text(`Payment Date: ${bookingDetails.paymentInfo.paymentDate}`, 30, yPos);
        yPos += 8;
        doc.text(`Session ID: ${bookingDetails.sessionId}`, 30, yPos);
        // Footer
        yPos += 30;
        doc.setFontSize(10);
        doc.setTextColor(128, 128, 128);
        doc.text('Thank you for choosing MiRide Car Rental!', pageWidth / 2, yPos, { align: 'center' });
        doc.text('For support, contact us at support@miride.com', pageWidth / 2, yPos + 10, { align: 'center' });
        // Save the PDF
        doc.save(`MiRide-Receipt-${bookingDetails.sessionId.substring(0, 8)}.pdf`);
        toast.success('Receipt downloaded successfully!');
    };
    if (isLoading) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" }) }));
    }
    if (!bookingDetails) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600 dark:text-gray-400", children: "Loading booking details..." })] }) }));
    }
    return (_jsx("div", { className: "min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4", children: _jsxs("div", { className: "max-w-4xl mx-auto", children: [_jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-6 text-center", children: [_jsx("div", { className: "mx-auto w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-6", children: _jsx(CheckCircle, { className: "w-10 h-10 text-green-600 dark:text-green-400" }) }), _jsx("h1", { className: "text-3xl font-bold text-gray-900 dark:text-white mb-3", children: "Payment Successful!" }), _jsx("p", { className: "text-lg text-gray-600 dark:text-gray-400 mb-6", children: "Your car rental booking has been confirmed. You will receive a confirmation email shortly." }), _jsxs("div", { className: "flex items-center justify-center space-x-6 text-sm", children: [_jsxs("div", { className: "flex items-center text-green-600 dark:text-green-400", children: [_jsx(CreditCard, { className: "w-5 h-5 mr-2" }), _jsx("span", { children: "Payment Processed" })] }), _jsxs("div", { className: "flex items-center text-green-600 dark:text-green-400", children: [_jsx(Car, { className: "w-5 h-5 mr-2" }), _jsx("span", { children: "Booking Confirmed" })] })] })] }), _jsxs("div", { className: "grid md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6", children: [_jsxs("h2", { className: "text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center", children: [_jsx(Car, { className: "w-5 h-5 mr-2" }), "Booking Details"] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-medium text-gray-900 dark:text-white mb-2", children: "Vehicle" }), _jsxs("p", { className: "text-gray-600 dark:text-gray-400", children: [bookingDetails.carDetails.year, " ", bookingDetails.carDetails.make, " ", bookingDetails.carDetails.model] })] }), _jsxs("div", { children: [_jsxs("h3", { className: "font-medium text-gray-900 dark:text-white mb-2 flex items-center", children: [_jsx(Calendar, { className: "w-4 h-4 mr-1" }), "Rental Period"] }), _jsxs("div", { className: "text-gray-600 dark:text-gray-400 space-y-1", children: [_jsxs("p", { children: ["Pickup: ", new Date(bookingDetails.bookingInfo.startDate).toLocaleDateString()] }), _jsxs("p", { children: ["Return: ", new Date(bookingDetails.bookingInfo.endDate).toLocaleDateString()] }), _jsxs("p", { children: ["Duration: ", bookingDetails.bookingInfo.totalDays, " days"] })] })] }), _jsxs("div", { children: [_jsxs("h3", { className: "font-medium text-gray-900 dark:text-white mb-2 flex items-center", children: [_jsx(MapPin, { className: "w-4 h-4 mr-1" }), "Locations"] }), _jsxs("div", { className: "text-gray-600 dark:text-gray-400 space-y-1", children: [_jsxs("p", { children: ["Pickup: ", bookingDetails.bookingInfo.pickupLocation] }), _jsxs("p", { children: ["Dropoff: ", bookingDetails.bookingInfo.dropoffLocation] })] })] }), bookingDetails.bookingInfo.specialRequests && (_jsxs("div", { children: [_jsx("h3", { className: "font-medium text-gray-900 dark:text-white mb-2", children: "Special Requests" }), _jsx("p", { className: "text-gray-600 dark:text-gray-400", children: bookingDetails.bookingInfo.specialRequests })] }))] })] }), _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6", children: [_jsxs("h2", { className: "text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center", children: [_jsx(DollarSign, { className: "w-5 h-5 mr-2" }), "Payment Summary"] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between", children: [_jsxs("span", { className: "text-gray-600 dark:text-gray-400", children: ["Base Rental (", bookingDetails.bookingInfo.totalDays, " days)"] }), _jsxs("span", { className: "font-medium", children: ["$", bookingDetails.pricing.basePrice] })] }), bookingDetails.addOns.insurance && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600 dark:text-gray-400", children: "Full Insurance Coverage" }), _jsxs("span", { className: "font-medium", children: ["$", bookingDetails.pricing.insurance] })] })), bookingDetails.addOns.gps && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600 dark:text-gray-400", children: "GPS Navigation" }), _jsxs("span", { className: "font-medium", children: ["$", bookingDetails.pricing.gps] })] })), bookingDetails.addOns.childSeat && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600 dark:text-gray-400", children: "Child Safety Seat" }), _jsxs("span", { className: "font-medium", children: ["$", bookingDetails.pricing.childSeat] })] })), bookingDetails.addOns.additionalDriver && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600 dark:text-gray-400", children: "Additional Driver" }), _jsxs("span", { className: "font-medium", children: ["$", bookingDetails.pricing.additionalDriver] })] })), _jsx("hr", { className: "border-gray-200 dark:border-gray-700" }), _jsxs("div", { className: "flex justify-between text-lg font-semibold", children: [_jsx("span", { children: "Total Amount" }), _jsxs("span", { className: "text-green-600 dark:text-green-400", children: ["$", bookingDetails.pricing.totalAmount] })] })] }), _jsxs("div", { className: "mt-6 pt-6 border-t border-gray-200 dark:border-gray-700", children: [_jsxs("h3", { className: "font-medium text-gray-900 dark:text-white mb-3 flex items-center", children: [_jsx(CreditCard, { className: "w-4 h-4 mr-1" }), "Payment Information"] }), _jsxs("div", { className: "text-sm text-gray-600 dark:text-gray-400 space-y-1", children: [_jsxs("p", { children: ["Method: ", bookingDetails.paymentInfo.paymentMethod] }), _jsxs("p", { children: ["Transaction ID: ", bookingDetails.paymentInfo.transactionId] }), _jsxs("p", { children: ["Date: ", bookingDetails.paymentInfo.paymentDate] })] })] })] })] }), _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mt-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row gap-4", children: [_jsxs("button", { onClick: generatePDFReceipt, className: "flex-1 flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors", children: [_jsx(Download, { className: "w-5 h-5 mr-2" }), "Download Receipt (PDF)"] }), _jsxs("button", { onClick: handleGoToDashboard, className: "flex-1 flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors", children: ["Go to Dashboard", _jsx(ArrowRight, { className: "w-5 h-5 ml-2" })] })] }), _jsx("div", { className: "mt-4 text-center", children: _jsxs("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: ["Session ID: ", bookingDetails.sessionId] }) })] })] }) }));
};
export default BookingSuccess;
