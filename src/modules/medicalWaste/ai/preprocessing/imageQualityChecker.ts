import { ImageQualityAssessment } from '../../types/wasteTypes';

export async function checkImageQuality(imageBase64: string): Promise<ImageQualityAssessment> {
  const defaultFail: ImageQualityAssessment = {
    passed: false,
    score: 0.2,
    isBlurry: false,
    isDark: false,
    isOverexposed: false,
    objectTooSmall: false,
    noRelevantObject: true,
    multipleUnrelatedObjects: false,
    poorFraming: true,
    message: 'Image quality is insufficient. Please capture a clearer image.'
  };

  if (!imageBase64 || imageBase64.length < 150) {
    return defaultFail;
  }

  // If in browser environment with HTMLImageElement and Canvas available
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    return new Promise<ImageQualityAssessment>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      const timeout = setTimeout(() => {
        resolve(defaultFail);
      }, 3000);

      img.onload = () => {
        clearTimeout(timeout);
        try {
          const width = img.naturalWidth || img.width;
          const height = img.naturalHeight || img.height;

          if (width < 64 || height < 64) {
            resolve({
              passed: false,
              score: 0.15,
              isBlurry: true,
              isDark: false,
              isOverexposed: false,
              objectTooSmall: true,
              noRelevantObject: true,
              multipleUnrelatedObjects: false,
              poorFraming: true,
              message: 'Image resolution is too low. Please capture a clearer image.'
            });
            return;
          }

          // Sample down to max 256x256 for rapid image quality metrics
          const sampleW = Math.min(width, 256);
          const sampleH = Math.min(height, 256);
          const canvas = document.createElement('canvas');
          canvas.width = sampleW;
          canvas.height = sampleH;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });

          if (!ctx) {
            resolve(defaultFail);
            return;
          }

          ctx.drawImage(img, 0, 0, sampleW, sampleH);
          const imageData = ctx.getImageData(0, 0, sampleW, sampleH);
          const data = imageData.data;
          const pixelCount = sampleW * sampleH;

          let totalLuminance = 0;
          let darkPixels = 0;
          let brightPixels = 0;
          const grays = new Float32Array(pixelCount);

          for (let i = 0; i < pixelCount; i++) {
            const r = data[i * 4];
            const g = data[i * 4 + 1];
            const b = data[i * 4 + 2];
            // Standard relative luminance
            const lum = 0.299 * r + 0.587 * g + 0.114 * b;
            grays[i] = lum;
            totalLuminance += lum;
            if (lum < 35) darkPixels++;
            if (lum > 240) brightPixels++;
          }

          const meanLuminance = totalLuminance / pixelCount;
          const darkRatio = darkPixels / pixelCount;
          const brightRatio = brightPixels / pixelCount;

          // Estimate blurriness using Discrete Laplacian gradient variance
          let laplacianSum = 0;
          let laplacianSqSum = 0;
          let edgeCount = 0;

          for (let y = 1; y < sampleH - 1; y++) {
            for (let x = 1; x < sampleW - 1; x++) {
              const idx = y * sampleW + x;
              const val =
                -4 * grays[idx] +
                grays[idx - 1] +
                grays[idx + 1] +
                grays[idx - sampleW] +
                grays[idx + sampleW];
              laplacianSum += val;
              laplacianSqSum += val * val;
              edgeCount++;
            }
          }

          const meanLap = laplacianSum / (edgeCount || 1);
          const varianceLap = (laplacianSqSum / (edgeCount || 1)) - meanLap * meanLap;

          // Foreground variance (checks if image is completely uniform / blank)
          let fgSum = 0;
          for (let i = 0; i < pixelCount; i++) {
            const diff = grays[i] - meanLuminance;
            fgSum += diff * diff;
          }
          const stdDev = Math.sqrt(fgSum / pixelCount);

          const isDark = meanLuminance < 36 || darkRatio > 0.82;
          const isOverexposed = meanLuminance > 242 || brightRatio > 0.82;
          const isBlurry = varianceLap < 32.0;
          const noRelevantObject = stdDev < 11.0; // Flat background / no object in frame
          const objectTooSmall = stdDev < 15.0 && (darkRatio > 0.7 || brightRatio > 0.7);
          const poorFraming = isBlurry || isDark || isOverexposed || noRelevantObject;

          const issues: string[] = [];
          if (isDark) issues.push('Too dark lighting');
          if (isOverexposed) issues.push('Harsh glare or overexposed');
          if (isBlurry) issues.push('Image is too blurry');
          if (noRelevantObject) issues.push('No distinct object detected');
          if (objectTooSmall) issues.push('Object appears too small or off-center');

          const passed = !isDark && !isOverexposed && !isBlurry && !noRelevantObject;
          let score = 0.95;
          if (isDark) score -= 0.35;
          if (isOverexposed) score -= 0.3;
          if (isBlurry) score -= 0.35;
          if (noRelevantObject) score -= 0.4;
          if (objectTooSmall) score -= 0.25;
          score = Math.max(0.1, Math.min(0.99, score));

          const message = passed
            ? 'Image quality verified for medical waste classification.'
            : `Image quality is insufficient (${issues.join(', ')}). Please capture a clearer image.`;

          resolve({
            passed,
            score: Math.round(score * 100) / 100,
            isBlurry,
            isDark,
            isOverexposed,
            objectTooSmall,
            noRelevantObject,
            multipleUnrelatedObjects: false,
            poorFraming,
            message
          });
        } catch {
          resolve(defaultFail);
        }
      };

      img.onerror = () => {
        clearTimeout(timeout);
        resolve(defaultFail);
      };

      img.src = imageBase64;
    });
  }

  // Node.js or non-browser fallback: check base64 length & minimal sanity
  const isHealthyBase64 = imageBase64.length > 5000;
  return {
    passed: isHealthyBase64,
    score: isHealthyBase64 ? 0.88 : 0.25,
    isBlurry: false,
    isDark: false,
    isOverexposed: false,
    objectTooSmall: !isHealthyBase64,
    noRelevantObject: !isHealthyBase64,
    multipleUnrelatedObjects: false,
    poorFraming: !isHealthyBase64,
    message: isHealthyBase64
      ? 'Image quality sufficient.'
      : 'Image quality is insufficient. Please capture a clearer image.'
  };
}
