import express, { Router } from "express";
import { isAuthenticated } from "../../../../middlewares/ensure-authenticated";
import { cartValidation } from "../../../../validations/cart.validation";
import { handleValidationError } from "../../../../middlewares/error-handler";
import { listCartItems } from "../../../../controllers/common/cart.controller";

const router: Router = express.Router();

router.post(
    "/items",
    isAuthenticated,
    cartValidation,
    handleValidationError,
    listCartItems
);

export default router;
