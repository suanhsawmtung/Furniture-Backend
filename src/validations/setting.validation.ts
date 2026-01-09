import { body } from "express-validator";

export const setMaintenanceValidation = [
  body("value")
    .notEmpty()
    .withMessage("Value is required.")
    .isIn(["on", "off"])
    .withMessage("Invalid value!"),
];
