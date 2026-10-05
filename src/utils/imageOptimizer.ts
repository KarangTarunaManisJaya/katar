/**
 * Utility to compress and optimize images before storing in Firestore and localStorage.
 * Prevents localStorage QuotaExceededError and Firestore 1MB document size limits.
 * High visual fidelity on Retina & mobile screens with dramatic size reduction (~50KB vs 5-10MB).
 */

export async function compressImage(
  source: File | string,
  maxDimension = 1000,
  quality = 0.78
): Promise<string> {
  // If already a static asset path or http URL, keep as is
  if (typeof source === 'string') {
    if (source.startsWith('http://') || source.startsWith('https://') || source.startsWith('/')) {
      return source;
    }
    // If it's already a very small data url (under 40KB), no need to recompress
    if (source.startsWith('data:image/') && source.length < 55000) {
      return source;
    }
  }

  return new Promise((resolve) => {
    const img = new Image();

    const processImage = () => {
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width <= 0 || height <= 0) {
          resolve(typeof source === 'string' ? source : '');
          return;
        }

        // Calculate scaling
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(typeof source === 'string' ? source : '');
          return;
        }

        // Smooth resampling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to lightweight JPEG
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      } catch (err) {
        console.warn('Image compression fallback:', err);
        resolve(typeof source === 'string' ? source : '');
      }
    };

    img.onload = processImage;
    img.onerror = () => {
      resolve(typeof source === 'string' ? source : '');
    };

    if (typeof source === 'string') {
      img.src = source;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
          img.src = e.target.result;
        } else {
          resolve('');
        }
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(source);
    }
  });
}

export async function compressMultipleImages(
  files: FileList | File[],
  maxDimension = 1000,
  quality = 0.75
): Promise<string[]> {
  const fileArray = Array.from(files);
  const promises = fileArray.map((file) => compressImage(file, maxDimension, quality));
  return Promise.all(promises);
}
