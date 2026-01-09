import { body } from "express-validator";

const postValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required.")
    .isLength({ min: 1, max: 255 })
    .withMessage("Title must be between 1 and 255 characters."),
  body("content").trim().notEmpty().withMessage("Content is required."),
  body("body").trim().notEmpty().withMessage("Body is required."),
  body("categoryId")
    .notEmpty()
    .withMessage("Category is required.")
    .isInt({ min: 1 })
    .withMessage("Category ID must be a positive integer."),
];

export const createPostValidation = postValidation;
export const updatePostValidation = postValidation;
