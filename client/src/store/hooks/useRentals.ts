import { useState } from 'react';
import { 
  useGetRentalsQuery,
  useGetRentalByIdQuery,
  useGetCustomerRentalsQuery,
  useGetCarRentalsQuery,
  useCreateRentalMutation,
  useUpdateRentalMutation,
  useCancelRentalMutation,
  useCompleteRentalMutation,
  CreateRentalRequest,
  Rental
} from '../Rental/rentalApi';
import { showErrorToast, showSuccessToast } from '../utils/apiUtils';

export const useRentals = () => {
  const [selectedRentalId, setSelectedRentalId] = useState<number | null>(null);
  
  // RTK Query hooks
  const { 
    data: rentals, 
    isLoading: isLoadingRentals, 
    error: rentalsError,
    refetch: refetchRentals
  } = useGetRentalsQuery();
  
  const { 
    data: selectedRental, 
    isLoading: isLoadingSelectedRental 
  } = useGetRentalByIdQuery(selectedRentalId || 0, { 
    skip: selectedRentalId === null 
  });
  
  const [createRental, createRentalResult] = useCreateRentalMutation();
  const [updateRental, updateRentalResult] = useUpdateRentalMutation();
  const [cancelRental, cancelRentalResult] = useCancelRentalMutation();
  const [completeRental, completeRentalResult] = useCompleteRentalMutation();

  // Custom functions
  const selectRental = (id: number) => {
    setSelectedRentalId(id);
  };

  const clearSelectedRental = () => {
    setSelectedRentalId(null);
  };

  const addRental = async (rentalData: CreateRentalRequest) => {
    try {
      // Validate dates
      const startDate = new Date(rentalData.startDate);
      const endDate = new Date(rentalData.endDate);
      const today = new Date();
      
      // Start date must be in the future
      if (startDate <= today) {
        throw new Error('Start date must be in the future');
      }
      
      // End date must be after start date
      if (endDate <= startDate) {
        throw new Error('End date must be after start date');
      }
      
      const result = await createRental(rentalData).unwrap();
      showSuccessToast('Rental created successfully');
      return result;
    } catch (error) {
      if (error instanceof Error) {
        showErrorToast({ status: 'CUSTOM_ERROR', error: error.message, data: error.message });
      } else {
        showErrorToast(createRentalResult.error);
      }
      throw error;
    }
  };

  const modifyRental = async (id: number, rentalData: Partial<Rental>) => {
    try {
      const result = await updateRental({ id, ...rentalData }).unwrap();
      showSuccessToast('Rental updated successfully');
      return result;
    } catch (error) {
      showErrorToast(updateRentalResult.error);
      throw error;
    }
  };

  const cancelRentalById = async (id: number) => {
    try {
      const result = await cancelRental(id).unwrap();
      showSuccessToast('Rental cancelled successfully');
      return result;
    } catch (error) {
      showErrorToast(cancelRentalResult.error);
      throw error;
    }
  };

  const completeRentalById = async (id: number) => {
    try {
      const result = await completeRental(id).unwrap();
      showSuccessToast('Rental completed successfully');
      return result;
    } catch (error) {
      showErrorToast(completeRentalResult.error);
      throw error;
    }
  };

  const getCustomerRentals = () => {
    return useGetCustomerRentalsQuery();
  };

  const getCarRentals = (carId: number) => {
    return useGetCarRentalsQuery(carId);
  };

  return {
    rentals,
    selectedRental,
    isLoading: isLoadingRentals || isLoadingSelectedRental || 
               createRentalResult.isLoading || updateRentalResult.isLoading || 
               cancelRentalResult.isLoading || completeRentalResult.isLoading,
    error: rentalsError || createRentalResult.error || updateRentalResult.error || 
           cancelRentalResult.error || completeRentalResult.error,
    selectRental,
    clearSelectedRental,
    addRental,
    modifyRental,
    cancelRentalById,
    completeRentalById,
    getCustomerRentals,
    getCarRentals,
    refetchRentals
  };
};

export default useRentals;
