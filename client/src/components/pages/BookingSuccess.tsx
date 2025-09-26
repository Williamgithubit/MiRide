import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, Car, CreditCard, ArrowRight, Download, MapPin, Clock, DollarSign, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';

interface BookingDetails {
  sessionId: string;
  carDetails: {
    year: string;
    make: string;
    model: string;
    image?: string;
  };
  bookingInfo: {
    startDate: string;
    endDate: string;
    totalDays: number;
    pickupLocation: string;
    dropoffLocation: string;
    specialRequests?: string;
  };
  pricing: {
    basePrice: number;
    insurance: number;
    gps: number;
    childSeat: number;
    additionalDriver: number;
    totalAmount: number;
  };
  addOns: {
    insurance: boolean;
    gps: boolean;
    childSeat: boolean;
    additionalDriver: boolean;
  };
  paymentInfo: {
    paymentMethod: string;
    transactionId: string;
    paymentDate: string;
  };
}

const BookingSuccess: React.FC = () => {
  console.log('BookingSuccess component rendered');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      fetchSessionDetails();
    } else {
      navigate('/customer-dashboard');
    }
  }, [sessionId, navigate]);

  const fetchSessionDetails = async () => {
    try {
      console.log('Fetching session details for:', sessionId);
      // For now, we'll create mock data based on the session ID
      // In a real implementation, you'd fetch this from your backend
      const mockBookingDetails: BookingDetails = {
        sessionId: sessionId!,
        carDetails: {
          year: '2023',
          make: 'Toyota',
          model: 'Camry',
        },
        bookingInfo: {
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          totalDays: 3,
          pickupLocation: 'Downtown Office',
          dropoffLocation: 'Airport Terminal',
          specialRequests: 'Please ensure the car is clean',
        },
        pricing: {
          basePrice: 150,
          insurance: 45,
          gps: 15,
          childSeat: 24,
          additionalDriver: 25,
          totalAmount: 259,
        },
        addOns: {
          insurance: true,
          gps: true,
          childSeat: true,
          additionalDriver: true,
        },
        paymentInfo: {
          paymentMethod: 'Visa ending in 4242',
          transactionId: sessionId!.substring(0, 16),
          paymentDate: new Date().toLocaleString(),
        },
      };

      console.log('Setting booking details:', mockBookingDetails);
      setBookingDetails(mockBookingDetails);
      setIsLoading(false);
      toast.success('Payment successful! Your booking has been confirmed.');
    } catch (error) {
      console.error('Error fetching session details:', error);
      setIsLoading(false);
      toast.error('Error loading booking details');
    }
  };

  const handleGoToDashboard = () => {
    navigate('/customer-dashboard');
  };

  const generatePDFReceipt = () => {
    if (!bookingDetails) return;

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
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!bookingDetails) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading booking details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-6 text-center">
          <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
             Payment Successful!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Your car rental booking has been confirmed. You will receive a confirmation email shortly.
          </p>
          
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center text-green-600 dark:text-green-400">
              <CreditCard className="w-5 h-5 mr-2" />
              <span>Payment Processed</span>
            </div>
            <div className="flex items-center text-green-600 dark:text-green-400">
              <Car className="w-5 h-5 mr-2" />
              <span>Booking Confirmed</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Booking Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Car className="w-5 h-5 mr-2" />
              Booking Details
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Vehicle</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {bookingDetails.carDetails.year} {bookingDetails.carDetails.make} {bookingDetails.carDetails.model}
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Rental Period
                </h3>
                <div className="text-gray-600 dark:text-gray-400 space-y-1">
                  <p>Pickup: {new Date(bookingDetails.bookingInfo.startDate).toLocaleDateString()}</p>
                  <p>Return: {new Date(bookingDetails.bookingInfo.endDate).toLocaleDateString()}</p>
                  <p>Duration: {bookingDetails.bookingInfo.totalDays} days</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  Locations
                </h3>
                <div className="text-gray-600 dark:text-gray-400 space-y-1">
                  <p>Pickup: {bookingDetails.bookingInfo.pickupLocation}</p>
                  <p>Dropoff: {bookingDetails.bookingInfo.dropoffLocation}</p>
                </div>
              </div>
              
              {bookingDetails.bookingInfo.specialRequests && (
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Special Requests</h3>
                  <p className="text-gray-600 dark:text-gray-400">{bookingDetails.bookingInfo.specialRequests}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Payment Summary
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Base Rental ({bookingDetails.bookingInfo.totalDays} days)</span>
                <span className="font-medium">${bookingDetails.pricing.basePrice}</span>
              </div>
              
              {bookingDetails.addOns.insurance && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Full Insurance Coverage</span>
                  <span className="font-medium">${bookingDetails.pricing.insurance}</span>
                </div>
              )}
              
              {bookingDetails.addOns.gps && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">GPS Navigation</span>
                  <span className="font-medium">${bookingDetails.pricing.gps}</span>
                </div>
              )}
              
              {bookingDetails.addOns.childSeat && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Child Safety Seat</span>
                  <span className="font-medium">${bookingDetails.pricing.childSeat}</span>
                </div>
              )}
              
              {bookingDetails.addOns.additionalDriver && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Additional Driver</span>
                  <span className="font-medium">${bookingDetails.pricing.additionalDriver}</span>
                </div>
              )}
              
              <hr className="border-gray-200 dark:border-gray-700" />
              
              <div className="flex justify-between text-lg font-semibold">
                <span>Total Amount</span>
                <span className="text-green-600 dark:text-green-400">${bookingDetails.pricing.totalAmount}</span>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <CreditCard className="w-4 h-4 mr-1" />
                Payment Information
              </h3>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p>Method: {bookingDetails.paymentInfo.paymentMethod}</p>
                <p>Transaction ID: {bookingDetails.paymentInfo.transactionId}</p>
                <p>Date: {bookingDetails.paymentInfo.paymentDate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generatePDFReceipt}
              className="flex-1 flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Receipt (PDF)
            </button>
            
            <button
              onClick={handleGoToDashboard}
              className="flex-1 flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Session ID: {bookingDetails.sessionId}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;
