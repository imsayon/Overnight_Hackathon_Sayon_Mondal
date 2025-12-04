export const rules = {
    /*
    Rule 1: GROOMING (Small Verification Txns)
    Detects if a user sends multiple tiny amounts (< ₹50) to a receiver before a large transaction.
    Logic: Count outgoing txns < ₹50 in recent history. If > 3, it's a red flag.
    */
    checkGrooming: (txn, history = []) => {
        // Only trigger check if current transaction is substantial (> ₹1000)
        if (txn.amount < 1000) return { triggered: false, risk: 0 };

        const microTxns = history.filter((t) => t.amount <= 50).length;

        if (microTxns >= 3) {
            return {
                triggered: true,
                risk: 75,
                reason: "Grooming Detected: 3+ micro-transactions found before high value transfer.",
            };
        }
        return { triggered: false, risk: 0 };
    },

    /*   
    Rule 2: GHOST CREDIT (Fake Payment Confirmation)
    Detects if a user is trying to "refund" money to someone whonever actually sent them money in the first place.
    Logic: If Receiver never sent money to Sender in the past, blocking 'refund' keywords.
    */
    checkGhostCredit: (txn, lastIncomingFromBeneficiary) => {
        // Only applies to individual transfers, not merchants
        if (txn.beneficiary_type !== "INDIVIDUAL")
            return { triggered: false, risk: 0 };

        // If we have no record of receiving money from this person
        if (!lastIncomingFromBeneficiary) {
            const desc = (txn.description || "").toLowerCase();
            const suspiciousKeywords = [
                "return",
                "mistake",
                "refund",
                "sent by mistake",
                "back",
            ];

            if (suspiciousKeywords.some((k) => desc.includes(k))) {
                return {
                    triggered: true,
                    risk: 95,
                    reason: "Fake Payment Alert: You are refunding money you never received.",
                };
            }
        }
        return { triggered: false, risk: 0 };
    },

    /*
    Rule 3: REFUND SCAM
    Detects if a user is approving a 'COLLECT' request that claims to be a refund.
    Logic: In UPI, you never enter PIN (approve collect) to receive money.
    */
    checkRefundScam: (txn) => {
        if (txn.type === "COLLECT") {
            const keywords = [
                "refund",
                "cashback",
                "prize",
                "won",
                "lottery",
                "claim",
            ];
            const desc = (txn.description || "").toLowerCase();

            if (keywords.some((k) => desc.includes(k))) {
                return {
                    triggered: true,
                    risk: 100,
                    reason: "Refund Scam: 'Collect' request disguised as a Refund/Prize.",
                };
            }
        }
        return { triggered: false, risk: 0 };
    },
};
