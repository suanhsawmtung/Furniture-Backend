import { body } from "express-validator";

export const nameValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required.")
    .isLength({ min: 1, max: 52 })
    .withMessage("Name must be between 1 and 52 characters."),
];

export const typeNameValidation = [...nameValidation];

export const materialNameValidation = [...nameValidation];

export const categoryNameValidation = [...nameValidation];

export const brandNameValidation = [...nameValidation];
