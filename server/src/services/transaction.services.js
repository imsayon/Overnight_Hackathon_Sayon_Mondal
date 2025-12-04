import { rules } from "../utils/fraudRules.js";

// --- MOCK DATABASE SIMULATORS ---
// These simulate SQL queries like: SELECT * FROM transactions WHERE sender_id = ?

const getMockHistory = (userId) => {
    // Simulates history for Rule 1 (Grooming)
    // If sender ID has 'victim', we return a history of small payments
    if (userId && userId.includes("victim")) {
        return [
            { amount: 10, timestamp: "2024-03-20T10:00:00Z" },
            { amount: 1, timestamp: "2024-03-20T10:05:00Z" },
            { amount: 20, timestamp: "2024-03-20T10:10:00Z" },
        ];
    }
    return [];
};

const getIncomingHistory = (userId, beneficiaryId) => {
    // Simulates history for Rule 2 (Fake Screenshot)
    // Returns NULL if the beneficiary never sent money to the user (Scammer scenario)
    if (beneficiaryId && beneficiaryId.includes("scammer")) return null;

    // Normal case: We found a previous credit from this person
    return { amount: 500, timestamp: "2024-01-01T10:00:00Z" };
};

// --- CORE LOGIC ENGINE ---

export const detectFraud = async (txn) => {
    let totalRiskScore = 0;
    const triggeredRules = [];

    // 1. FETCH CONTEXT DATA (Mocking DB calls)
    const history = getMockHistory(txn.sender_id);
    const lastIncoming = getIncomingHistory(txn.sender_id, txn.receiver_id);

    // 2. RUN THE 3 DETERMINISTIC RULES
    const checks = [
        rules.checkGrooming(txn, history), // Rule 1
        rules.checkGhostCredit(txn, lastIncoming), // Rule 2
        rules.checkRefundScam(txn), // Rule 3
    ];

    // 3. AGGREGATE RESULTS
    checks.forEach((check) => {
        if (check.triggered) {
            totalRiskScore += check.risk;
            triggeredRules.push(check.reason);
        }
    });

    // Cap Score at 100
    totalRiskScore = Math.min(totalRiskScore, 100);

    // Determine Verdict
    let verdict = "ALLOW";
    if (totalRiskScore >= 90) verdict = "BLOCK";
    else if (totalRiskScore >= 50) verdict = "FLAG";

    return {
        transaction_id: txn.id,
        risk_score: totalRiskScore,
        verdict: verdict,
        triggered_rules: triggeredRules,
        timestamp: new Date().toISOString(),
    };
};

/**
 * Batch Processing - Wrapper for CSV uploads
 */
export const processBatchFile = async (file) => {
    const fileString = file.buffer.toString("utf8");
    const rows = fileString.split("\n");
    const results = [];
    let fraudCount = 0;
    let savedAmount = 0;

    // Start from i=1 to skip header
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i].split(",");
        if (row.length < 2) continue; // Skip empty rows

        // Simple CSV Mapping: ID, Amount, Type, Desc, SenderID, ReceiverID
        const txn = {
            id: row[0],
            amount: parseFloat(row[1] || 0),
            type: row[2] || "DEBIT",
            description: row[3] || "",
            sender_id: row[4] || "user_victim_01", // Default to victim for testing
            receiver_id: row[5] || "user_scammer_01",
            beneficiary_type: "INDIVIDUAL", // Default
            timestamp: new Date().toISOString(),
        };

        const analysis = await detectFraud(txn);

        if (analysis.verdict !== "ALLOW") {
            fraudCount++;
            savedAmount += txn.amount;
            results.push(analysis);
        }
    }

    return {
        summary: {
            total_processed: rows.length - 1,
            fraud_detected: fraudCount,
            total_saved: savedAmount,
        },
        detailed_report: results,
    };
};
