import { pool } from "../db.js";

export const TransactionModel = {
    // Saves a new transaction to the ledger
    create: async (txn) => {
        const query = `
            INSERT INTO transactions 
            (id, amount, type, description, sender_id, receiver_id, beneficiary_type, timestamp)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *;
        `;
        const values = [
            txn.id,
            txn.amount,
            txn.type,
            txn.description,
            txn.sender_id,
            txn.receiver_id,
            txn.beneficiary_type,
            txn.timestamp || new Date(),
        ];

        try {
            const res = await pool.query(query, values);
            return res.rows[0];
        } catch (err) {
            console.error("Error saving transaction:", err);
            throw err;
        }
    },

    // Fetches recent transaction history for a user
    // Used for Rule 1: Grooming Detection

    getHistoryBySender: async (senderId, limit = 10) => {
        const query = `
            SELECT * FROM transactions 
            WHERE sender_id = $1 
            ORDER BY timestamp DESC 
            LIMIT $2;
        `;
        try {
            const res = await pool.query(query, [senderId, limit]);
            return res.rows;
        } catch (err) {
            console.error("Error fetching history:", err);
            return [];
        }
    },

    // Checks if a beneficiary has ever sent money to the user
    // Used for Rule 2: Ghost Credit (Fake Refund)
    getLastIncomingFromBeneficiary: async (userId, beneficiaryId) => {
        const query = `
            SELECT * FROM transactions 
            WHERE sender_id = $2 AND receiver_id = $1 
            ORDER BY timestamp DESC 
            LIMIT 1;
        `;
        try {
            const res = await pool.query(query, [userId, beneficiaryId]);
            return res.rows[0] || null;
        } catch (err) {
            console.error("Error checking incoming history:", err);
            return null;
        }
    },

    // Logs the Fraud Detection Result
    logFraudAnalysis: async (analysis) => {
        const query = `
            INSERT INTO fraud_logs 
            (transaction_id, risk_score, verdict, triggered_rules)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const values = [
            analysis.transaction_id,
            analysis.risk_score,
            analysis.verdict,
            analysis.triggered_rules,
        ];

        try {
            await pool.query(query, values);
        } catch (err) {
            console.error("Error logging fraud analysis:", err);
        }
    },
};
