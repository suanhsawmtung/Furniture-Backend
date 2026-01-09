import express, { Router } from "express";
import { getAllCategoriesController } from "../../../../controllers/common/category.controller";

const router: Router = express.Router();

router.get("/", getAllCategoriesController);

export default router;
