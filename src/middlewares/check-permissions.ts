import { Role } from "@prisma/client";
import { NextFunction, Response } from "express";
import { errorCode } from "../../config/error-code";
import { throwIfUserNotExistsWithoutSensitive } from "../services/auth.service";
import { findUserById, findUserRoleById } from "../services/user/user.helpers";
import { CustomRequest } from "../types/common";
import { throwIfUnauthenticated } from "../utils/auth";
import { createError } from "../utils/common";

export const permit = (permissions: boolean, ...roles: Role[]) => {
  return async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.userId) {
      throwIfUnauthenticated();
      return;
    }

    throwIfUserNotExistsWithoutSensitive(await findUserById(req.userId));

    const userRole = await findUserRoleById(req.userId);

    const result = userRole ? roles.includes(userRole) : false;

    const isAllowed = permissions && result;

    if (!isAllowed) {
      const error = createError({
        message: "This action is not allowed.",
        status: 403,
        code: errorCode.notAllowed,
      });

      return next(error);
    }

    next();
  };
};
