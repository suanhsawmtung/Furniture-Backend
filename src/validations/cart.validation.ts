import { body } from "express-validator";

export const cartValidation = [
    body("items")
        .isArray({ min: 1 })
        .withMessage("Items must be a non-empty array."),

    body("items.*.productVariantId")
        .exists()
        .withMessage("Product variant ID is required.")
        .isInt({ min: 1 })
        .withMessage("Product variant ID must be a positive integer."),

    body("items.*.quantity")
        .exists()
        .withMessage("Quantity is required.")
        .isInt({ min: 1 })
        .withMessage("Quantity must be a positive integer."),
]