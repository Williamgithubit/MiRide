import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/common/ImageUpload';
import { useUploadCarImagesMutation, useDeleteCarImageMutation, useSetPrimaryImageMutation } from '../../../../../store/Car/carApi';
import { CAR_FEATURES } from '@/constants/features';

const carFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  brand: z.string().min(2, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().min(1900, 'Invalid year').max(new Date().getFullYear() + 1, 'Invalid year'),
  rentalPricePerDay: z.number().min(1, 'Price must be at least $1').positive('Price must be positive'),
  seats: z.number().min(1, 'At least 1 seat').max(10, 'Maximum 10 seats'),
  fuelType: z.enum(['Petrol', 'Diesel', 'Electric', 'Hybrid']),
  location: z.string().min(2, 'Location is required'),
  features: z.array(z.string()).optional(),
  isAvailable: z.boolean(),
  description: z.string().optional(),
});

type CarFormData = z.infer<typeof carFormSchema>;

type CarFormValues = Omit<CarFormData, 'features'> & {
  id?: string | number;
  features?: string[] | string;
};

interface ImageType {
  id: string;
  imageUrl: string;
  isPrimary: boolean;
}

interface CarFormProps {
  initialData?: Partial<CarFormValues> & { 
    images?: ImageType[];
  }
  id?: string | number
  images?: ImageType[]
  onSubmit: (data: CarFormValues & { id?: string | number }) => Promise<boolean>
  isSubmitting: boolean
  onCancel: () => void
  onImageUpload?: (files: File[]) => Promise<boolean>
  onDeleteImage?: (imageId: string) => Promise<boolean>
  onSetPrimaryImage?: (imageId: string) => Promise<boolean>
  uploadProgress?: number
  isUploading?: boolean
}

