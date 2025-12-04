import * as transactionService from "../services/transaction.services.js";

/**
 * Endpoint: POST /api/transactions/analyze
 * Desc: Analyzes a single JSON transaction object in real-time.
 */
export const analyzeSingleTransaction = async (req, res, next) => {
    try {
        const transactionData = req.body;

        console.log("⚡ Analyzing Transaction:", transactionData.id);

        if (!transactionData) {
            return res.status(400).json({ error: "Payload missing" });
        }

        const result = await transactionService.detectFraud(transactionData);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error("Analysis Error:", error);
        res.status(500).json({ error: "Internal Analysis Error" });
    }
};

/**
 * Endpoint: POST /api/transactions/upload
 * Desc: Processes a bulk CSV file for batch analysis.
 */
export const analyzeBulkFile = async (req, res, next) => {
    try {
        if (!req.file) {
            return res
                .status(400)
                .json({ error: "No file uploaded. Please attach a CSV." });
        }

        console.log("📂 Processing Batch File:", req.file.originalname);

        const result = await transactionService.processBatchFile(req.file);

        res.status(200).json({
            success: true,
            message: "Batch analysis complete",
            summary: result.summary,
            alerts: result.detailed_report,
        });
    } catch (error) {
        console.error("Batch Processing Error:", error);
        res.status(500).json({ error: "File processing failed" });
    }
};
