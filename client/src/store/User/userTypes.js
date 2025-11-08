// User and profile interfaces for the new model structure
// Type guard functions
export const isCustomerUser = (user) => {
    return user.role === 'customer';
};
export const isOwnerUser = (user) => {
    return user.role === 'owner';
};