export const CarForm: React.FC<CarFormProps> = ({
  initialData = {},
  onSubmit,
  isSubmitting,
  onCancel,
  onImageUpload,
  onDeleteImage,
  onSetPrimaryImage,
  uploadProgress: externalUploadProgress,
  isUploading: externalIsUploading,
}) => {
  const [localUploadProgress, setLocalUploadProgress] = useState(0);
  const [localIsUploading, setLocalIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [existingImages, setExistingImages] = useState<ImageType[]>(initialData.images || []);

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

  const carForm = useForm<CarFormData>({
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
        ? initialData.features 
        : typeof initialData?.features === 'string' 
          ? initialData.features.split(',').map(f => f.trim()).filter(Boolean)
          : [],
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
          ? initialData.features
          : typeof initialData.features === 'string'
            ? initialData.features.split(',').map(f => f.trim()).filter(Boolean)
            : [],
        isAvailable: initialData.isAvailable ?? true,
        description: initialData.description || '',
      });
    }
  }, [initialData, carForm]);

  // Memoized handlers to prevent unnecessary re-renders
  const handleImageUpload = useCallback(async (files: File[]) => {
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
      } else {
        throw new Error('Failed to upload images');
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to upload images';
      setUploadError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLocalIsUploading(false);
      setTimeout(() => setLocalUploadProgress(0), 1000);
    }
  }, [onImageUpload, initialData?.id]);

  const handleDeleteImage = useCallback(async (imageId: string) => {
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
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete image');
      return false;
    }
  }, [onDeleteImage]);

  const handleSetPrimary = useCallback(async (imageId: string) => {
    if (!onSetPrimaryImage) {
      toast.error('Set primary function not available');
      return false;
    }

    try {
      const success = await onSetPrimaryImage(imageId);
      if (success) {
        // Update local state optimistically
        setExistingImages(prev => 
          prev.map(img => 
            img.id === imageId 
              ? { ...img, isPrimary: true }
              : { ...img, isPrimary: false }
          )
        );
        toast.success('Primary image updated successfully');
      }
      return success;
    } catch (error: any) {
      toast.error(error?.message || 'Failed to set primary image');
      return false;
    }
  }, [onSetPrimaryImage]);

  const handleFormSubmit = async (formData: CarFormData) => {
    try {
      const processedData: CarFormValues & { id?: string | number } = {
        ...formData,
        features: formData.features || [],
        id: initialData?.id,
      };

      const success = await onSubmit(processedData);
      if (success) {
        toast.success(initialData?.id ? 'Car updated successfully' : 'Car created successfully');
      }
      return success;
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save car');
      return false;
    }
  };

  const hasCarId = !!initialData?.id;

  return (
    <form 
      onSubmit={carForm.handleSubmit(handleFormSubmit)} 
      className="space-y-6"
      noValidate
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Car Name</Label>
          <Input
            id="name"
            placeholder="e.g., Tesla Model 3"
            {...carForm.register('name')}
            disabled={isSubmitting}
          />
          {carForm.formState.errors.name && (
            <p className="text-sm text-destructive mt-1">
              {carForm.formState.errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="brand">Brand</Label>
          <Input
            id="brand"
            placeholder="e.g., Tesla"
            {...carForm.register('brand')}
            disabled={isSubmitting}
          />
          {carForm.formState.errors.brand && (
            <p className="text-sm text-destructive mt-1">
              {carForm.formState.errors.brand.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <Input
            id="model"
            placeholder="e.g., Model 3"
            {...carForm.register('model')}
            disabled={isSubmitting}
          />
          {carForm.formState.errors.model && (
            <p className="text-sm text-destructive mt-1">
              {carForm.formState.errors.model.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            type="number"
            min={1900}
            max={new Date().getFullYear() + 1}
            {...carForm.register('year', { valueAsNumber: true })}
            disabled={isSubmitting}
          />
          {carForm.formState.errors.year && (
            <p className="text-sm text-destructive mt-1">
              {carForm.formState.errors.year.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="rentalPricePerDay">Price per Day ($)</Label>
          <Input
            id="rentalPricePerDay"
            type="number"
            step="0.01"
            min="1"
            {...carForm.register('rentalPricePerDay', { valueAsNumber: true })}
            disabled={isSubmitting}
          />
          {carForm.formState.errors.rentalPricePerDay && (
            <p className="text-sm text-destructive mt-1">
              {carForm.formState.errors.rentalPricePerDay.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="seats">Number of Seats</Label>
          <Input
            id="seats"
            type="number"
            min="1"
            max="10"
            {...carForm.register('seats', { valueAsNumber: true })}
            disabled={isSubmitting}
          />
          {carForm.formState.errors.seats && (
            <p className="text-sm text-destructive mt-1">
              {carForm.formState.errors.seats.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="fuelType">Fuel Type</Label>
          <Controller
            name="fuelType"
            control={carForm.control}
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select fuel type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Petrol">Petrol</SelectItem>
                  <SelectItem value="Diesel">Diesel</SelectItem>
                  <SelectItem value="Electric">Electric</SelectItem>
                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {carForm.formState.errors.fuelType && (
            <p className="text-sm text-destructive mt-1">
              {carForm.formState.errors.fuelType.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="e.g., New York, NY"
            {...carForm.register('location')}
            disabled={isSubmitting}
          />
          {carForm.formState.errors.location && (
            <p className="text-sm text-destructive mt-1">
              {carForm.formState.errors.location.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Availability</Label>
          <Controller
            name="isAvailable"
            control={carForm.control}
            render={({ field }) => (
              <div className="flex items-center space-x-2 pt-1">
                <Switch
                  id="isAvailable"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isSubmitting}
                />
                <Label htmlFor="isAvailable" className="cursor-pointer">
                  {field.value ? 'Available' : 'Not Available'}
                </Label>
              </div>
            )}
          />
        </div>
      </div>

      {/* Features & Amenities Section */}
      <div className="space-y-2">
        <Label>Features & Amenities</Label>
        <Controller
          name="features"
          control={carForm.control}
          render={({ field }) => (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-60 overflow-y-auto p-4 border rounded-lg bg-muted/50">
              {CAR_FEATURES.map((feature) => (
                <label
                  key={feature}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-accent p-2 rounded transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={field.value?.includes(feature) || false}
                    onChange={(e) => {
                      const currentFeatures = field.value || [];
                      if (e.target.checked) {
                        field.onChange([...currentFeatures, feature]);
                      } else {
                        field.onChange(currentFeatures.filter((f) => f !== feature));
                      }
                    }}
                    disabled={isSubmitting}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm">{feature}</span>
                </label>
              ))}
            </div>
          )}
        />
        <p className="text-xs text-muted-foreground">
          {carForm.watch('features')?.length || 0} feature(s) selected
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe the car..."
          className="min-h-[100px] resize-vertical"
          {...carForm.register('description')}
          disabled={isSubmitting}
        />
        {carForm.formState.errors.description && (
          <p className="text-sm text-destructive mt-1">
            {carForm.formState.errors.description.message}
          </p>
        )}
      </div>

      {hasCarId && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Car Images</h3>
            <p className="text-sm text-muted-foreground">
              Upload and manage images for this car. The first image will be used as the main display.
              {existingImages.length > 0 && (
                <> • {existingImages.length} image{existingImages.length !== 1 ? 's' : ''} uploaded</>
              )}
            </p>
          </div>
          
          <ImageUpload
            onUpload={handleImageUpload}
            existingImages={existingImages}
            onDeleteImage={handleDeleteImage}
            onSetPrimary={handleSetPrimary}
            uploadProgress={currentUploadProgress}
            isUploading={currentIsUploading}
            error={uploadError}
            maxFiles={10 - existingImages.length}
          />
        </div>
      )}

      <div className="flex justify-end space-x-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting || !carForm.formState.isValid}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {hasCarId ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>{hasCarId ? 'Update Car' : 'Create Car'}</>
          )}
        </Button>
      </div>
    </form>
  );
};

export default CarForm;