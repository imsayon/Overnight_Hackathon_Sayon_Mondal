import "dotenv/config";
import express from "express";
import cors from "cors";
import transactionRoutes from "./routes/transaction.routes.js";
import { pool } from "./db.js";

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middlewares ---
app.use(cors()); // Allow frontend to connect
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));

// --- Routes ---
app.get("/", (req, res) => {
    res.send("🚀 UPI Sentinel Fraud Engine is Running");
});

app.use("/api/transactions", transactionRoutes);

// --- Database Connection Check ---
pool.query("SELECT NOW()", (err, res) => {
    if (err) {
        console.error(
            "⚠️ PG Warning: DB not connected (Running in Logic-Only Mode)"
        );
    } else {
        console.log("✅ Connected to Postgres Database");
    }
});

// --- Global Error Handler ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: "Internal Server Error",
        details: err.message,
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
});
