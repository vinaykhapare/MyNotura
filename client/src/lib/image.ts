/**
 * Image optimization utilities for user avatars and uploads.
 * Downscales images to max dimensions and compresses via Canvas to reduce bandwidth and storage.
 */

export interface OptimizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: 'image/webp' | 'image/jpeg';
}

export async function optimizeImage(
  file: File,
  options: OptimizeOptions = {}
): Promise<File> {
  const {
    maxWidth = 512,
    maxHeight = 512,
    quality = 0.85,
    mimeType = 'image/jpeg',
  } = options;

  // If not an image, return as-is
  if (!file.type.startsWith('image/')) {
    return file;
  }

  // If it's an SVG or GIF, don't re-compress to preserve animation/vector
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Calculate scaled dimensions while preserving aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        // Fallback to original file if 2d context is unavailable
        resolve(file);
        return;
      }

      // Fill transparent backgrounds with black or keep clean
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }

          // If optimized blob is larger than original file, keep original
          if (blob.size >= file.size && file.size < 1024 * 1024) {
            resolve(file);
            return;
          }

          const extension = mimeType === 'image/webp' ? 'webp' : 'jpg';
          const optimizedFileName = file.name.replace(/\.[^/.]+$/, `.${extension}`);

          const optimizedFile = new File([blob], optimizedFileName, {
            type: mimeType,
            lastModified: Date.now(),
          });

          resolve(optimizedFile);
        },
        mimeType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file); // Fallback to original on load error
    };

    img.src = objectUrl;
  });
}
