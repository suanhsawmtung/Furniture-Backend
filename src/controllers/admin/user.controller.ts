import { NextFunction, Response } from "express";
import { errorCode } from "../../../config/error-code";
import {
  getAllUsers,
  parseUserQueryParams,
  validateAndCreateUser,
  validateAndDeleteUser,
  validateAndGetUserById,
  validateAndGetUserByUsername,
  validateAndUpdateUser,
  validateAndUpdateUserRole,
  validateAndUpdateUserStatus,
} from "../../services/user.service";
import { CustomRequest } from "../../types/common";
import { createError } from "../../utils/common";

export const getAllUsersController = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const queryParams = parseUserQueryParams(req.query);

    const {
      items: users,
      currentPage,
      totalPages,
      pageSize,
    } = await getAllUsers(queryParams);

    res.status(200).json({
      success: true,
      data: {
        users,
        currentPage,
        totalPages,
        pageSize,
      },
      message: null,
    });
  } catch (error: any) {
    next(error);
  }
};

export const getUserByIdController = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id) {
      const error = createError({
        message: "User ID parameter is required.",
        status: 400,
        code: errorCode.invalid,
      });
      return next(error);
    }

    const userId = parseInt(id, 10);
    const user = await validateAndGetUserById(userId);

    res.status(200).json({
      success: true,
      data: { user },
      message: null,
    });
  } catch (error: any) {
    next(error);
  }
};

export const getUserByUsernameController = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username } = req.params;

    if (!username) {
      const error = createError({
        message: "Username parameter is required.",
        status: 400,
        code: errorCode.invalid,
      });
      return next(error);
    }

    const user = await validateAndGetUserByUsername(username);

    res.status(200).json({
      success: true,
      data: { user },
      message: null,
    });
  } catch (error: any) {
    next(error);
  }
};

export const createUserController = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { firstName, lastName, phone, email, role, status } = req.body;

    const user = await validateAndCreateUser({
      firstName,
      lastName,
      phone,
      email,
      role,
      status,
    });

    res.status(201).json({
      success: true,
      data: { user },
      message: "User created successfully.",
    });
  } catch (error: any) {
    next(error);
  }
};

export const updateUserController = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username } = req.params;

    if (!username) {
      const error = createError({
        message: "Username parameter is required.",
        status: 400,
        code: errorCode.invalid,
      });
      return next(error);
    }

    const { firstName, lastName, phone, email, role, status } = req.body;

    const user = await validateAndUpdateUser(username, {
      firstName,
      lastName,
      phone,
      email,
      role,
      status,
    });

    res.status(200).json({
      success: true,
      data: { user },
      message: "User updated successfully.",
    });
  } catch (error: any) {
    next(error);
  }
};

export const updateUserRoleController = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username } = req.params;

    if (!username) {
      const error = createError({
        message: "Username parameter is required.",
        status: 400,
        code: errorCode.invalid,
      });
      return next(error);
    }

    const { role } = req.body;

    const user = await validateAndUpdateUserRole(username, {
      role,
    });

    res.status(200).json({
      success: true,
      data: { user },
      message: "User role updated successfully.",
    });
  } catch (error: any) {
    next(error);
  }
};

export const updateUserStatusController = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username } = req.params;

    if (!username) {
      const error = createError({
        message: "Username parameter is required.",
        status: 400,
        code: errorCode.invalid,
      });
      return next(error);
    }

    const { status } = req.body;

    const user = await validateAndUpdateUserStatus(username, {
      status,
    });

    res.status(200).json({
      success: true,
      data: { user },
      message: "User status updated successfully.",
    });
  } catch (error: any) {
    next(error);
  }
};

export const deleteUserController = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username } = req.params;

    if (!username) {
      const error = createError({
        message: "Username parameter is required.",
        status: 400,
        code: errorCode.invalid,
      });
      return next(error);
    }

    await validateAndDeleteUser(username);

    res.status(200).json({
      success: true,
      data: null,
      message: "User deleted successfully.",
    });
  } catch (error: any) {
    next(error);
  }
};
