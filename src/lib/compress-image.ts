import imageCompression from "browser-image-compression";

export async function compressImage(file: File): Promise<File> {
  const options = {
    maxWidthOrHeight: 1920,
    maxSizeMB: 1,
    useWebWorker: true,
    fileType: file.type,
  };

  try {
    return await imageCompression(file, options);
  } catch (error) {
    console.error("Image compression failed, using original file:", error);
    return file;
  }
}
