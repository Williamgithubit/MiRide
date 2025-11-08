import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/common/ImageUpload';
import { useUploadCarImagesMutation, useDeleteCarImageMutation, useSetPrimaryImageMutation } from '../../../../../store/Car/carApi';
const carFormSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
    brand: z.string().min(2, 'Brand is required'),
    model: z.string().min(1, 'Model is required'),
    year: z.number().min(1900, 'Invalid year').max(new Date().getFullYear() + 1, 'Invalid year'),
    rentalPricePerDay: z.number().min(1, 'Price must be at least $1').positive('Price must be positive'),
    seats: z.number().min(1, 'At least 1 seat').max(10, 'Maximum 10 seats'),
    fuelType: z.enum(['Petrol', 'Diesel', 'Electric', 'Hybrid']),
    location: z.string().min(2, 'Location is required'),
    features: z.string().optional(),
    isAvailable: z.boolean(),
    description: z.string().optional(),
});
export const CarForm = ({ initialData = {}, onSubmit, isSubmitting, onCancel, onImageUpload, onDeleteImage, onSetPrimaryImage, uploadProgress: externalUploadProgress, isUploading: externalIsUploading, }) => {
    const [localUploadProgress, setLocalUploadProgress] = useState(0);
    const [localIsUploading, setLocalIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [existingImages, setExistingImages] = useState(initialData.images || []);
    const [uploadCarImages] = useUploadCarImagesMutation();
    const [deleteCarImage] = useDeleteCarImageMutation();
    const [setPrimaryImage] = useSetPrimaryImageMutation();
    // Sync images with props
    useEffect(() => {
        if (initialData?.images) {
            setExistingImages(initialData.images);
        }
    }, [initialData?.images]);
    // Use external props first, fallback to local state
    const currentUploadProgress = externalUploadProgress ?? localUploadProgress;
    const currentIsUploading = externalIsUploading ?? localIsUploading;
    const carForm = useForm({
        resolver: zodResolver(carFormSchema),
        defaultValues: {
            name: initialData?.name || '',
            brand: initialData?.brand || '',
            model: initialData?.model || '',
            year: initialData?.year || new Date().getFullYear(),
            rentalPricePerDay: initialData?.rentalPricePerDay ?? 0,
            seats: initialData?.seats ?? 5,
            fuelType: initialData?.fuelType || 'Petrol',
            location: initialData?.location || '',
            features: Array.isArray(initialData?.features)
                ? initialData.features.join(', ')
                : typeof initialData?.features === 'string'
                    ? initialData.features
                    : '',
            isAvailable: initialData?.isAvailable ?? true,
            description: initialData?.description || '',
        },
        mode: 'onChange',
    });
    // Reset form when initialData changes
    useEffect(() => {
        if (initialData) {
            carForm.reset({
                name: initialData.name || '',
                brand: initialData.brand || '',
                model: initialData.model || '',
                year: initialData.year || new Date().getFullYear(),
                rentalPricePerDay: initialData.rentalPricePerDay ?? 0,
                seats: initialData.seats ?? 5,
                fuelType: initialData.fuelType || 'Petrol',
                location: initialData.location || '',
                features: Array.isArray(initialData.features)
                    ? initialData.features.join(', ')
                    : initialData.features || '',
                isAvailable: initialData.isAvailable ?? true,
                description: initialData.description || '',
            });
        }
    }, [initialData, carForm]);
    // Memoized handlers to prevent unnecessary re-renders
    const handleImageUpload = useCallback(async (files) => {
        if (!onImageUpload || !initialData?.id) {
            toast.error('Cannot upload images without a valid car ID');
            return;
        }
        setLocalIsUploading(true);
        setUploadError(null);
        setLocalUploadProgress(0);
        try {
            const success = await onImageUpload(files);
            if (success) {
                toast.success('Images uploaded successfully');
            }
            else {
                throw new Error('Failed to upload images');
            }
        }
        catch (error) {
            const errorMessage = error?.message || 'Failed to upload images';
            setUploadError(errorMessage);
            toast.error(errorMessage);
        }
        finally {
            setLocalIsUploading(false);
            setTimeout(() => setLocalUploadProgress(0), 1000);
        }
    }, [onImageUpload, initialData?.id]);
    const handleDeleteImage = useCallback(async (imageId) => {
        if (!onDeleteImage) {
            toast.error('Delete function not available');
            return false;
        }
        try {
            const success = await onDeleteImage(imageId);
            if (success) {
                // Update local state optimistically
                setExistingImages(prev => prev.filter(img => img.id !== imageId));
                toast.success('Image deleted successfully');
            }
            return success;
        }
        catch (error) {
            toast.error(error?.message || 'Failed to delete image');
            return false;
        }
    }, [onDeleteImage]);
    const handleSetPrimary = useCallback(async (imageId) => {
        if (!onSetPrimaryImage) {
            toast.error('Set primary function not available');
            return false;
        }
        try {
            const success = await onSetPrimaryImage(imageId);
            if (success) {
                // Update local state optimistically
                setExistingImages(prev => prev.map(img => img.id === imageId
                    ? { ...img, isPrimary: true }
                    : { ...img, isPrimary: false }));
                toast.success('Primary image updated successfully');
            }
            return success;
        }
        catch (error) {
            toast.error(error?.message || 'Failed to set primary image');
            return false;
        }
    }, [onSetPrimaryImage]);
    const handleFormSubmit = async (formData) => {
        try {
            // Process features string into an array
            const featuresArray = typeof formData.features === 'string'
                ? formData.features
                    .split(',')
                    .map(f => f.trim())
                    .filter(Boolean)
                : [];
            const { features: _, ...restFormData } = formData;
            const processedData = {
                ...restFormData,
                features: featuresArray,
                id: initialData?.id,
            };
            const success = await onSubmit(processedData);
            if (success) {
                toast.success(initialData?.id ? 'Car updated successfully' : 'Car created successfully');
            }
            return success;
        }
        catch (error) {
            toast.error(error?.message || 'Failed to save car');
            return false;
        }
    };
    const hasCarId = !!initialData?.id;
    return (_jsxs("form", { onSubmit: carForm.handleSubmit(handleFormSubmit), className: "space-y-6", noValidate: true, children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "name", children: "Car Name" }), _jsx(Input, { id: "name", placeholder: "e.g., Tesla Model 3", ...carForm.register('name'), disabled: isSubmitting }), carForm.formState.errors.name && (_jsx("p", { className: "text-sm text-destructive mt-1", children: carForm.formState.errors.name.message }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "brand", children: "Brand" }), _jsx(Input, { id: "brand", placeholder: "e.g., Tesla", ...carForm.register('brand'), disabled: isSubmitting }), carForm.formState.errors.brand && (_jsx("p", { className: "text-sm text-destructive mt-1", children: carForm.formState.errors.brand.message }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "model", children: "Model" }), _jsx(Input, { id: "model", placeholder: "e.g., Model 3", ...carForm.register('model'), disabled: isSubmitting }), carForm.formState.errors.model && (_jsx("p", { className: "text-sm text-destructive mt-1", children: carForm.formState.errors.model.message }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "year", children: "Year" }), _jsx(Input, { id: "year", type: "number", min: 1900, max: new Date().getFullYear() + 1, ...carForm.register('year', { valueAsNumber: true }), disabled: isSubmitting }), carForm.formState.errors.year && (_jsx("p", { className: "text-sm text-destructive mt-1", children: carForm.formState.errors.year.message }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "rentalPricePerDay", children: "Price per Day ($)" }), _jsx(Input, { id: "rentalPricePerDay", type: "number", step: "0.01", min: "1", ...carForm.register('rentalPricePerDay', { valueAsNumber: true }), disabled: isSubmitting }), carForm.formState.errors.rentalPricePerDay && (_jsx("p", { className: "text-sm text-destructive mt-1", children: carForm.formState.errors.rentalPricePerDay.message }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "seats", children: "Number of Seats" }), _jsx(Input, { id: "seats", type: "number", min: "1", max: "10", ...carForm.register('seats', { valueAsNumber: true }), disabled: isSubmitting }), carForm.formState.errors.seats && (_jsx("p", { className: "text-sm text-destructive mt-1", children: carForm.formState.errors.seats.message }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "fuelType", children: "Fuel Type" }), _jsx(Controller, { name: "fuelType", control: carForm.control, render: ({ field }) => (_jsxs(Select, { onValueChange: field.onChange, value: field.value, disabled: isSubmitting, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select fuel type" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "Petrol", children: "Petrol" }), _jsx(SelectItem, { value: "Diesel", children: "Diesel" }), _jsx(SelectItem, { value: "Electric", children: "Electric" }), _jsx(SelectItem, { value: "Hybrid", children: "Hybrid" })] })] })) }), carForm.formState.errors.fuelType && (_jsx("p", { className: "text-sm text-destructive mt-1", children: carForm.formState.errors.fuelType.message }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "location", children: "Location" }), _jsx(Input, { id: "location", placeholder: "e.g., New York, NY", ...carForm.register('location'), disabled: isSubmitting }), carForm.formState.errors.location && (_jsx("p", { className: "text-sm text-destructive mt-1", children: carForm.formState.errors.location.message }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Availability" }), _jsx(Controller, { name: "isAvailable", control: carForm.control, render: ({ field }) => (_jsxs("div", { className: "flex items-center space-x-2 pt-1", children: [_jsx(Switch, { id: "isAvailable", checked: field.value, onCheckedChange: field.onChange, disabled: isSubmitting }), _jsx(Label, { htmlFor: "isAvailable", className: "cursor-pointer", children: field.value ? 'Available' : 'Not Available' })] })) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "features", children: "Features (comma-separated)" }), _jsx(Input, { id: "features", placeholder: "e.g., GPS, Bluetooth, Sunroof", ...carForm.register('features'), disabled: isSubmitting })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "description", children: "Description" }), _jsx(Textarea, { id: "description", placeholder: "Describe the car...", className: "min-h-[100px] resize-vertical", ...carForm.register('description'), disabled: isSubmitting }), carForm.formState.errors.description && (_jsx("p", { className: "text-sm text-destructive mt-1", children: carForm.formState.errors.description.message }))] }), hasCarId && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium mb-2", children: "Car Images" }), _jsxs("p", { className: "text-sm text-muted-foreground", children: ["Upload and manage images for this car. The first image will be used as the main display.", existingImages.length > 0 && (_jsxs(_Fragment, { children: [" \u2022 ", existingImages.length, " image", existingImages.length !== 1 ? 's' : '', " uploaded"] }))] })] }), _jsx(ImageUpload, { onUpload: handleImageUpload, existingImages: existingImages, onDeleteImage: handleDeleteImage, onSetPrimary: handleSetPrimary, uploadProgress: currentUploadProgress, isUploading: currentIsUploading, error: uploadError, maxFiles: 10 - existingImages.length })] })), _jsxs("div", { className: "flex justify-end space-x-4 pt-4", children: [_jsx(Button, { type: "button", variant: "outline", onClick: onCancel, disabled: isSubmitting, children: "Cancel" }), _jsx(Button, { type: "submit", disabled: isSubmitting || !carForm.formState.isValid, children: isSubmitting ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), hasCarId ? 'Updating...' : 'Creating...'] })) : (_jsx(_Fragment, { children: hasCarId ? 'Update Car' : 'Create Car' })) })] })] }));
};
export default CarForm;
