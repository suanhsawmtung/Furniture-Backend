import express, { Router } from "express";
import { listPublicBrands } from "../../../../controllers/common/brand.controller";

const router: Router = express.Router();

router.get("/", listPublicBrands);

export default router;
