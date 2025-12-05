CREATE TABLE IF NOT EXISTS transactions (
    -- unique transaction identifier
    txn_id VARCHAR(50) PRIMARY KEY,
    
    -- core transaction info
    transaction_timestamp TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    sender_vpa VARCHAR(100) NOT NULL,
    receiver_vpa VARCHAR(100) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    state VARCHAR(50),
    
    -- context & channel info
    channel VARCHAR(20),
    page_context VARCHAR(50),
    scanned_qr_vpa VARCHAR(100),
    merchant_expected_vpa VARCHAR(100),
    
    -- risk flags (boolean inputs)
    is_new_counterparty BOOLEAN DEFAULT FALSE,
    device_change BOOLEAN DEFAULT FALSE,
    location_change BOOLEAN DEFAULT FALSE,
    requires_pin BOOLEAN DEFAULT TRUE,
    
    -- device integrity checks
    is_screen_recording_on BOOLEAN DEFAULT FALSE,
    is_remote_access_app_running BOOLEAN DEFAULT FALSE,
    is_call_active_during_payment BOOLEAN DEFAULT FALSE,
    
    -- calculated graph features
    sender_in_degree_7d INTEGER,
    sender_out_degree_7d INTEGER,
    sender_in_out_ratio FLOAT,
    fake_claim_count_user_7d INTEGER,
    
    -- ML outputs
    anomaly_score FLOAT,
    
    -- final classification (labels)
    is_fraud BOOLEAN DEFAULT FALSE,
    fraud_type_qr BOOLEAN DEFAULT FALSE,
    fraud_type_mule BOOLEAN DEFAULT FALSE,
    fraud_type_coercion BOOLEAN DEFAULT FALSE
);