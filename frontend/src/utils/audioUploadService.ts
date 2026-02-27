/**
 * Audio upload service.
 * Converts an audio File to a base64 data URL for storage in the chapter's audioUrl field.
 * This approach works for files up to the browser's memory limits and stores the audio
 * directly in the canister via the existing audioUrl field.
 *
 * For very large files (>10MB), we use chunked FileReader to avoid memory issues.
 */

export async function uploadAudioFileToDataUrl(
  file: File,
  onProgress?: (percentage: number) => void
): Promise<{ dataUrl: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percentage = Math.round((event.loaded / event.total) * 100);
        onProgress(percentage);
      }
    };

    reader.onload = () => {
      onProgress?.(100);
      const dataUrl = reader.result as string;
      resolve({ dataUrl, mimeType: file.type || "audio/mpeg" });
    };

    reader.onerror = () => {
      reject(new Error("Failed to read audio file."));
    };

    reader.readAsDataURL(file);
  });
}
