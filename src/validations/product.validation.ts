import { Status } from "@prisma/client";
import { body } from "express-validator";

const productValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required.")
    .isLength({ min: 1, max: 255 })
    .withMessage("Name must be between 1 and 255 characters."),
  body("description").trim().notEmpty().withMessage("Description is required."),
  body("price")
    .notEmpty()
    .withMessage("Price is required.")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number."),
  body("discount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Discount must be a positive number."),
  body("inventory")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Inventory must be a non-negative integer."),
  body("status")
    .optional()
    .isIn(Object.values(Status))
    .withMessage("Status must be one of: ACTIVE, INACTIVE, FREEZE."),
  body("materialId")
    .notEmpty()
    .withMessage("Material ID is required.")
    .isInt({ min: 1 })
    .withMessage("Material ID must be a positive integer."),
  body("typeId")
    .notEmpty()
    .withMessage("Type ID is required.")
    .isInt({ min: 1 })
    .withMessage("Type ID must be a positive integer."),
];

export const createProductValidation = productValidation;

const updateProductValidation = [
  ...productValidation,
  body("imageIds")
    .optional()
    .custom((value) => {
      // Allow array, string (comma-separated), or undefined
      if (value === undefined || value === null || value === "") {
        return true;
      }
      if (Array.isArray(value)) {
        return value.every((id) => {
          const numId = Number(id);
          return !isNaN(numId) && numId > 0;
        });
      }
      if (typeof value === "string") {
        const ids = value.split(",").map((id) => Number(id.trim()));
        return ids.every((id) => !isNaN(id) && id > 0);
      }
      return false;
    })
    .withMessage(
      "Image IDs must be an array of positive numbers or a comma-separated string."
    ),
];

export { updateProductValidation };
