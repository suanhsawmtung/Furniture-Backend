import express, { Router } from "express";
import {
  cancelMyOrder,
  listMyOrders,
  placeOrder,
} from "../../../../controllers/common/order.controller";
import { isAuthenticated } from "../../../../middlewares/ensure-authenticated";
import { handleValidationError } from "../../../../middlewares/error-handler";
import {
  handleMulterError,
  uploadOrderImage,
} from "../../../../middlewares/file-upload";
import { parseJsonFields } from "../../../../middlewares/parse-json-fields";
import { normalLimiter } from "../../../../middlewares/rate-limiter";
import {
  cancelMyOrderValidation,
  placeOrderValidation,
} from "../../../../validations/order.validation";

const router: Router = express.Router();

router.get("/", isAuthenticated, normalLimiter, listMyOrders);

router.patch(
  "/:code/cancel",
  isAuthenticated,
  normalLimiter,
  cancelMyOrderValidation,
  handleValidationError,
  cancelMyOrder,
);

router.post(
  "/",
  isAuthenticated,
  normalLimiter,
  uploadOrderImage,
  handleMulterError,
  parseJsonFields(["items"]),
  placeOrderValidation,
  handleValidationError,
  placeOrder,
);

export default router;
