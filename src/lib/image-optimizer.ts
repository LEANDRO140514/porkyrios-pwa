/**
 * Client-side image optimizer.
 * Converts JPG/PNG/GIF → WebP, resizes to max 800px width (proportional),
 * and compresses at quality 0.8. Target output: 40–80 KB.
 */
export async function optimizeImage(file: File): Promise<{ blob: Blob; size: number }> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const MAX_WIDTH = 800;
      let { width, height } = img;

      if (width > MAX_WIDTH) {
        height = Math.round((height * MAX_WIDTH) / width);
        width = MAX_WIDTH;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Could not get canvas context"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(objectUrl);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve({ blob, size: blob.size });
          } else {
            reject(new Error("Canvas toBlob returned null"));
          }
        },
        "image/webp",
        0.8
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image for optimization"));
    };

    img.src = objectUrl;
  });
}
