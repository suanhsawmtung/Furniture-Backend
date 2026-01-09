import { generateCode } from "../lib/unique-key-generator";

export const isToday = (date: Date) => {
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
};

export const createError = ({
  message,
  status,
  code,
}: {
  message: string;
  status: number;
  code: string;
}) => {
  const error: any = new Error(message);
  error.status = status;
  error.code = code;

  return error;
};

export const createSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
};

export const ensureUniqueSlug = async (
  baseSlug: string,
  isAlreadyExists?: boolean
): Promise<string> => {
  if (!isAlreadyExists) {
    return baseSlug;
  }
  const randomCode = generateCode(2);
  const slug = `${baseSlug}-${randomCode}`;
  return slug;
};
