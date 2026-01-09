import { errorCode } from "../../config/error-code";
import { createError } from "../utils/common";

export const fileUploadError = () => {
  const error = createError({
    message: "No file uploaded!",
    status: 400,
    code: errorCode.invalid,
  });

  return error;
};
