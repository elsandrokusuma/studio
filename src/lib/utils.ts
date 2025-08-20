import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getGoogleDriveImageSrc(url: string | undefined | null): string {
  if (!url || !url.includes('drive.google.com')) {
    return "";
  }
  
  // This regex is more robust and handles various Google Drive URL formats.
  const regex = /drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/;
  const match = url.match(regex);

  if (match && match[1]) {
    const fileId = match[1];
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  return "";
}

    