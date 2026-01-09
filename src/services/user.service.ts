import { Prisma, Role, Status } from "@prisma/client";
import { errorCode } from "../../config/error-code";
import { hash } from "../lib/hash";
import { prisma } from "../lib/prisma";
import { generateCode } from "../lib/unique-key-generator";
import {
  CreateUserParams,
  ListUsersParams,
  ParseUserQueryParamsResult,
  UpdateUserParams,
  UpdateUserRoleParams,
  UpdateUserStatusParams,
} from "../types/user";
import { createError, createSlug } from "../utils/common";
import { getFilePath, removeFile } from "../utils/file";

export const getAllUsers = async ({
  pageSize,
  offset,
  search,
  role,
  status,
}: ListUsersParams) => {
  const whereConditions: Prisma.UserWhereInput[] = [];

  if (search) {
    whereConditions.push({
      OR: [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { username: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  if (role) {
    whereConditions.push({ role });
  }

  if (status) {
    whereConditions.push({ status });
  }

  const where: Prisma.UserWhereInput =
    whereConditions.length > 0
      ? {
          AND: whereConditions,
        }
      : {};

  // Get total count for pagination
  const total = await prisma.user.count({ where });

  // Calculate total pages
  const totalPages = Math.ceil(total / pageSize);

  // Calculate current page (0-based offset to 1-based page)
  const currentPage = Math.floor(offset / pageSize) + 1;

  // Fetch users with offset pagination
  const items = await prisma.user.findMany({
    where,
    take: pageSize,
    skip: offset,
    orderBy: { id: "desc" },
    omit: {
      password: true,
      randToken: true,
      errorLoginCount: true,
    },
  });

  return {
    items,
    currentPage,
    totalPages,
    pageSize,
  };
};

export const getUserById = async (id: number) => {
  return await prisma.user.findUnique({
    where: { id },
    omit: {
      password: true,
      randToken: true,
      errorLoginCount: true,
    },
  });
};

export const getUserByIdWithSensitive = async (id: number) => {
  return await prisma.user.findUnique({
    where: { id },
  });
};

export const getUserRoleById = async (id: number) => {
  return (
    await prisma.user.findUnique({
      where: { id },
      select: {
        role: true,
      },
    })
  )?.role;
};

// export const getUserByPhone = async (phone: string) => {
//   return await prisma.user.findUnique({
//     where: { phone },
//   });
// };

export const getUserByEmail = async (email: string) => {
  return await prisma.user.findUnique({
    where: { email },
  });
};

export const getUserByUsername = async (username: string) => {
  return await prisma.user.findUnique({
    where: { username },
  });
};

// export const getUserByPhoneExcludingId = async (
//   phone: string,
//   excludeId: number
// ) => {
//   return await prisma.user.findFirst({
//     where: {
//       phone,
//       NOT: { id: excludeId },
//     },
//   });
// };

export const getUserByEmailExcludingId = async (
  email: string,
  excludeId: number
) => {
  return await prisma.user.findFirst({
    where: {
      email,
      NOT: { id: excludeId },
    },
  });
};

export const getUserByUsernameExcludingId = async (
  username: string,
  excludeId: number
) => {
  return await prisma.user.findFirst({
    where: {
      username,
      NOT: { id: excludeId },
    },
  });
};

export const createUser = async (createUserData: Prisma.UserCreateInput) => {
  return await prisma.user.create({
    data: createUserData,
    omit: {
      password: true,
      randToken: true,
      errorLoginCount: true,
    },
  });
};

export const updateUser = async (
  id: number,
  updateUserData: Prisma.UserUpdateInput
) => {
  return await prisma.user.update({
    where: { id },
    data: updateUserData,
    omit: {
      password: true,
      randToken: true,
      errorLoginCount: true,
    },
  });
};

export const updateUserRole = async (id: number, role: Role) => {
  return await prisma.user.update({
    where: { id },
    data: { role },
    omit: {
      password: true,
      randToken: true,
      errorLoginCount: true,
    },
  });
};

export const updateUserStatus = async (id: number, status: Status) => {
  return await prisma.user.update({
    where: { id },
    data: { status },
    omit: {
      password: true,
      randToken: true,
      errorLoginCount: true,
    },
  });
};

export const deleteUser = async (id: number) => {
  return await prisma.user.delete({
    where: { id },
  });
};

// Validation and checking functions that call simple service functions

export const validateAndGetUserById = async (id: number) => {
  if (isNaN(id) || id <= 0) {
    throw createError({
      message: "Invalid user ID.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  const user = await getUserById(id);

  if (!user) {
    throw createError({
      message: "User not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  return user;
};

export const validateAndGetUserByUsername = async (username: string) => {
  if (!username || !username.trim()) {
    throw createError({
      message: "Invalid username.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  const user = await getUserByUsername(username.trim().toLowerCase());

  if (!user) {
    throw createError({
      message: "User not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  return user;
};

export const generateUsername = async (
  firstName: string | null | undefined,
  lastName: string | null | undefined
): Promise<string> => {
  let baseSlug: string;

  if (firstName && lastName) {
    // Both exist: "firstname-lastname"
    baseSlug = createSlug(`${firstName} ${lastName}`);
  } else if (firstName) {
    // Only firstName exists
    baseSlug = createSlug(firstName);
  } else if (lastName) {
    // Only lastName exists
    baseSlug = createSlug(lastName);
  } else {
    // Neither exists: generate random unique code
    baseSlug = generateCode(8);
  }

  // Ensure uniqueness - keep trying until we get a unique username
  let username = baseSlug;
  let existingUser = await getUserByUsername(username);
  let attempts = 0;
  const maxAttempts = 10;

  while (existingUser && attempts < maxAttempts) {
    const randomCode = generateCode(2);
    username = `${baseSlug}-${randomCode}`;
    existingUser = await getUserByUsername(username);
    attempts++;
  }

  // If still exists after max attempts, use timestamp-based suffix
  if (existingUser) {
    const timestamp = Date.now().toString(36);
    username = `${baseSlug}-${timestamp}`;
  }

  return username;
};

export const validateAndCreateUser = async (params: CreateUserParams) => {
  const { firstName, lastName, phone, email, role, status } = params;

  // Email is required
  if (!email || !email.trim()) {
    throw createError({
      message: "Email is required.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  const trimmedEmail = email.trim().toLowerCase();
  const trimmedPhone = phone ? phone.trim() : null;
  const trimmedFirstName = firstName ? firstName.trim() : null;
  const trimmedLastName = lastName ? lastName.trim() : null;

  // Check if email already exists
  const existingByEmail = await getUserByEmail(trimmedEmail);
  if (existingByEmail) {
    throw createError({
      message: "User with this email already exists.",
      status: 409,
      code: errorCode.alreadyExists,
    });
  }

  // Generate username from firstName and lastName
  const username = await generateUsername(trimmedFirstName, trimmedLastName);

  // Default password
  const defaultPassword = "12345678";
  const hashedPassword = await hash(defaultPassword);
  const randToken = generateCode(16);

  const user = await createUser({
    firstName: trimmedFirstName,
    lastName: trimmedLastName,
    username,
    phone: trimmedPhone,
    email: trimmedEmail,
    password: hashedPassword,
    randToken,
    role,
    status,
  });

  return user;
};

export const validateAndUpdateUser = async (
  username: string,
  params: UpdateUserParams
) => {
  const { firstName, lastName, phone, email, role, status } = params;

  if (!username || !username.trim()) {
    throw createError({
      message: "Username parameter is required.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  // Check if user exists by username
  const existing = await getUserByUsername(username.trim().toLowerCase());
  if (!existing) {
    throw createError({
      message: "User not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  // Email is required
  if (!email || !email.trim()) {
    throw createError({
      message: "Email is required.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  const trimmedEmail = email.trim().toLowerCase();
  const trimmedPhone = phone ? phone.trim() : null;
  const trimmedFirstName = firstName ? firstName.trim() : null;
  const trimmedLastName = lastName ? lastName.trim() : null;

  // Check if email already exists (excluding current user)
  const existingByEmail = await getUserByEmailExcludingId(
    trimmedEmail,
    existing.id
  );
  if (existingByEmail) {
    throw createError({
      message: "User with this email already exists.",
      status: 409,
      code: errorCode.alreadyExists,
    });
  }

  // Generate new username from firstName and lastName
  const newUsername = await generateUsername(trimmedFirstName, trimmedLastName);

  // If the generated username is different from current, check if it exists
  if (newUsername !== existing.username) {
    const existingByUsername = await getUserByUsername(newUsername);
    if (existingByUsername) {
      throw createError({
        message: "User with this username already exists.",
        status: 409,
        code: errorCode.alreadyExists,
      });
    }
  }

  const user = await updateUser(existing.id, {
    firstName: trimmedFirstName,
    lastName: trimmedLastName,
    username: newUsername,
    phone: trimmedPhone,
    email: trimmedEmail,
    role,
    status,
  });

  return user;
};

export const validateAndUpdateUserRole = async (
  username: string,
  params: UpdateUserRoleParams
) => {
  const { role } = params;

  if (!username || !username.trim()) {
    throw createError({
      message: "Username parameter is required.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  // Check if user exists by username
  const existing = await getUserByUsername(username.trim().toLowerCase());
  if (!existing) {
    throw createError({
      message: "User not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  const user = await updateUserRole(existing.id, role);

  return user;
};

export const validateAndUpdateUserStatus = async (
  username: string,
  params: UpdateUserStatusParams
) => {
  const { status } = params;

  if (!username || !username.trim()) {
    throw createError({
      message: "Username parameter is required.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  // Check if user exists by username
  const existing = await getUserByUsername(username.trim().toLowerCase());
  if (!existing) {
    throw createError({
      message: "User not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  const user = await updateUserStatus(existing.id, status);

  return user;
};

export const validateAndDeleteUser = async (username: string) => {
  if (!username || !username.trim()) {
    throw createError({
      message: "Username parameter is required.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  // Check if user exists by username
  const existing = await getUserByUsername(username.trim().toLowerCase());
  if (!existing) {
    throw createError({
      message: "User not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  // Remove image file if exists
  if (existing.image) {
    const imagePath = getFilePath("uploads", "images", "user", existing.image);
    removeFile(imagePath);
  }

  await deleteUser(existing.id);
};

export const parseUserQueryParams = (
  query: any
): ParseUserQueryParamsResult => {
  const pageSizeParam = Number(query.pageSize);
  const pageSize =
    Number.isNaN(pageSizeParam) || pageSizeParam <= 0
      ? 10
      : Math.min(pageSizeParam, 50);

  const offsetParam = Number(query.offset);
  const offset = Number.isNaN(offsetParam) || offsetParam < 0 ? 0 : offsetParam;

  const search =
    typeof query.search === "string" && query.search.trim().length > 0
      ? query.search.trim()
      : undefined;

  let role: Role | undefined;
  if (typeof query.role === "string") {
    const roleValue = query.role.toUpperCase();
    if (Object.values(Role).includes(roleValue as Role)) {
      role = roleValue as Role;
    }
  }

  let status: Status | undefined;
  if (typeof query.status === "string") {
    const statusValue = query.status.toUpperCase();
    if (Object.values(Status).includes(statusValue as Status)) {
      status = statusValue as Status;
    }
  }

  return {
    pageSize,
    offset,
    search,
    role,
    status,
  };
};
