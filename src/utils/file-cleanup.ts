import { Request } from "express";
import { getFilePath, removeFile } from "./file";

export interface UploadedFileInfo {
  filename: string;
  subDir: string; // "post", "product", or "" for profile
}

// Track uploaded file in request
export const trackUploadedFile = (
  req: Request,
  filename: string,
  subDir: string = ""
) => {
  if (!(req as any).uploadedFiles) {
    (req as any).uploadedFiles = [];
  }
  (req as any).uploadedFiles.push({ filename, subDir });
};

// Clean up all tracked uploaded files
export const cleanupUploadedFiles = async (req: Request) => {
  const uploadedFiles = (req as any).uploadedFiles as UploadedFileInfo[];
  if (!uploadedFiles || uploadedFiles.length === 0) {
    return;
  }

  for (const fileInfo of uploadedFiles) {
    const filePath = getFilePath(
      "uploads",
      "images",
      fileInfo.subDir,
      fileInfo.filename
    );
    await removeFile(filePath);
  }

  // Clear the tracked files
  (req as any).uploadedFiles = [];
};

// Clean up a specific uploaded file
export const cleanupUploadedFile = async (
  filename: string,
  subDir: string = ""
) => {
  const filePath = getFilePath("uploads", "images", subDir, filename);
  await removeFile(filePath);
};
