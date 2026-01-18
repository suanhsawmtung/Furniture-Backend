import express, { Router } from "express";
import { listPublicCategories } from "../../../../controllers/common/category.controller";

const router: Router = express.Router();

router.get("/", listPublicCategories);

export default router;
