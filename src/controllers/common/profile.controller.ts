import { NextFunction, Response } from "express";
import { throwIfUserNotExistsWithoutSensitive } from "../../services/auth.service";
import { fileUploadError } from "../../services/file.service";
import { findUserById, updateUserRecord } from "../../services/user/user.helpers";
import { CustomRequest } from "../../types/common";
import { getFilePath, removeFile } from "../../utils/file";

export const uploadProfile = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = req.userId;
  const user = throwIfUserNotExistsWithoutSensitive(
    userId ? await findUserById(userId) : null
  );

  const file = req.file;

  if (!file) throw fileUploadError();

  if (user.image) {
    const filePath = getFilePath("uploads", "images", "user", user.image);
    removeFile(filePath);
  }

  await updateUserRecord(user.id, {
    image: file.filename,
  });

  res.status(200).json({ message: "Uploaded file successfully!" });
};
