import { API_BASE_URL } from "../config/api";

/**
 * Converts a relative or absolute image URL to a production-compatible URL
 *
 * @param imageUrl - The image URL (can be relative, absolute, or undefined)
 * @param fallback - Fallback image path if imageUrl is not provided (default: '/placeholder-car.jpg')
 * @returns A production-compatible image URL
 *
 * @example
 * // Development: '/uploads/car.jpg' -> '/uploads/car.jpg' (proxied by Vite)
 * // Production: '/uploads/car.jpg' -> 'https://backend.com/uploads/car.jpg'
 *
 * getImageUrl('/uploads/car.jpg')
 * getImageUrl('https://example.com/image.jpg') // Returns as-is
 * getImageUrl(undefined, '/default.jpg') // Returns '/default.jpg'
 */
export const getImageUrl = (
  imageUrl: string | undefined,
  fallback: string = "/placeholder-car.jpg"
): string => {
  // Return fallback if no URL provided
  if (!imageUrl) return fallback;

  // If already a full URL (http/https), return as-is
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  // If it's a relative path starting with /uploads, prepend the API base URL
  if (imageUrl.startsWith("/uploads")) {
    // If API_BASE_URL is not configured (empty string), log a helpful warning in production
    try {
      const isProd =
        import.meta.env.MODE === "production" ||
        (import.meta.env && import.meta.env.PROD);
      if (isProd && !API_BASE_URL) {
        console.warn(
          "[MiRide] imageUtils: Image path starts with /uploads but API_BASE_URL is empty."
        );
        console.warn(
          "[MiRide] This usually means VITE_API_URL was not set in the frontend deployment."
        );
      }
    } catch (e) {
      // ignore
    }

    // Add cache-busting parameter to force fresh image loads after updates
    // Use a version parameter that changes when images are updated
    const cacheBuster = `?v=${new Date().toISOString().split('T')[0]}`;
    return `${API_BASE_URL}${imageUrl}${cacheBuster}`;
  }

  // For other cases (data URLs, relative paths, etc.), return as-is
  return imageUrl;
};

/**
 * Gets the primary image URL from a car's images array
 *
 * @param images - Array of car images
 * @param fallbackUrl - Fallback image URL
 * @returns The primary image URL or fallback
 */
export const getPrimaryImageUrl = (
  images:
    | Array<{ imageUrl: string; isPrimary?: boolean; order?: number }>
    | undefined,
  fallbackUrl?: string
): string => {
  if (!images || images.length === 0) {
    return getImageUrl(fallbackUrl);
  }

  // Find primary image
  const primaryImage = images.find((img) => img.isPrimary);
  if (primaryImage) {
    return getImageUrl(primaryImage.imageUrl);
  }

  // Sort by order and get first image
  const sortedImages = [...images].sort(
    (a, b) => (a.order || 0) - (b.order || 0)
  );
  return getImageUrl(sortedImages[0]?.imageUrl);
};

/**
 * Gets all image URLs from a car's images array, sorted by order
 *
 * @param images - Array of car images
 * @param fallbackUrl - Fallback image URL if no images exist
 * @returns Array of image URLs
 */
export const getAllImageUrls = (
  images: Array<{ imageUrl: string; order?: number }> | undefined,
  fallbackUrl: string = "/placeholder-car.jpg"
): string[] => {
  if (!images || images.length === 0) {
    return [fallbackUrl];
  }

  return [...images]
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((img) => getImageUrl(img.imageUrl));
};
