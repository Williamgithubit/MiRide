import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';

type FileWithPreview = File & {
  preview: string;
};

interface ImageUploadProps {
  maxFiles?: number;
  maxSize?: number; // in MB
  accept?: string[];
  onUpload: (files: File[]) => Promise<void>;
  existingImages?: Array<{
    id: string;
    imageUrl: string;
    isPrimary: boolean;
  }>;
  onDeleteImage?: (imageId: string) => void;
  onSetPrimary?: (imageId: string) => void;
  uploadProgress?: number;
  isUploading?: boolean;
  error?: string | null;
  autoUpload?: boolean; // If false, files are just selected without auto-uploading
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  maxFiles = 5,
  maxSize = 5, // 5MB
  accept = ['image/jpeg', 'image/png', 'image/webp'],
  onUpload,
  existingImages = [],
  onDeleteImage,
  onSetPrimary,
  uploadProgress = 0,
  isUploading = false,
  error = null,
  autoUpload = true,
}) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(error);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: any[]) => {
      setErrorMessage(null);
      
      // Handle file rejections
      if (fileRejections.length > 0) {
        const rejection = fileRejections[0];
        if (rejection.errors[0].code === 'file-too-large') {
          setErrorMessage(`File is too large. Max size is ${maxSize}MB`);
          return;
        }
        if (rejection.errors[0].code === 'file-invalid-type') {
          setErrorMessage('Invalid file type');
          return;
        }
        setErrorMessage('Error uploading files');
        return;
      }

      // Limit the number of files
      const remainingSlots = maxFiles - (existingImages.length + files.length);
      if (acceptedFiles.length > remainingSlots) {
        setErrorMessage(`You can only upload ${remainingSlots} more file(s)`);
        return;
      }

      // Add preview URLs to the files
      const filesWithPreview = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );

      const newFiles = [...files, ...filesWithPreview];
      setFiles(newFiles);
      
      // If autoUpload is false, immediately call onUpload with the files
      if (!autoUpload) {
        onUpload(newFiles);
      }
    },
    [maxFiles, existingImages.length, files.length, maxSize, autoUpload, onUpload, files]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize: maxSize * 1024 * 1024, // Convert MB to bytes
    multiple: true,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    onDropAccepted: () => setIsDragging(false),
    onDropRejected: () => setIsDragging(false),
  });

  const removeFile = (index: number) => {
    const newFiles = [...files];
    URL.revokeObjectURL(newFiles[index].preview);
    newFiles.splice(index, 1);
    setFiles(newFiles);
    
    // Update parent component if not auto-uploading
    if (!autoUpload) {
      onUpload(newFiles);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    try {
      await onUpload(files);
      setFiles([]);
      setErrorMessage(null);
    } catch (err) {
      setErrorMessage('Failed to upload images. Please try again.');
    }
  };

  // Clean up object URLs to avoid memory leaks
  React.useEffect(() => {
    return () => {
      files.forEach((file) => URL.revokeObjectURL(file.preview));
    };
  }, [files]);

  const allImages = [
    ...existingImages.map((img) => ({
      id: img.id,
      preview: img.imageUrl,
      isPrimary: img.isPrimary,
      isExisting: true,
    })),
    ...files.map((file, index) => ({
      id: `new-${index}`,
      preview: file.preview,
      isPrimary: false,
      isExisting: false,
    })),
  ];

  const canUploadMore = allImages.length < maxFiles;

  return (
    <div className="space-y-4">
      <div
        {...getRootProps({
          onClick: (e) => {
            if (!canUploadMore) {
              e.stopPropagation();
              setErrorMessage(`Maximum of ${maxFiles} images allowed`);
            }
          }
        })}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${!canUploadMore ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} disabled={!canUploadMore} />
        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload className="w-8 h-8 text-gray-400" />
          <div className="text-sm text-gray-600">
            {isDragActive ? (
              <p>Drop the files here ...</p>
            ) : (
              <p>
                Drag & drop {canUploadMore ? 'some files' : ''} here, or click to select files
                <br />
                <span className="text-xs text-gray-500">
                  {accept.join(', ')} (max {maxSize}MB each, up to {maxFiles} files)
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      {(errorMessage || error) && (
        <div className="text-red-500 text-sm mt-2">{errorMessage || error}</div>
      )}

      {isUploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Uploading...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {allImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
          {allImages.map((img, index) => (
            <div
              key={img.id}
              className={`relative group rounded-md overflow-hidden border ${
                img.isPrimary ? 'ring-2 ring-blue-500' : 'border-gray-200'
              }`}
            >
              <div className="aspect-w-1 aspect-h-1">
                <img
                  src={img.preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex space-x-2">
                  {onDeleteImage && img.isExisting && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteImage(img.id);
                      }}
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      title="Delete image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  
                  {!img.isExisting && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index - existingImages.length);
                      }}
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  
                  {onSetPrimary && !img.isPrimary && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSetPrimary(img.id);
                      }}
                      className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                      title="Set as primary"
                    >
                      <ImageIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              
              {img.isPrimary && (
                <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                  Primary
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && autoUpload && (
        <div className="flex justify-end mt-4">
          <Button
            type="button"
            onClick={handleUpload}
            disabled={isUploading || files.length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isUploading ? 'Uploading...' : `Upload ${files.length} file(s)`}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
