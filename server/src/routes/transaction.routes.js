import express from "express";
import { upload } from "../middlewares/upload.middlewares.js";
import {
    analyzeSingleTransaction,
    analyzeBulkFile,
} from "../controllers/transaction.controllers.js";

const router = express.Router();

// 1. Real-time Analysis Endpoint (JSON Input)
router.post("/analyze", analyzeSingleTransaction);

// 2. Bulk Upload Endpoint (CSV/JSON File Input)
router.post("/upload", upload.single("file"), analyzeBulkFile);

export default router;
