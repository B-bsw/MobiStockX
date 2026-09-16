-- MobiStockX Database Seed Data (Thailand Store Context)

-- 1. APP_USER (Staff Users)
INSERT INTO app_user (user_id, username, email, password, full_name, phone, role, is_active, created_at, updated_at)
VALUES 
(1, 'admin', 'admin@mobistockx.co.th', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhiM9F4bM6Qk8u2zZ7v7l7FzFpZ4eX6e', 'ผู้ดูแลระบบ สูงสุด', '0819998888', 'ADMIN', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'somchai.m', 'somchai.m@mobistockx.co.th', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhiM9F4bM6Qk8u2zZ7v7l7FzFpZ4eX6e', 'สมชาย มีทรัพย์', '0891234567', 'MANAGER', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'kanda.c', 'kanda.c@mobistockx.co.th', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhiM9F4bM6Qk8u2zZ7v7l7FzFpZ4eX6e', 'กานดา ใจซื่อ', '0865554321', 'CASHIER', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'teerapat.t', 'teerapat.t@mobistockx.co.th', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhiM9F4bM6Qk8u2zZ7v7l7FzFpZ4eX6e', 'ธีรภัทร ช่างทอง', '0958887777', 'TECHNICIAN', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (user_id) DO NOTHING;

-- 2. BRAND
INSERT INTO brand (brand_id, brand_name, brand_country, image_url, created_at, updated_at)
VALUES 
(1, 'Apple', 'สหรัฐอเมริกา', 'https://cdn.mobistockx.co.th/brands/apple.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'Samsung', 'เกาหลีใต้', 'https://cdn.mobistockx.co.th/brands/samsung.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'Xiaomi', 'จีน', 'https://cdn.mobistockx.co.th/brands/xiaomi.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'OPPO', 'จีน', 'https://cdn.mobistockx.co.th/brands/oppo.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'vivo', 'จีน', 'https://cdn.mobistockx.co.th/brands/vivo.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (brand_id) DO NOTHING;

-- 3. CATEGORY
INSERT INTO category (category_id, category_name_th, category_name_en, is_serialized, created_at, updated_at)
VALUES 
(1, 'สมาร์ทโฟน', 'Smartphone', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'แท็บเล็ต', 'Tablet', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'สมาร์ทวอทช์', 'Smartwatch', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'อุปกรณ์เสริม', 'Accessories', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (category_id) DO NOTHING;

-- 4. PRODUCT_MODEL
INSERT INTO product_model (model_id, model_name, color, storage_capacity, model_warranty_duration, is_serialized, stock_quantity, standard_cost, standard_price, image_url, brand_id, category_id, created_at, updated_at)
VALUES 
(1, 'iPhone 16 Pro', 'Natural Titanium', '256GB', 12, true, 4, 37500.00, 43900.00, 'https://cdn.mobistockx.co.th/models/iphone16pro-natural.png', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'iPhone 16', 'Black', '128GB', 12, true, 6, 25000.00, 29900.00, 'https://cdn.mobistockx.co.th/models/iphone16-black.png', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'iPhone 15', 'Blue', '128GB', 12, true, 3, 20500.00, 24900.00, 'https://cdn.mobistockx.co.th/models/iphone15-blue.png', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'iPad Air 11 นิ้ว (M2)', 'Starlight', '128GB', 12, true, 5, 18200.00, 21900.00, 'https://cdn.mobistockx.co.th/models/ipad-air-m2-starlight.png', 1, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'Apple Watch Series 10 46mm', 'Jet Black', '64GB', 12, true, 4, 13200.00, 15900.00, 'https://cdn.mobistockx.co.th/models/apple-watch-s10.png', 1, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 'Samsung Galaxy S24 Ultra', 'Titanium Gray', '512GB', 12, true, 3, 39500.00, 46900.00, 'https://cdn.mobistockx.co.th/models/galaxy-s24-ultra.png', 2, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(7, 'Samsung Galaxy A55 5G', 'Awesome Iceblue', '256GB', 12, true, 8, 11200.00, 13999.00, 'https://cdn.mobistockx.co.th/models/galaxy-a55.png', 2, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(8, 'Samsung Galaxy Tab S9 FE', 'Gray', '128GB', 12, true, 4, 12000.00, 14900.00, 'https://cdn.mobistockx.co.th/models/tab-s9-fe.png', 2, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(9, 'Xiaomi 14 Ultra', 'Black', '512GB', 12, true, 2, 31800.00, 37990.00, 'https://cdn.mobistockx.co.th/models/xiaomi-14-ultra.png', 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(10, 'Redmi Note 13 Pro+ 5G', 'Midnight Black', '256GB', 12, true, 7, 9300.00, 11990.00, 'https://cdn.mobistockx.co.th/models/redmi-note-13-pro-plus.png', 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(11, 'OPPO Find N3 Flip', 'Cream Gold', '256GB', 12, true, 3, 24200.00, 29990.00, 'https://cdn.mobistockx.co.th/models/oppo-find-n3-flip.png', 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(12, 'OPPO Reno11 5G', 'Wave Green', '256GB', 12, true, 5, 10100.00, 12990.00, 'https://cdn.mobistockx.co.th/models/oppo-reno11.png', 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(13, 'vivo V30 5G', 'Shell White', '256GB', 12, true, 6, 10900.00, 13999.00, 'https://cdn.mobistockx.co.th/models/vivo-v30.png', 5, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(14, 'Apple 20W USB-C Power Adapter', 'White', '-', 12, false, 25, 520.00, 790.00, 'https://cdn.mobistockx.co.th/models/apple-20w-adapter.png', 1, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(15, 'Samsung 45W Power Adapter', 'Black', '-', 6, false, 18, 790.00, 1290.00, 'https://cdn.mobistockx.co.th/models/samsung-45w-adapter.png', 2, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (model_id) DO NOTHING;

-- 5. CUSTOMER (Thai Customers)
INSERT INTO customer (customer_id, customer_fname, customer_lname, customer_phone, customer_tax_number, customer_id_card, customer_address, created_at, updated_at)
VALUES 
(1, 'สมชาย', 'ใจดี', '0812345678', '1409900123456', '1409900123456', '123/45 ถนนมิตรภาพ ต.ในเมือง อ.เมืองขอนแก่น จ.ขอนแก่น 40000', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'กานดา', 'รัตนวิชัย', '0897654321', '3100500987654', '3100500987654', '88/12 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'ธีรภัทร', 'วัฒนพงศ์', '0954321098', '1509900234567', '1509900234567', '45/3 ถนนนิมมานเหมินท์ ต.สุเทพ อ.เมืองเชียงใหม่ จ.เชียงใหม่ 50200', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'นภัสสร', 'บุญประเสริฐ', '0623456789', '3400100456789', '3400100456789', '99 หมู่ 4 ต.เสม็ด อ.เมืองชลบุรี จ.ชลบุรี 20000', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'ชัยวัฒน์', 'มณีโชติ', '0845678901', '1809900345678', '1809900345678', '555 ถนนเพชรเกษม ต.หาดใหญ่ อ.หาดใหญ่ จ.สงขลา 90110', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 'อรทัย', 'พงษ์สวัสดิ์', '0876543210', '3200800678901', '3200800678901', '12/8 ถนนมะลิวัลย์ ต.ในเมือง อ.เมืองขอนแก่น จ.ขอนแก่น 40000', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (customer_id) DO NOTHING;

-- 6. PRODUCT_ITEM (Serialized Units)
INSERT INTO product_item (item_id, model_id, item_serial_number, item_imei, item_condition, item_grade, battery_health, cost_price, selling_price, item_status, warranty_expire_date, created_at, updated_at)
VALUES 
(1, 1, 'SN-AP-IP16P-001', '358912345678901', 'NEW', 'A+', 100, 37500.00, 43900.00, 'SOLD', CURRENT_TIMESTAMP + INTERVAL '1 year', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 1, 'SN-AP-IP16P-002', '358912345678902', 'NEW', 'A+', 100, 37500.00, 43900.00, 'AVAILABLE', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 1, 'SN-AP-IP16P-003', '358912345678903', 'NEW', 'A+', 100, 37500.00, 43900.00, 'RESERVED', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 2, 'SN-AP-IP16-001', '359012345678901', 'NEW', 'A+', 100, 25000.00, 29900.00, 'AVAILABLE', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 2, 'SN-AP-IP16-002', '359012345678902', 'NEW', 'A+', 100, 25000.00, 29900.00, 'AVAILABLE', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 3, 'SN-AP-IP15-SH01', '358712345678999', 'SECOND_HAND', 'A', 92, 16000.00, 19900.00, 'SOLD', CURRENT_TIMESTAMP + INTERVAL '3 months', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(7, 3, 'SN-AP-IP15-SH02', '358712345678998', 'SECOND_HAND', 'B', 87, 14500.00, 17900.00, 'AVAILABLE', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(8, 4, 'SN-AP-IPAD-001', '356512345678901', 'NEW', 'A+', 100, 18200.00, 21900.00, 'AVAILABLE', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(9, 5, 'SN-AP-AW10-001', '357112345678901', 'NEW', 'A+', 100, 13200.00, 15900.00, 'AVAILABLE', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(10, 7, 'SN-SS-A55-001', '354112345678901', 'NEW', 'A+', 100, 11200.00, 13999.00, 'SOLD', CURRENT_TIMESTAMP + INTERVAL '1 year', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(11, 7, 'SN-SS-A55-002', '354112345678902', 'NEW', 'A+', 100, 11200.00, 13999.00, 'AVAILABLE', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(12, 6, 'SN-SS-S24U-001', '353312345678901', 'NEW', 'A+', 100, 39500.00, 46900.00, 'AVAILABLE', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(13, 6, 'SN-SS-S24U-SH01', '353312345678999', 'SECOND_HAND', 'A+', 96, 32000.00, 37900.00, 'AVAILABLE', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(14, 8, 'SN-SS-TABS9-001', '352212345678901', 'NEW', 'A+', 100, 12000.00, 14900.00, 'AVAILABLE', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(15, 9, 'SN-XI-MI14U-001', '861112345678901', 'NEW', 'A+', 100, 31800.00, 37990.00, 'AVAILABLE', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(16, 12, 'SN-OP-RENO11-001', '862212345678901', 'NEW', 'A+', 100, 10100.00, 12990.00, 'AVAILABLE', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(17, 13, 'SN-VV-V30-001', '863312345678901', 'NEW', 'A+', 100, 10900.00, 13999.00, 'AVAILABLE', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (item_id) DO NOTHING;
