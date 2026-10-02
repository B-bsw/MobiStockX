-- MobiStock X PostgreSQL DDL Schema Script
-- Principles of Software Design and Development (Spring Boot)

-- 1. App User
CREATE TABLE IF NOT EXISTS app_user (
    user_id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- 2. Brand
CREATE TABLE IF NOT EXISTS brand (
    brand_id BIGSERIAL PRIMARY KEY,
    brand_name VARCHAR(100) NOT NULL UNIQUE,
    brand_country VARCHAR(100),
    image_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- 3. Category
CREATE TABLE IF NOT EXISTS category (
    category_id BIGSERIAL PRIMARY KEY,
    category_name_th VARCHAR(100) NOT NULL UNIQUE,
    category_name_en VARCHAR(100),
    is_serialized BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- 4. Customer
CREATE TABLE IF NOT EXISTS customer (
    customer_id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(100),
    tax_id VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customer_phone ON customer(phone);

-- 5. Product Model
CREATE TABLE IF NOT EXISTS product_model (
    model_id BIGSERIAL PRIMARY KEY,
    brand_id BIGINT NOT NULL REFERENCES brand(brand_id),
    category_id BIGINT NOT NULL REFERENCES category(category_id),
    model_code VARCHAR(50) NOT NULL UNIQUE,
    model_name VARCHAR(200) NOT NULL,
    color VARCHAR(50),
    capacity VARCHAR(50),
    standard_price NUMERIC(10,2) NOT NULL,
    model_warranty_duration INT NOT NULL DEFAULT 12,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_product_model_code ON product_model(model_code);

-- 6. Product Item (Serial / IMEI)
CREATE TABLE IF NOT EXISTS product_item (
    item_id BIGSERIAL PRIMARY KEY,
    model_id BIGINT NOT NULL REFERENCES product_model(model_id),
    imei VARCHAR(20) UNIQUE,
    serial_number VARCHAR(50) UNIQUE,
    cost_price NUMERIC(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'IN_STOCK',
    item_condition VARCHAR(20) NOT NULL DEFAULT 'BRAND_NEW',
    received_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_product_item_imei ON product_item(imei);
CREATE INDEX IF NOT EXISTS idx_product_item_serial ON product_item(serial_number);
CREATE INDEX IF NOT EXISTS idx_product_item_status ON product_item(status);

-- 7. Product Warranty
CREATE TABLE IF NOT EXISTS product_warranty (
    warranty_id BIGSERIAL PRIMARY KEY,
    warranty_code VARCHAR(50) NOT NULL UNIQUE,
    item_imei VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    expire_date DATE NOT NULL,
    terms_conditions TEXT,
    warranty_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_warranty_code ON product_warranty(warranty_code);
CREATE INDEX IF NOT EXISTS idx_warranty_imei ON product_warranty(item_imei);

-- 8. Sale Order
CREATE TABLE IF NOT EXISTS sale_order (
    sale_id BIGSERIAL PRIMARY KEY,
    sale_code VARCHAR(50) NOT NULL UNIQUE,
    customer_id BIGINT REFERENCES customer(customer_id),
    cashier_id BIGINT NOT NULL REFERENCES app_user(user_id),
    sale_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    subtotal_amount NUMERIC(10,2) NOT NULL,
    discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sale_order_code ON sale_order(sale_code);
CREATE INDEX IF NOT EXISTS idx_sale_order_date ON sale_order(sale_date);

-- 9. Sale Order Item
CREATE TABLE IF NOT EXISTS sale_order_item (
    order_item_id BIGSERIAL PRIMARY KEY,
    sale_id BIGINT NOT NULL REFERENCES sale_order(sale_id) ON DELETE CASCADE,
    model_id BIGINT NOT NULL REFERENCES product_model(model_id),
    item_id BIGINT REFERENCES product_item(item_id),
    warranty_id BIGINT REFERENCES product_warranty(warranty_id),
    quantity INT NOT NULL DEFAULT 1,
    unit_cost NUMERIC(10,2) NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    warranty_expire_date DATE
);

-- 10. Payment
CREATE TABLE IF NOT EXISTS payment (
    payment_id BIGSERIAL PRIMARY KEY,
    sale_id BIGINT NOT NULL REFERENCES sale_order(sale_id) ON DELETE CASCADE,
    payment_method VARCHAR(30) NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED',
    reference_no VARCHAR(100),
    payment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    received_by BIGINT NOT NULL REFERENCES app_user(user_id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- 11. Tax Invoice (One-to-One with Sale Order)
CREATE TABLE IF NOT EXISTS tax_invoice (
    invoice_id BIGSERIAL PRIMARY KEY,
    sale_id BIGINT NOT NULL UNIQUE REFERENCES sale_order(sale_id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    company_or_buyer_name VARCHAR(200) NOT NULL,
    tax_id VARCHAR(20) NOT NULL,
    branch_number VARCHAR(10) NOT NULL DEFAULT '00000',
    address TEXT NOT NULL,
    subtotal_amount NUMERIC(10,2) NOT NULL,
    vat_rate NUMERIC(5,2) NOT NULL DEFAULT 7.00,
    vat_amount NUMERIC(10,2) NOT NULL,
    grand_total NUMERIC(10,2) NOT NULL,
    issued_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    pdf_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tax_invoice_number ON tax_invoice(invoice_number);
