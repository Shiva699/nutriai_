export interface CompressImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxFileSizeBytes?: number;
}

const DEFAULT_MAX_WIDTH = 1024;
const DEFAULT_MAX_HEIGHT = 1024;
const DEFAULT_QUALITY = 0.8;
const DEFAULT_MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB

/**
 * Validates an image file before processing
 */
export function validateImageFile(
  file: File,
  maxSizeBytes = DEFAULT_MAX_FILE_SIZE
): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  if (!file.type.startsWith('image/')) {
    return {
      valid: false,
      error: 'Please upload a valid image file (JPEG, PNG, WebP).',
    };
  }

  if (file.size > maxSizeBytes) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    const maxMb = (maxSizeBytes / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `Image file is too large (${sizeMb}MB). Maximum allowed size is ${maxMb}MB.`,
    };
  }

  return { valid: true };
}

/**
 * Resizes and compresses an image file to a lightweight JPEG data URL
 */
export function compressImage(
  file: File,
  options: CompressImageOptions = {}
): Promise<string> {
  const {
    maxWidth = DEFAULT_MAX_WIDTH,
    maxHeight = DEFAULT_MAX_HEIGHT,
    quality = DEFAULT_QUALITY,
    maxFileSizeBytes = DEFAULT_MAX_FILE_SIZE,
  } = options;

  return new Promise((resolve, reject) => {
    const validation = validateImageFile(file, maxFileSizeBytes);
    if (!validation.valid) {
      return reject(new Error(validation.error));
    }

    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('Failed to read the selected image file.'));
    };

    reader.onload = () => {
      const rawDataUrl = String(reader.result);

      // In non-browser environments (e.g. Node/Vitest jsdom) or if Canvas/Image is not available,
      // fall back gracefully to the raw data URL.
      const isJsdom = typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent);
      if (
        isJsdom ||
        typeof window === 'undefined' ||
        typeof document === 'undefined' ||
        !document.createElement
      ) {
        return resolve(rawDataUrl);
      }

      const img = new Image();

      // Guard against environments where img.onload never fires
      const fallbackTimer = setTimeout(() => {
        resolve(rawDataUrl);
      }, 1000);

      img.onerror = () => {
        clearTimeout(fallbackTimer);
        // Fall back to original data URL if image decoding fails in current environment
        resolve(rawDataUrl);
      };

      img.onload = () => {
        clearTimeout(fallbackTimer);
        try {
          let { width, height } = img;

          // If dimensions are within bounds and file is already under 300KB, use original
          if (width <= maxWidth && height <= maxHeight && file.size <= 300 * 1024) {
            return resolve(rawDataUrl);
          }

          // Calculate scaled dimensions maintaining aspect ratio
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.max(1, Math.round(width * ratio));
            height = Math.max(1, Math.round(height * ratio));
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return resolve(rawDataUrl);
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Compress to JPEG for optimal photographic compression
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } catch {
          // Graceful fallback to original data URL if canvas manipulation fails
          resolve(rawDataUrl);
        }
      };

      img.src = rawDataUrl;
    };

    reader.readAsDataURL(file);
  });
}
