import { body } from "express-validator";

export const registerValidation = [
  body("email", "Invalid email address!")
    .trim()
    .notEmpty()
    .isEmail()
    .normalizeEmail(),
];

export const verifyOtpValidation = [
  body("email", "Invalid email address!")
    .trim()
    .notEmpty()
    .isEmail()
    .normalizeEmail(),
  body("otp", "Invalid Otp!")
    .trim()
    .notEmpty()
    .matches("^[0-9]+$")
    .isLength({ min: 6, max: 6 }),
  body("token", "Invalid token!").trim().notEmpty().escape(),
];

export const confirmPasswordValidation = [
  body("email", "Invalid email address!")
    .trim()
    .notEmpty()
    .isEmail()
    .normalizeEmail(),
  body("password", "Invalid password!")
    .trim()
    .notEmpty()
    .isLength({ min: 8, max: 12 }),
  body("token", "Invalid token!").trim().notEmpty().escape(),
];

export const loginValidation = [
  body("email", "Invalid email address!")
    .trim()
    .notEmpty()
    .isEmail()
    .normalizeEmail(),
  body("password", "Invalid password!")
    .trim()
    .notEmpty()
    .isLength({ min: 8, max: 12 }),
];

export const forgotPasswordValidation = [
  body("email", "Invalid email address!")
    .trim()
    .notEmpty()
    .isEmail()
    .normalizeEmail(),
];

export const verifyPasswordOtpValidation = verifyOtpValidation;

export const resetPasswordValidation = [
  body("email", "Invalid email address!")
    .trim()
    .notEmpty()
    .isEmail()
    .normalizeEmail(),
  body("password", "Invalid password!")
    .trim()
    .notEmpty()
    .isLength({ min: 8, max: 12 }),
  body("token", "Invalid token!").trim().notEmpty().escape(),
];

export const resendOtpValidation = [
  body("email", "Invalid email address!")
    .trim()
    .notEmpty()
    .isEmail()
    .normalizeEmail(),
];
