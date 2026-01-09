import { Role } from "@prisma/client";
import { authProcessErrorCode, errorCode } from "../../config/error-code";
import { createError } from "./common";

export const handleExpiredOtp = () => {
  const error = createError({
    message: "Otp is expired!",
    status: 400,
    code: authProcessErrorCode.expiredOtp,
  });

  throw error;
};

export const checkOtpErrorCountLimits = (errorCount: number) => {
  if (errorCount === 5) {
    const error = createError({
      message: "OTP is wrong for 5 times. Please try again tomorrow",
      status: 429,
      code: authProcessErrorCode.otpErrorCountLimitExceeded,
    });

    throw error;
  }
};

export const throwInvalidCredentialsError = () => {
  const error = createError({
    message: "Password is incorrect.",
    status: 400,
    code: errorCode.invalid,
  });

  throw error;
};

export const throwIfUnauthenticated = () => {
  const error = createError({
    message: "You are not an authenticated user.",
    status: 401,
    code: errorCode.unauthenticated,
  });

  throw error;
};

export const authorise = (
  permission: boolean,
  userRole: Role,
  ...roles: Role[]
) => {
  if (!permission) return false;
  return roles.includes(userRole);
};
