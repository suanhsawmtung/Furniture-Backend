import { Role } from "@prisma/client";
import express, { Router } from "express";
import {
  createOrderController,
  deleteOrderController,
  getAllOrdersController,
  getOrderByCodeController,
  updateOrderController,
} from "../../../../controllers/admin/order.controller";
import { permit } from "../../../../middlewares/check-permissions";
import { isAuthenticated } from "../../../../middlewares/ensure-authenticated";
import { handleValidationError } from "../../../../middlewares/error-handler";
import {
  createOrderValidation,
  updateOrderValidation,
} from "../../../../validations/order.validation";

const router: Router = express.Router();

router.get(
  "/",
  isAuthenticated,
  permit(true, Role.ADMIN),
  getAllOrdersController
);

router.post(
  "/",
  isAuthenticated,
  permit(true, Role.ADMIN),
  createOrderValidation,
  handleValidationError,
  createOrderController
);

router.get(
  "/:code",
  isAuthenticated,
  permit(true, Role.ADMIN),
  getOrderByCodeController
);

router.patch(
  "/:code",
  isAuthenticated,
  permit(true, Role.ADMIN),
  updateOrderValidation,
  handleValidationError,
  updateOrderController
);

router.delete(
  "/:code",
  isAuthenticated,
  permit(true, Role.ADMIN),
  deleteOrderController
);

export default router;
