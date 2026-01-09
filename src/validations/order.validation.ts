import { OrderStatus, PaymentStatus } from "@prisma/client";
import { body } from "express-validator";

const orderValidation = [
  body("totalPrice")
    .notEmpty()
    .withMessage("Total price is required.")
    .isFloat({ min: 0 })
    .withMessage("Total price must be a positive number."),
  body("status")
    .optional()
    .isIn(Object.values(OrderStatus))
    .withMessage(
      `Status must be one of: ${Object.values(OrderStatus).join(", ")}.`
    ),
  body("paymentStatus")
    .optional()
    .isIn(Object.values(PaymentStatus))
    .withMessage(
      `Payment status must be one of: ${Object.values(PaymentStatus).join(
        ", "
      )}.`
    ),
  body("customerName")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Customer name must be at most 100 characters."),
  body("customerPhone")
    .optional()
    .trim()
    .isLength({ max: 15 })
    .withMessage("Customer phone must be at most 15 characters."),
  body("customerAddress")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Customer address must be at most 255 characters."),
  body("customerNotes")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Customer notes must be at most 500 characters."),
  body("rejectedReason")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Rejected reason must be at most 255 characters."),
  body("products")
    .isArray({ min: 1 })
    .withMessage(
      "Products array is required and must contain at least one product."
    )
    .custom((products) => {
      if (!Array.isArray(products)) {
        return false;
      }
      return products.every((product: any) => {
        return (
          typeof product.productId === "number" &&
          product.productId > 0 &&
          typeof product.quantity === "number" &&
          product.quantity > 0 &&
          typeof product.price === "number" &&
          product.price >= 0
        );
      });
    })
    .withMessage(
      "Each product must have productId (positive integer), quantity (positive integer), and price (non-negative number)."
    ),
];

export const createOrderValidation = orderValidation;

const updateOrderValidation = [
  ...orderValidation,
  body("userId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("User ID must be a positive integer."),
];

export { updateOrderValidation };
