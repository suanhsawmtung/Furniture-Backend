import fs from "fs";
import path from "path";
import { ensureDir } from "./file";

const cacheDir = path.join(process.cwd(), "cache");

export const createCache = async (
  cacheName: string,
  content: string = Date.now().toString()
) => {
  await ensureDir(cacheDir);
  const filePath = path.join(cacheDir, cacheName);
  fs.writeFileSync(filePath, content);
};

export const removeCache = (cacheName: string) => {
  const filePath = path.join(cacheDir, cacheName);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

export const hasCache = (cacheName: string): boolean => {
  const filePath = path.join(cacheDir, cacheName);
  return fs.existsSync(filePath);
};

export const readCache = (cacheName: string): string | null => {
  const filePath = path.join(cacheDir, cacheName);
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, "utf-8");
  }
  return null;
};
