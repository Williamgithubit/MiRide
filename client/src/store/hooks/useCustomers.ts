import { useState } from 'react';
import { 
  useGetCustomersQuery, 
  useGetCustomerByIdQuery,
  useAddCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  useSearchCustomersQuery,
  Customer
} from '../Customer/customerApi';
import { showErrorToast, showSuccessToast } from '../utils/apiUtils';

export interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  driverLicense: string;
  role?: string;
}

export const useCustomers = () => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // RTK Query hooks
  const { 
    data: customers, 
    isLoading: isLoadingCustomers, 
    error: customersError,
    refetch: refetchCustomers
  } = useGetCustomersQuery();
  
  const { 
    data: selectedCustomer, 
    isLoading: isLoadingSelectedCustomer 
  } = useGetCustomerByIdQuery(selectedCustomerId || 0, { 
    skip: selectedCustomerId === null 
  });
  
  const {
    data: searchResults,
    isLoading: isSearching
  } = useSearchCustomersQuery(searchTerm, {
    skip: searchTerm.length < 2
  });
  
  const [addCustomer, addCustomerResult] = useAddCustomerMutation();
  const [updateCustomer, updateCustomerResult] = useUpdateCustomerMutation();
  const [deleteCustomer, deleteCustomerResult] = useDeleteCustomerMutation();

  // Custom functions
  const selectCustomer = (id: number) => {
    setSelectedCustomerId(id);
  };

  const clearSelectedCustomer = () => {
    setSelectedCustomerId(null);
  };

  const searchCustomers = (term: string) => {
    setSearchTerm(term);
  };

  const createCustomer = async (customerData: CustomerFormData) => {
    try {
      const result = await addCustomer(customerData).unwrap();
      showSuccessToast('Customer added successfully');
      return result;
    } catch (error) {
      showErrorToast(addCustomerResult.error);
      throw error;
    }
  };

  const editCustomer = async (id: number, customerData: Partial<CustomerFormData>) => {
    try {
      const result = await updateCustomer({ id, ...customerData }).unwrap();
      showSuccessToast('Customer updated successfully');
      return result;
    } catch (error) {
      showErrorToast(updateCustomerResult.error);
      throw error;
    }
  };

  const removeCustomer = async (id: number) => {
    try {
      await deleteCustomer(id).unwrap();
      showSuccessToast('Customer deleted successfully');
      if (selectedCustomerId === id) {
        clearSelectedCustomer();
      }
    } catch (error) {
      showErrorToast(deleteCustomerResult.error);
      throw error;
    }
  };

  return {
    customers,
    selectedCustomer,
    searchResults,
    isLoading: isLoadingCustomers || isLoadingSelectedCustomer || isSearching ||
               addCustomerResult.isLoading || updateCustomerResult.isLoading || 
               deleteCustomerResult.isLoading,
    error: customersError || addCustomerResult.error || updateCustomerResult.error || deleteCustomerResult.error,
    selectCustomer,
    clearSelectedCustomer,
    searchCustomers,
    createCustomer,
    editCustomer,
    removeCustomer,
    refetchCustomers
  };
};

export default useCustomers;
