-- MobiStockX historical demo seed (PostgreSQL; schema created by JPA entities).
-- For a fresh demo database: psql --single-transaction -v ON_ERROR_STOP=1 -f src/main/resources/data.sql
-- Stable IDs make reruns skip existing records; this script never overwrites them.
-- All dates are relative to execution: master data ~8 months old, sales over the past 6 months.
-- Counts: 9 users, 10 brands, 6 categories, 60 models, 56 customers, 377 stock units,
--         143 orders, 203 sale lines, 123 payments/warranties, 62 tax invoices.
-- Requested users (IDs 5-9): password 11223344, BCrypt-encoded; phone unspecified.
-- Original demo users (IDs 1-4): password Mobistock@123, BCrypt-encoded.
-- Catalog prices, contact details and transactions are fictional demo data.

-- 1. APP_USER (Staff Users)
INSERT INTO app_user (user_id, username, email, password, full_name, phone, role, is_active, created_at, updated_at)
VALUES
(1, 'admin', 'admin@mobistockx.co.th', '$2a$10$jfV/sFZrttj8dngmjmgXZ.XQNha8CQ7.4q.Vpj1FkOFFLFXE9iFs2', 'ผู้ดูแลระบบ สูงสุด', '0819998888', 'ADMIN', true, CURRENT_TIMESTAMP - INTERVAL '239 days', CURRENT_TIMESTAMP - INTERVAL '2 days'),
(2, 'somchai.m', 'somchai.m@mobistockx.co.th', '$2a$10$jfV/sFZrttj8dngmjmgXZ.XQNha8CQ7.4q.Vpj1FkOFFLFXE9iFs2', 'สมชาย มีทรัพย์', '0891234567', 'MANAGER', true, CURRENT_TIMESTAMP - INTERVAL '238 days', CURRENT_TIMESTAMP - INTERVAL '3 days'),
(3, 'kanda.c', 'kanda.c@mobistockx.co.th', '$2a$10$jfV/sFZrttj8dngmjmgXZ.XQNha8CQ7.4q.Vpj1FkOFFLFXE9iFs2', 'กานดา ใจซื่อ', '0865554321', 'CASHIER', true, CURRENT_TIMESTAMP - INTERVAL '237 days', CURRENT_TIMESTAMP - INTERVAL '4 days'),
(4, 'teerapat.t', 'teerapat.t@mobistockx.co.th', '$2a$10$jfV/sFZrttj8dngmjmgXZ.XQNha8CQ7.4q.Vpj1FkOFFLFXE9iFs2', 'ธีรภัทร ช่างทอง', '0958887777', 'TECHNICIAN', true, CURRENT_TIMESTAMP - INTERVAL '236 days', CURRENT_TIMESTAMP - INTERVAL '5 days'),
(5, 'kittichai.r', 'kittichai.r@example.test', '$2a$10$kQEAOMfrdNXTQkAVYWaVTeD3B3uOaRpn9AfkR.hRO1R63TeKJnqQi', 'กิตติชัย รักษาวงค์r', NULL, 'ADMIN', true, CURRENT_TIMESTAMP - INTERVAL '240 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(6, 'patsaporn.m', 'patsaporn.m@example.test', '$2a$10$kQEAOMfrdNXTQkAVYWaVTeD3B3uOaRpn9AfkR.hRO1R63TeKJnqQi', 'พรรษพร มุสันเทียะ', NULL, 'CASHIER', true, CURRENT_TIMESTAMP - INTERVAL '240 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(7, 'piyada.ke', 'piyada.ke@example.test', '$2a$10$kQEAOMfrdNXTQkAVYWaVTeD3B3uOaRpn9AfkR.hRO1R63TeKJnqQi', 'พิยดา เกษมาลา', NULL, 'MANAGER', true, CURRENT_TIMESTAMP - INTERVAL '240 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(8, 'sorawit.th', 'sorawit.th@example.test', '$2a$10$kQEAOMfrdNXTQkAVYWaVTeD3B3uOaRpn9AfkR.hRO1R63TeKJnqQi', 'สรวิทญ์ ทัศดร', NULL, 'TECHNICIAN', true, CURRENT_TIMESTAMP - INTERVAL '240 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(9, 'aekkarin.b', 'aekkarin.b@example.test', '$2a$10$kQEAOMfrdNXTQkAVYWaVTeD3B3uOaRpn9AfkR.hRO1R63TeKJnqQi', 'เอกรินทร์ บุดดาหลู่', NULL, 'TECHNICIAN', true, CURRENT_TIMESTAMP - INTERVAL '240 days', CURRENT_TIMESTAMP - INTERVAL '1 day')
ON CONFLICT (user_id) DO NOTHING;

-- 2. BRAND
INSERT INTO brand (brand_id, brand_name, brand_country, image_url, created_at, updated_at)
VALUES
(1, 'Apple', 'สหรัฐอเมริกา', 'https://cdn.mobistockx.co.th/brands/apple.png', CURRENT_TIMESTAMP - INTERVAL '239 days', CURRENT_TIMESTAMP - INTERVAL '2 days'),
(2, 'Samsung', 'เกาหลีใต้', 'https://cdn.mobistockx.co.th/brands/samsung.png', CURRENT_TIMESTAMP - INTERVAL '238 days', CURRENT_TIMESTAMP - INTERVAL '3 days'),
(3, 'Xiaomi', 'จีน', 'https://cdn.mobistockx.co.th/brands/xiaomi.png', CURRENT_TIMESTAMP - INTERVAL '237 days', CURRENT_TIMESTAMP - INTERVAL '4 days'),
(4, 'OPPO', 'จีน', 'https://cdn.mobistockx.co.th/brands/oppo.png', CURRENT_TIMESTAMP - INTERVAL '236 days', CURRENT_TIMESTAMP - INTERVAL '5 days'),
(5, 'vivo', 'จีน', 'https://cdn.mobistockx.co.th/brands/vivo.png', CURRENT_TIMESTAMP - INTERVAL '235 days', CURRENT_TIMESTAMP - INTERVAL '6 days'),
(6, 'HONOR', 'จีน', NULL, CURRENT_TIMESTAMP - INTERVAL '240 days', CURRENT_TIMESTAMP - INTERVAL '30 days'),
(7, 'realme', 'จีน', NULL, CURRENT_TIMESTAMP - INTERVAL '240 days', CURRENT_TIMESTAMP - INTERVAL '30 days'),
(8, 'OnePlus', 'จีน', NULL, CURRENT_TIMESTAMP - INTERVAL '240 days', CURRENT_TIMESTAMP - INTERVAL '30 days'),
(9, 'Nothing', 'สหราชอาณาจักร', NULL, CURRENT_TIMESTAMP - INTERVAL '240 days', CURRENT_TIMESTAMP - INTERVAL '30 days'),
(10, 'Anker', 'จีน', NULL, CURRENT_TIMESTAMP - INTERVAL '240 days', CURRENT_TIMESTAMP - INTERVAL '30 days')
ON CONFLICT (brand_id) DO NOTHING;

-- 3. CATEGORY
INSERT INTO category (category_id, category_name_th, category_name_en, is_serialized, created_at, updated_at)
VALUES
(1, 'สมาร์ทโฟน', 'Smartphone', true, CURRENT_TIMESTAMP - INTERVAL '239 days', CURRENT_TIMESTAMP - INTERVAL '2 days'),
(2, 'แท็บเล็ต', 'Tablet', true, CURRENT_TIMESTAMP - INTERVAL '238 days', CURRENT_TIMESTAMP - INTERVAL '3 days'),
(3, 'สมาร์ทวอทช์', 'Smartwatch', true, CURRENT_TIMESTAMP - INTERVAL '237 days', CURRENT_TIMESTAMP - INTERVAL '4 days'),
(4, 'อุปกรณ์เสริม', 'Accessories', false, CURRENT_TIMESTAMP - INTERVAL '236 days', CURRENT_TIMESTAMP - INTERVAL '5 days'),
(5, 'หูฟังและเครื่องเสียง', 'Audio', false, CURRENT_TIMESTAMP - INTERVAL '240 days', CURRENT_TIMESTAMP),
(6, 'สายชาร์จและแบตเตอรี่สำรอง', 'Cables and Power Banks', false, CURRENT_TIMESTAMP - INTERVAL '240 days', CURRENT_TIMESTAMP)
ON CONFLICT (category_id) DO NOTHING;

-- 4. PRODUCT_MODEL
INSERT INTO product_model (model_id, model_name, color, storage_capacity, model_warranty_duration, is_serialized, stock_quantity, standard_cost, standard_price, image_url, brand_id, category_id, created_at, updated_at)
VALUES
(1, 'iPhone 16 Pro', 'Natural Titanium', '256GB', 12, true, 1, 37500.00, 43900.00, 'https://cdn.mobistockx.co.th/models/iphone16pro-natural.png', 1, 1, CURRENT_TIMESTAMP - INTERVAL '239 days', CURRENT_TIMESTAMP - INTERVAL '2 days'),
(2, 'iPhone 16', 'Black', '128GB', 12, true, 2, 25000.00, 29900.00, 'https://cdn.mobistockx.co.th/models/iphone16-black.png', 1, 1, CURRENT_TIMESTAMP - INTERVAL '238 days', CURRENT_TIMESTAMP - INTERVAL '3 days'),
(3, 'iPhone 15', 'Blue', '128GB', 12, true, 1, 20500.00, 24900.00, 'https://cdn.mobistockx.co.th/models/iphone15-blue.png', 1, 1, CURRENT_TIMESTAMP - INTERVAL '237 days', CURRENT_TIMESTAMP - INTERVAL '4 days'),
(4, 'iPad Air 11 นิ้ว (M2)', 'Starlight', '128GB', 12, true, 1, 18200.00, 21900.00, 'https://cdn.mobistockx.co.th/models/ipad-air-m2-starlight.png', 1, 2, CURRENT_TIMESTAMP - INTERVAL '236 days', CURRENT_TIMESTAMP - INTERVAL '5 days'),
(5, 'Apple Watch Series 10 46mm', 'Jet Black', '64GB', 12, true, 1, 13200.00, 15900.00, 'https://cdn.mobistockx.co.th/models/apple-watch-s10.png', 1, 3, CURRENT_TIMESTAMP - INTERVAL '235 days', CURRENT_TIMESTAMP - INTERVAL '6 days'),
(6, 'Samsung Galaxy S24 Ultra', 'Titanium Gray', '512GB', 12, true, 2, 39500.00, 46900.00, 'https://cdn.mobistockx.co.th/models/galaxy-s24-ultra.png', 2, 1, CURRENT_TIMESTAMP - INTERVAL '234 days', CURRENT_TIMESTAMP - INTERVAL '7 days'),
(7, 'Samsung Galaxy A55 5G', 'Awesome Iceblue', '256GB', 12, true, 1, 11200.00, 13999.00, 'https://cdn.mobistockx.co.th/models/galaxy-a55.png', 2, 1, CURRENT_TIMESTAMP - INTERVAL '233 days', CURRENT_TIMESTAMP - INTERVAL '8 days'),
(8, 'Samsung Galaxy Tab S9 FE', 'Gray', '128GB', 12, true, 1, 12000.00, 14900.00, 'https://cdn.mobistockx.co.th/models/tab-s9-fe.png', 2, 2, CURRENT_TIMESTAMP - INTERVAL '232 days', CURRENT_TIMESTAMP - INTERVAL '9 days'),
(9, 'Xiaomi 14 Ultra', 'Black', '512GB', 12, true, 1, 31800.00, 37990.00, 'https://cdn.mobistockx.co.th/models/xiaomi-14-ultra.png', 3, 1, CURRENT_TIMESTAMP - INTERVAL '231 days', CURRENT_TIMESTAMP - INTERVAL '10 days'),
(10, 'Redmi Note 13 Pro+ 5G', 'Midnight Black', '256GB', 12, true, 0, 9300.00, 11990.00, 'https://cdn.mobistockx.co.th/models/redmi-note-13-pro-plus.png', 3, 1, CURRENT_TIMESTAMP - INTERVAL '230 days', CURRENT_TIMESTAMP - INTERVAL '11 days'),
(11, 'OPPO Find N3 Flip', 'Cream Gold', '256GB', 12, true, 0, 24200.00, 29990.00, 'https://cdn.mobistockx.co.th/models/oppo-find-n3-flip.png', 4, 1, CURRENT_TIMESTAMP - INTERVAL '229 days', CURRENT_TIMESTAMP - INTERVAL '12 days'),
(12, 'OPPO Reno11 5G', 'Wave Green', '256GB', 12, true, 1, 10100.00, 12990.00, 'https://cdn.mobistockx.co.th/models/oppo-reno11.png', 4, 1, CURRENT_TIMESTAMP - INTERVAL '228 days', CURRENT_TIMESTAMP - INTERVAL '13 days'),
(13, 'vivo V30 5G', 'Shell White', '256GB', 12, true, 1, 10900.00, 13999.00, 'https://cdn.mobistockx.co.th/models/vivo-v30.png', 5, 1, CURRENT_TIMESTAMP - INTERVAL '227 days', CURRENT_TIMESTAMP - INTERVAL '14 days'),
(14, 'Apple 20W USB-C Power Adapter', 'White', '-', 12, false, 25, 520.00, 790.00, 'https://cdn.mobistockx.co.th/models/apple-20w-adapter.png', 1, 4, CURRENT_TIMESTAMP - INTERVAL '226 days', CURRENT_TIMESTAMP - INTERVAL '1 days'),
(15, 'Samsung 45W Power Adapter', 'Black', '-', 6, false, 18, 790.00, 1290.00, 'https://cdn.mobistockx.co.th/models/samsung-45w-adapter.png', 2, 4, CURRENT_TIMESTAMP - INTERVAL '225 days', CURRENT_TIMESTAMP - INTERVAL '2 days'),
(16, 'iPhone 16 Pro Max', 'Desert Titanium', '256GB', 12, true, 7, 41500.00, 48900.00, NULL, 1, 1, CURRENT_TIMESTAMP - INTERVAL '210 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(17, 'iPhone 16 Pro', 'Black Titanium', '512GB', 12, true, 7, 45000.00, 52900.00, NULL, 1, 1, CURRENT_TIMESTAMP - INTERVAL '210 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(18, 'iPhone 16 Plus', 'Ultramarine', '256GB', 12, true, 7, 32000.00, 37900.00, NULL, 1, 1, CURRENT_TIMESTAMP - INTERVAL '210 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(19, 'iPhone 15 Pro', 'White Titanium', '256GB', 12, true, 7, 28000.00, 33900.00, NULL, 1, 1, CURRENT_TIMESTAMP - INTERVAL '210 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(20, 'iPad Pro 11 (M4)', 'Space Black', '256GB', 12, true, 6, 31500.00, 38900.00, NULL, 1, 2, CURRENT_TIMESTAMP - INTERVAL '210 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(21, 'iPad mini (A17 Pro)', 'Purple', '128GB', 12, true, 6, 14500.00, 17900.00, NULL, 1, 2, CURRENT_TIMESTAMP - INTERVAL '210 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(22, 'Apple Watch SE 44mm', 'Midnight', '32GB', 12, true, 7, 7500.00, 9900.00, NULL, 1, 3, CURRENT_TIMESTAMP - INTERVAL '210 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(23, 'Galaxy S24', 'Onyx Black', '256GB', 12, true, 7, 22500.00, 27900.00, NULL, 2, 1, CURRENT_TIMESTAMP - INTERVAL '210 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(24, 'Galaxy S24+', 'Cobalt Violet', '256GB', 12, true, 7, 27500.00, 32900.00, NULL, 2, 1, CURRENT_TIMESTAMP - INTERVAL '210 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(25, 'Galaxy Z Flip6', 'Silver Shadow', '256GB', 12, true, 6, 28500.00, 35900.00, NULL, 2, 1, CURRENT_TIMESTAMP - INTERVAL '210 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(26, 'Galaxy Z Fold6', 'Navy', '512GB', 12, true, 7, 52000.00, 63900.00, NULL, 2, 1, CURRENT_TIMESTAMP - INTERVAL '210 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(27, 'Galaxy A35 5G', 'Awesome Lilac', '128GB', 12, true, 7, 7500.00, 9999.00, NULL, 2, 1, CURRENT_TIMESTAMP - INTERVAL '210 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(28, 'Galaxy Tab A9+', 'Silver', '128GB', 12, true, 6, 6000.00, 7990.00, NULL, 2, 2, CURRENT_TIMESTAMP - INTERVAL '210 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(29, 'Galaxy Watch7', 'Green', '32GB', 12, true, 7, 7500.00, 10900.00, NULL, 2, 3, CURRENT_TIMESTAMP - INTERVAL '210 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(30, 'Xiaomi 14', 'Jade Green', '256GB', 12, true, 6, 21500.00, 26990.00, NULL, 3, 1, CURRENT_TIMESTAMP - INTERVAL '210 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(31, 'Redmi Note 13 5G', 'Arctic White', '256GB', 12, true, 7, 5500.00, 7990.00, NULL, 3, 1, CURRENT_TIMESTAMP - INTERVAL '210 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(32, 'POCO X6 Pro', 'Yellow', '512GB', 12, true, 7, 9500.00, 12990.00, NULL, 3, 1, CURRENT_TIMESTAMP - INTERVAL '210 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(33, 'Xiaomi Pad 6', 'Gravity Gray', '256GB', 12, true, 7, 9000.00, 11990.00, NULL, 3, 2, CURRENT_TIMESTAMP - INTERVAL '210 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(34, 'OPPO Reno11 Pro', 'Pearl White', '256GB', 12, true, 7, 16000.00, 19990.00, NULL, 4, 1, CURRENT_TIMESTAMP - INTERVAL '210 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(35, 'OPPO A79 5G', 'Glowing Green', '128GB', 12, true, 5, 5700.00, 7999.00, NULL, 4, 1, CURRENT_TIMESTAMP - INTERVAL '210 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(36, 'OPPO Pad Air', 'Gray', '128GB', 12, true, 7, 6200.00, 8990.00, NULL, 4, 2, CURRENT_TIMESTAMP - INTERVAL '210 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(37, 'vivo V30 Pro', 'Bloom White', '512GB', 12, true, 7, 16000.00, 19999.00, NULL, 5, 1, CURRENT_TIMESTAMP - INTERVAL '210 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(38, 'vivo Y100 5G', 'Crystal Black', '256GB', 12, true, 7, 6500.00, 8999.00, NULL, 5, 1, CURRENT_TIMESTAMP - INTERVAL '210 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(39, 'vivo X100', 'Startrail Blue', '256GB', 12, true, 7, 22500.00, 27999.00, NULL, 5, 1, CURRENT_TIMESTAMP - INTERVAL '210 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(40, 'HONOR Magic6 Pro', 'Epi Green', '512GB', 12, true, 6, 29500.00, 35990.00, NULL, 6, 1, CURRENT_TIMESTAMP - INTERVAL '210 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(41, 'HONOR X9b', 'Sunrise Orange', '256GB', 12, true, 7, 8500.00, 11990.00, NULL, 6, 1, CURRENT_TIMESTAMP - INTERVAL '210 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(42, 'realme 12 Pro+', 'Submarine Blue', '256GB', 12, true, 6, 10500.00, 14999.00, NULL, 7, 1, CURRENT_TIMESTAMP - INTERVAL '210 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(43, 'OnePlus 12', 'Flowy Emerald', '512GB', 12, true, 7, 25000.00, 32990.00, NULL, 8, 1, CURRENT_TIMESTAMP - INTERVAL '210 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(44, 'Nothing Phone (2)', 'Dark Gray', '256GB', 12, true, 7, 18000.00, 23900.00, NULL, 9, 1, CURRENT_TIMESTAMP - INTERVAL '210 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(45, 'Nothing Phone (2a)', 'Milk', '256GB', 12, true, 6, 9000.00, 11990.00, NULL, 9, 1, CURRENT_TIMESTAMP - INTERVAL '210 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(46, 'AirPods Pro (2nd generation)', 'White', '-', 12, false, 80, 6500.00, 8990.00, NULL, 1, 5, CURRENT_TIMESTAMP - INTERVAL '210 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(47, 'AirPods (3rd generation)', 'White', '-', 12, false, 90, 4500.00, 6490.00, NULL, 1, 5, CURRENT_TIMESTAMP - INTERVAL '210 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(48, 'Galaxy Buds FE', 'Graphite', '-', 12, false, 40, 1800.00, 2990.00, NULL, 2, 5, CURRENT_TIMESTAMP - INTERVAL '210 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(49, 'Xiaomi Redmi Buds 5', 'Black', '-', 12, false, 50, 650.00, 1290.00, NULL, 3, 5, CURRENT_TIMESTAMP - INTERVAL '210 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(50, 'OPPO Enco Air3', 'White', '-', 12, false, 60, 900.00, 1599.00, NULL, 4, 5, CURRENT_TIMESTAMP - INTERVAL '210 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(51, 'Nothing Ear (a)', 'Yellow', '-', 12, false, 70, 2500.00, 3990.00, NULL, 9, 5, CURRENT_TIMESTAMP - INTERVAL '210 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(52, 'Anker Soundcore Liberty 4', 'Midnight Black', '-', 12, false, 80, 2500.00, 3990.00, NULL, 10, 5, CURRENT_TIMESTAMP - INTERVAL '210 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(53, 'Anker PowerCore 20000', 'Black', '-', 12, false, 90, 1200.00, 1990.00, NULL, 10, 6, CURRENT_TIMESTAMP - INTERVAL '210 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(54, 'Anker Nano 30W Charger', 'White', '-', 12, false, 40, 500.00, 990.00, NULL, 10, 6, CURRENT_TIMESTAMP - INTERVAL '210 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(55, 'Apple USB-C Charge Cable 1m', 'White', '-', 12, false, 50, 400.00, 690.00, NULL, 1, 6, CURRENT_TIMESTAMP - INTERVAL '210 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(56, 'Samsung USB-C Cable 1m', 'Black', '-', 12, false, 60, 180.00, 390.00, NULL, 2, 6, CURRENT_TIMESTAMP - INTERVAL '210 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(57, 'Xiaomi Power Bank 10000', 'Silver', '-', 12, false, 70, 450.00, 790.00, NULL, 3, 6, CURRENT_TIMESTAMP - INTERVAL '210 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(58, 'MagSafe Compatible Case', 'Clear', '-', 12, false, 80, 150.00, 390.00, NULL, 10, 4, CURRENT_TIMESTAMP - INTERVAL '210 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(59, 'Tempered Glass Screen Protector', 'Clear', '-', 12, false, 90, 80.00, 250.00, NULL, 10, 4, CURRENT_TIMESTAMP - INTERVAL '210 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(60, 'Phone Stand', 'Black', '-', 12, false, 40, 100.00, 290.00, NULL, 10, 4, CURRENT_TIMESTAMP - INTERVAL '210 days', CURRENT_TIMESTAMP - INTERVAL '1 day')
ON CONFLICT (model_id) DO NOTHING;

-- 5. CUSTOMER (Thai Customers)
INSERT INTO customer (customer_id, customer_fname, customer_lname, customer_phone, customer_tax_number, customer_id_card, customer_address, created_at, updated_at)
VALUES
(1, 'สมชาย', 'ใจดี', '0812345678', '1409900123456', '1409900123456', '123/45 ถนนมิตรภาพ ต.ในเมือง อ.เมืองขอนแก่น จ.ขอนแก่น 40000', CURRENT_TIMESTAMP - INTERVAL '239 days', CURRENT_TIMESTAMP - INTERVAL '2 days'),
(2, 'กานดา', 'รัตนวิชัย', '0897654321', '3100500987654', '3100500987654', '88/12 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110', CURRENT_TIMESTAMP - INTERVAL '238 days', CURRENT_TIMESTAMP - INTERVAL '3 days'),
(3, 'ธีรภัทร', 'วัฒนพงศ์', '0954321098', '1509900234567', '1509900234567', '45/3 ถนนนิมมานเหมินท์ ต.สุเทพ อ.เมืองเชียงใหม่ จ.เชียงใหม่ 50200', CURRENT_TIMESTAMP - INTERVAL '237 days', CURRENT_TIMESTAMP - INTERVAL '4 days'),
(4, 'นภัสสร', 'บุญประเสริฐ', '0623456789', '3400100456789', '3400100456789', '99 หมู่ 4 ต.เสม็ด อ.เมืองชลบุรี จ.ชลบุรี 20000', CURRENT_TIMESTAMP - INTERVAL '236 days', CURRENT_TIMESTAMP - INTERVAL '5 days'),
(5, 'ชัยวัฒน์', 'มณีโชติ', '0845678901', '1809900345678', '1809900345678', '555 ถนนเพชรเกษม ต.หาดใหญ่ อ.หาดใหญ่ จ.สงขลา 90110', CURRENT_TIMESTAMP - INTERVAL '235 days', CURRENT_TIMESTAMP - INTERVAL '6 days'),
(6, 'อรทัย', 'พงษ์สวัสดิ์', '0876543210', '3200800678901', '3200800678901', '12/8 ถนนมะลิวัลย์ ต.ในเมือง อ.เมืองขอนแก่น จ.ขอนแก่น 40000', CURRENT_TIMESTAMP - INTERVAL '234 days', CURRENT_TIMESTAMP - INTERVAL '7 days'),
(7, 'กิตติพงษ์', 'สุขใจ', '0999000001', NULL, NULL, '101/1 ถนนมิตรภาพ ต.ในเมือง อ.เมืองขอนแก่น จ.ขอนแก่น 40000', CURRENT_TIMESTAMP - INTERVAL '233 days', CURRENT_TIMESTAMP - INTERVAL '8 days'),
(8, 'สุภาวดี', 'แสงทอง', '0999000002', NULL, NULL, '102/2 ถนนสุขุมวิท แขวงพระโขนง เขตคลองเตย กรุงเทพมหานคร 10110', CURRENT_TIMESTAMP - INTERVAL '232 days', CURRENT_TIMESTAMP - INTERVAL '9 days'),
(9, 'ณัฐพล', 'วงศ์สวัสดิ์', '0999000003', NULL, NULL, '103/3 ถนนห้วยแก้ว ต.สุเทพ อ.เมืองเชียงใหม่ จ.เชียงใหม่ 50200', CURRENT_TIMESTAMP - INTERVAL '231 days', CURRENT_TIMESTAMP - INTERVAL '10 days'),
(10, 'พิมพ์ชนก', 'ศรีวิชัย', '0999000004', NULL, NULL, '104/4 ถนนลงหาดบางแสน ต.แสนสุข อ.เมืองชลบุรี จ.ชลบุรี 20130', CURRENT_TIMESTAMP - INTERVAL '230 days', CURRENT_TIMESTAMP - INTERVAL '11 days'),
(11, 'ธนกร', 'รุ่งเรือง', '0999000005', NULL, NULL, '105/5 ถนนเพชรเกษม ต.หาดใหญ่ อ.หาดใหญ่ จ.สงขลา 90110', CURRENT_TIMESTAMP - INTERVAL '229 days', CURRENT_TIMESTAMP - INTERVAL '12 days'),
(12, 'วรัญญา', 'บุญมี', '0999000006', NULL, NULL, '106/6 ถนนสุรนารี ต.ในเมือง อ.เมืองนครราชสีมา จ.นครราชสีมา 30000', CURRENT_TIMESTAMP - INTERVAL '228 days', CURRENT_TIMESTAMP - INTERVAL '13 days'),
(13, 'ปิยวัฒน์', 'จันทร์เพ็ญ', '0999000007', NULL, NULL, '107/7 ถนนศรีสุทัศน์ ต.ตลาดใหญ่ อ.เมืองภูเก็ต จ.ภูเก็ต 83000', CURRENT_TIMESTAMP - INTERVAL '227 days', CURRENT_TIMESTAMP - INTERVAL '14 days'),
(14, 'ศิริพร', 'แก้วมณี', '0999000008', NULL, NULL, '108/8 ถนนนเรศวร ต.หมากแข้ง อ.เมืองอุดรธานี จ.อุดรธานี 41000', CURRENT_TIMESTAMP - INTERVAL '226 days', CURRENT_TIMESTAMP - INTERVAL '1 days'),
(15, 'ภัทรพล', 'อินทร์ทอง', '0999000009', NULL, NULL, '109/9 ถนนรัตนาธิเบศร์ ต.บางกระสอ อ.เมืองนนทบุรี จ.นนทบุรี 11000', CURRENT_TIMESTAMP - INTERVAL '225 days', CURRENT_TIMESTAMP - INTERVAL '2 days'),
(16, 'ชุติมา', 'พรหมรักษ์', '0999000010', NULL, NULL, '110/10 ถนนอุบล ต.ในเมือง อ.เมืองศรีสะเกษ จ.ศรีสะเกษ 33000', CURRENT_TIMESTAMP - INTERVAL '224 days', CURRENT_TIMESTAMP - INTERVAL '3 days'),
(17, 'อนุชา', 'ทองดี', '0999000011', NULL, NULL, '111/11 ถนนมิตรภาพ ต.ในเมือง อ.เมืองขอนแก่น จ.ขอนแก่น 40000', CURRENT_TIMESTAMP - INTERVAL '223 days', CURRENT_TIMESTAMP - INTERVAL '4 days'),
(18, 'มัลลิกา', 'วัฒนกุล', '0999000012', NULL, NULL, '112/12 ถนนสุขุมวิท แขวงพระโขนง เขตคลองเตย กรุงเทพมหานคร 10110', CURRENT_TIMESTAMP - INTERVAL '222 days', CURRENT_TIMESTAMP - INTERVAL '5 days'),
(19, 'วรวิทย์', 'ศรีสุข', '0999000013', NULL, NULL, '113/13 ถนนห้วยแก้ว ต.สุเทพ อ.เมืองเชียงใหม่ จ.เชียงใหม่ 50200', CURRENT_TIMESTAMP - INTERVAL '221 days', CURRENT_TIMESTAMP - INTERVAL '6 days'),
(20, 'กมลชนก', 'พงษ์ไพบูลย์', '0999000014', NULL, NULL, '114/14 ถนนลงหาดบางแสน ต.แสนสุข อ.เมืองชลบุรี จ.ชลบุรี 20130', CURRENT_TIMESTAMP - INTERVAL '220 days', CURRENT_TIMESTAMP - INTERVAL '7 days'),
(21, 'ธนวัฒน์', 'รัตนกุล', '0999000015', NULL, NULL, '115/15 ถนนเพชรเกษม ต.หาดใหญ่ อ.หาดใหญ่ จ.สงขลา 90110', CURRENT_TIMESTAMP - INTERVAL '219 days', CURRENT_TIMESTAMP - INTERVAL '8 days'),
(22, 'เบญจมาศ', 'ชัยมงคล', '0999000016', NULL, NULL, '116/16 ถนนสุรนารี ต.ในเมือง อ.เมืองนครราชสีมา จ.นครราชสีมา 30000', CURRENT_TIMESTAMP - INTERVAL '218 days', CURRENT_TIMESTAMP - INTERVAL '9 days'),
(23, 'ณัฐวุฒิ', 'บุญส่ง', '0999000017', NULL, NULL, '117/17 ถนนศรีสุทัศน์ ต.ตลาดใหญ่ อ.เมืองภูเก็ต จ.ภูเก็ต 83000', CURRENT_TIMESTAMP - INTERVAL '217 days', CURRENT_TIMESTAMP - INTERVAL '10 days'),
(24, 'สุพัตรา', 'แสงจันทร์', '0999000018', NULL, NULL, '118/18 ถนนนเรศวร ต.หมากแข้ง อ.เมืองอุดรธานี จ.อุดรธานี 41000', CURRENT_TIMESTAMP - INTERVAL '216 days', CURRENT_TIMESTAMP - INTERVAL '11 days'),
(25, 'ภูริณัฐ', 'ทวีทรัพย์', '0999000019', NULL, NULL, '119/19 ถนนรัตนาธิเบศร์ ต.บางกระสอ อ.เมืองนนทบุรี จ.นนทบุรี 11000', CURRENT_TIMESTAMP - INTERVAL '215 days', CURRENT_TIMESTAMP - INTERVAL '12 days'),
(26, 'อัญชลี', 'วงศ์สุวรรณ', '0999000020', NULL, NULL, '120/20 ถนนอุบล ต.ในเมือง อ.เมืองศรีสะเกษ จ.ศรีสะเกษ 33000', CURRENT_TIMESTAMP - INTERVAL '214 days', CURRENT_TIMESTAMP - INTERVAL '13 days'),
(27, 'จักรพงษ์', 'ศรีสมบัติ', '0999000021', NULL, NULL, '121/21 ถนนมิตรภาพ ต.ในเมือง อ.เมืองขอนแก่น จ.ขอนแก่น 40000', CURRENT_TIMESTAMP - INTERVAL '213 days', CURRENT_TIMESTAMP - INTERVAL '14 days'),
(28, 'รัตนา', 'เกษมสุข', '0999000022', NULL, NULL, '122/22 ถนนสุขุมวิท แขวงพระโขนง เขตคลองเตย กรุงเทพมหานคร 10110', CURRENT_TIMESTAMP - INTERVAL '212 days', CURRENT_TIMESTAMP - INTERVAL '1 days'),
(29, 'วีรภัทร', 'พิทักษ์ธรรม', '0999000023', NULL, NULL, '123/23 ถนนห้วยแก้ว ต.สุเทพ อ.เมืองเชียงใหม่ จ.เชียงใหม่ 50200', CURRENT_TIMESTAMP - INTERVAL '211 days', CURRENT_TIMESTAMP - INTERVAL '2 days'),
(30, 'นิตยา', 'ชูศักดิ์', '0999000024', NULL, NULL, '124/24 ถนนลงหาดบางแสน ต.แสนสุข อ.เมืองชลบุรี จ.ชลบุรี 20130', CURRENT_TIMESTAMP - INTERVAL '210 days', CURRENT_TIMESTAMP - INTERVAL '3 days'),
(31, 'ศุภชัย', 'ทองประเสริฐ', '0999000025', NULL, NULL, '125/25 ถนนเพชรเกษม ต.หาดใหญ่ อ.หาดใหญ่ จ.สงขลา 90110', CURRENT_TIMESTAMP - INTERVAL '209 days', CURRENT_TIMESTAMP - INTERVAL '4 days'),
(32, 'แพรวพรรณ', 'มีโชค', '0999000026', NULL, NULL, '126/26 ถนนสุรนารี ต.ในเมือง อ.เมืองนครราชสีมา จ.นครราชสีมา 30000', CURRENT_TIMESTAMP - INTERVAL '208 days', CURRENT_TIMESTAMP - INTERVAL '5 days'),
(33, 'ธนภัทร', 'เจริญผล', '0999000027', NULL, NULL, '127/27 ถนนศรีสุทัศน์ ต.ตลาดใหญ่ อ.เมืองภูเก็ต จ.ภูเก็ต 83000', CURRENT_TIMESTAMP - INTERVAL '207 days', CURRENT_TIMESTAMP - INTERVAL '6 days'),
(34, 'สุนิสา', 'นาคทอง', '0999000028', NULL, NULL, '128/28 ถนนนเรศวร ต.หมากแข้ง อ.เมืองอุดรธานี จ.อุดรธานี 41000', CURRENT_TIMESTAMP - INTERVAL '206 days', CURRENT_TIMESTAMP - INTERVAL '7 days'),
(35, 'กฤษณะ', 'สายชล', '0999000029', NULL, NULL, '129/29 ถนนรัตนาธิเบศร์ ต.บางกระสอ อ.เมืองนนทบุรี จ.นนทบุรี 11000', CURRENT_TIMESTAMP - INTERVAL '205 days', CURRENT_TIMESTAMP - INTERVAL '8 days'),
(36, 'จิราพร', 'มั่นคง', '0999000030', NULL, NULL, '130/30 ถนนอุบล ต.ในเมือง อ.เมืองศรีสะเกษ จ.ศรีสะเกษ 33000', CURRENT_TIMESTAMP - INTERVAL '204 days', CURRENT_TIMESTAMP - INTERVAL '9 days'),
(37, 'อัครพล', 'ศรีวัฒนา', '0999000031', NULL, NULL, '131/31 ถนนมิตรภาพ ต.ในเมือง อ.เมืองขอนแก่น จ.ขอนแก่น 40000', CURRENT_TIMESTAMP - INTERVAL '203 days', CURRENT_TIMESTAMP - INTERVAL '10 days'),
(38, 'พรทิพย์', 'บุญญรักษ์', '0999000032', NULL, NULL, '132/32 ถนนสุขุมวิท แขวงพระโขนง เขตคลองเตย กรุงเทพมหานคร 10110', CURRENT_TIMESTAMP - INTERVAL '202 days', CURRENT_TIMESTAMP - INTERVAL '11 days'),
(39, 'นราธิป', 'แก้วประดับ', '0999000033', NULL, NULL, '133/33 ถนนห้วยแก้ว ต.สุเทพ อ.เมืองเชียงใหม่ จ.เชียงใหม่ 50200', CURRENT_TIMESTAMP - INTERVAL '201 days', CURRENT_TIMESTAMP - INTERVAL '12 days'),
(40, 'อรวรรณ', 'สุขสวัสดิ์', '0999000034', NULL, NULL, '134/34 ถนนลงหาดบางแสน ต.แสนสุข อ.เมืองชลบุรี จ.ชลบุรี 20130', CURRENT_TIMESTAMP - INTERVAL '200 days', CURRENT_TIMESTAMP - INTERVAL '13 days'),
(41, 'พิชิต', 'ชัยชนะ', '0999000035', NULL, NULL, '135/35 ถนนเพชรเกษม ต.หาดใหญ่ อ.หาดใหญ่ จ.สงขลา 90110', CURRENT_TIMESTAMP - INTERVAL '199 days', CURRENT_TIMESTAMP - INTERVAL '14 days'),
(42, 'ปาริชาติ', 'อินทรักษ์', '0999000036', NULL, NULL, '136/36 ถนนสุรนารี ต.ในเมือง อ.เมืองนครราชสีมา จ.นครราชสีมา 30000', CURRENT_TIMESTAMP - INTERVAL '198 days', CURRENT_TIMESTAMP - INTERVAL '1 days'),
(43, 'สิทธิชัย', 'แสงสว่าง', '0999000037', NULL, NULL, '137/37 ถนนศรีสุทัศน์ ต.ตลาดใหญ่ อ.เมืองภูเก็ต จ.ภูเก็ต 83000', CURRENT_TIMESTAMP - INTERVAL '197 days', CURRENT_TIMESTAMP - INTERVAL '2 days'),
(44, 'นันทนา', 'รุ่งอรุณ', '0999000038', NULL, NULL, '138/38 ถนนนเรศวร ต.หมากแข้ง อ.เมืองอุดรธานี จ.อุดรธานี 41000', CURRENT_TIMESTAMP - INTERVAL '196 days', CURRENT_TIMESTAMP - INTERVAL '3 days'),
(45, 'ภาคภูมิ', 'เจริญทรัพย์', '0999000039', NULL, NULL, '139/39 ถนนรัตนาธิเบศร์ ต.บางกระสอ อ.เมืองนนทบุรี จ.นนทบุรี 11000', CURRENT_TIMESTAMP - INTERVAL '195 days', CURRENT_TIMESTAMP - INTERVAL '4 days'),
(46, 'วิภาวี', 'วงศ์เจริญ', '0999000040', NULL, NULL, '140/40 ถนนอุบล ต.ในเมือง อ.เมืองศรีสะเกษ จ.ศรีสะเกษ 33000', CURRENT_TIMESTAMP - INTERVAL '194 days', CURRENT_TIMESTAMP - INTERVAL '5 days'),
(47, 'ธีรเดช', 'พงษ์พิทักษ์', '0999000041', NULL, NULL, '141/41 ถนนมิตรภาพ ต.ในเมือง อ.เมืองขอนแก่น จ.ขอนแก่น 40000', CURRENT_TIMESTAMP - INTERVAL '193 days', CURRENT_TIMESTAMP - INTERVAL '6 days'),
(48, 'จุฑามาศ', 'ศรีนวล', '0999000042', NULL, NULL, '142/42 ถนนสุขุมวิท แขวงพระโขนง เขตคลองเตย กรุงเทพมหานคร 10110', CURRENT_TIMESTAMP - INTERVAL '192 days', CURRENT_TIMESTAMP - INTERVAL '7 days'),
(49, 'มนัส', 'ทองพูล', '0999000043', NULL, NULL, '143/43 ถนนห้วยแก้ว ต.สุเทพ อ.เมืองเชียงใหม่ จ.เชียงใหม่ 50200', CURRENT_TIMESTAMP - INTERVAL '191 days', CURRENT_TIMESTAMP - INTERVAL '8 days'),
(50, 'สุชาดา', 'รัตนพงษ์', '0999000044', NULL, NULL, '144/44 ถนนลงหาดบางแสน ต.แสนสุข อ.เมืองชลบุรี จ.ชลบุรี 20130', CURRENT_TIMESTAMP - INTERVAL '190 days', CURRENT_TIMESTAMP - INTERVAL '9 days'),
(51, 'ปกรณ์', 'บุญเลิศ', '0999000045', NULL, NULL, '145/45 ถนนเพชรเกษม ต.หาดใหญ่ อ.หาดใหญ่ จ.สงขลา 90110', CURRENT_TIMESTAMP - INTERVAL '189 days', CURRENT_TIMESTAMP - INTERVAL '10 days'),
(52, 'กัญญารัตน์', 'สุขเกษม', '0999000046', NULL, NULL, '146/46 ถนนสุรนารี ต.ในเมือง อ.เมืองนครราชสีมา จ.นครราชสีมา 30000', CURRENT_TIMESTAMP - INTERVAL '188 days', CURRENT_TIMESTAMP - INTERVAL '11 days'),
(53, 'วชิรวิทย์', 'มณีรัตน์', '0999000047', NULL, NULL, '147/47 ถนนศรีสุทัศน์ ต.ตลาดใหญ่ อ.เมืองภูเก็ต จ.ภูเก็ต 83000', CURRENT_TIMESTAMP - INTERVAL '187 days', CURRENT_TIMESTAMP - INTERVAL '12 days'),
(54, 'ดารินทร์', 'แก้วสกุล', '0999000048', NULL, NULL, '148/48 ถนนนเรศวร ต.หมากแข้ง อ.เมืองอุดรธานี จ.อุดรธานี 41000', CURRENT_TIMESTAMP - INTERVAL '186 days', CURRENT_TIMESTAMP - INTERVAL '13 days'),
(55, 'ชยพล', 'วัฒนชัย', '0999000049', NULL, NULL, '149/49 ถนนรัตนาธิเบศร์ ต.บางกระสอ อ.เมืองนนทบุรี จ.นนทบุรี 11000', CURRENT_TIMESTAMP - INTERVAL '185 days', CURRENT_TIMESTAMP - INTERVAL '14 days'),
(56, 'เมธาวี', 'จิตต์อารี', '0999000050', NULL, NULL, '150/50 ถนนอุบล ต.ในเมือง อ.เมืองศรีสะเกษ จ.ศรีสะเกษ 33000', CURRENT_TIMESTAMP - INTERVAL '184 days', CURRENT_TIMESTAMP - INTERVAL '1 days')
ON CONFLICT (customer_id) DO NOTHING;

-- 6. PRODUCT_ITEM (Serialized Units)
INSERT INTO product_item (item_id, model_id, item_serial_number, item_imei, item_condition, item_grade, battery_health, cost_price, selling_price, item_status, warranty_expire_date, created_at, updated_at)
VALUES
(1, 1, 'SN-AP-IP16P-001', '358912345678901', 'NEW', 'A+', 100, 37500.00, 43900.00, 'SOLD', CURRENT_TIMESTAMP - INTERVAL '7 days' + INTERVAL '12 months', CURRENT_TIMESTAMP - INTERVAL '239 days', CURRENT_TIMESTAMP - INTERVAL '2 days'),
(2, 1, 'SN-AP-IP16P-002', '358912345678902', 'NEW', 'A+', 100, 37500.00, 43900.00, 'AVAILABLE', NULL, CURRENT_TIMESTAMP - INTERVAL '238 days', CURRENT_TIMESTAMP - INTERVAL '3 days'),
(3, 1, 'SN-AP-IP16P-003', '358912345678903', 'NEW', 'A+', 100, 37500.00, 43900.00, 'RESERVED', NULL, CURRENT_TIMESTAMP - INTERVAL '237 days', CURRENT_TIMESTAMP - INTERVAL '4 days'),
(4, 2, 'SN-AP-IP16-001', '359012345678901', 'NEW', 'A+', 100, 25000.00, 29900.00, 'AVAILABLE', NULL, CURRENT_TIMESTAMP - INTERVAL '236 days', CURRENT_TIMESTAMP - INTERVAL '5 days'),
(5, 2, 'SN-AP-IP16-002', '359012345678902', 'NEW', 'A+', 100, 25000.00, 29900.00, 'AVAILABLE', NULL, CURRENT_TIMESTAMP - INTERVAL '235 days', CURRENT_TIMESTAMP - INTERVAL '6 days'),
(6, 3, 'SN-AP-IP15-SH01', '358712345678999', 'SECOND_HAND', 'A', 92, 16000.00, 19900.00, 'SOLD', CURRENT_TIMESTAMP - INTERVAL '1 days' + INTERVAL '3 months', CURRENT_TIMESTAMP - INTERVAL '234 days', CURRENT_TIMESTAMP - INTERVAL '7 days'),
(7, 3, 'SN-AP-IP15-SH02', '358712345678998', 'SECOND_HAND', 'B', 87, 14500.00, 17900.00, 'AVAILABLE', NULL, CURRENT_TIMESTAMP - INTERVAL '233 days', CURRENT_TIMESTAMP - INTERVAL '8 days'),
(8, 4, 'SN-AP-IPAD-001', '356512345678901', 'NEW', 'A+', 100, 18200.00, 21900.00, 'AVAILABLE', NULL, CURRENT_TIMESTAMP - INTERVAL '232 days', CURRENT_TIMESTAMP - INTERVAL '9 days'),
(9, 5, 'SN-AP-AW10-001', '357112345678901', 'NEW', 'A+', 100, 13200.00, 15900.00, 'AVAILABLE', NULL, CURRENT_TIMESTAMP - INTERVAL '231 days', CURRENT_TIMESTAMP - INTERVAL '10 days'),
(10, 7, 'SN-SS-A55-001', '354112345678901', 'NEW', 'A+', 100, 11200.00, 13999.00, 'SOLD', CURRENT_TIMESTAMP - INTERVAL '4 days' + INTERVAL '12 months', CURRENT_TIMESTAMP - INTERVAL '230 days', CURRENT_TIMESTAMP - INTERVAL '11 days'),
(11, 7, 'SN-SS-A55-002', '354112345678902', 'NEW', 'A+', 100, 11200.00, 13999.00, 'AVAILABLE', NULL, CURRENT_TIMESTAMP - INTERVAL '229 days', CURRENT_TIMESTAMP - INTERVAL '12 days'),
(12, 6, 'SN-SS-S24U-001', '353312345678901', 'NEW', 'A+', 100, 39500.00, 46900.00, 'AVAILABLE', NULL, CURRENT_TIMESTAMP - INTERVAL '228 days', CURRENT_TIMESTAMP - INTERVAL '13 days'),
(13, 6, 'SN-SS-S24U-SH01', '353312345678999', 'SECOND_HAND', 'A+', 96, 32000.00, 37900.00, 'AVAILABLE', NULL, CURRENT_TIMESTAMP - INTERVAL '227 days', CURRENT_TIMESTAMP - INTERVAL '14 days'),
(14, 8, 'SN-SS-TABS9-001', '352212345678901', 'NEW', 'A+', 100, 12000.00, 14900.00, 'AVAILABLE', NULL, CURRENT_TIMESTAMP - INTERVAL '226 days', CURRENT_TIMESTAMP - INTERVAL '1 days'),
(15, 9, 'SN-XI-MI14U-001', '861112345678901', 'NEW', 'A+', 100, 31800.00, 37990.00, 'AVAILABLE', NULL, CURRENT_TIMESTAMP - INTERVAL '225 days', CURRENT_TIMESTAMP - INTERVAL '2 days'),
(16, 12, 'SN-OP-RENO11-001', '862212345678901', 'NEW', 'A+', 100, 10100.00, 12990.00, 'AVAILABLE', NULL, CURRENT_TIMESTAMP - INTERVAL '224 days', CURRENT_TIMESTAMP - INTERVAL '3 days'),
(17, 13, 'SN-VV-V30-001', '863312345678901', 'NEW', 'A+', 100, 10900.00, 13999.00, 'AVAILABLE', NULL, CURRENT_TIMESTAMP - INTERVAL '223 days', CURRENT_TIMESTAMP - INTERVAL '4 days')
ON CONFLICT (item_id) DO NOTHING;

-- 7. HISTORICAL SERIALIZED STOCK: 12 units per added model, 360 extra units.
-- Four sold, one reserved, occasional damaged/claiming units, remaining available.
-- Stable keys allow reruns; dates are relative to the day the seed is executed.
INSERT INTO product_item (item_id, model_id, item_serial_number, item_imei,
    item_condition, item_grade, battery_health, cost_price, selling_price,
    item_status, warranty_expire_date, created_at, updated_at)
SELECT 18 + (m.model_id - 16) * 12 + u.n - 1, m.model_id,
       'DEMO-SN-' || m.model_id || '-' || LPAD(u.n::text, 3, '0'),
       CASE WHEN m.category_id = 1
            THEN '990' || LPAD((18 + (m.model_id - 16) * 12 + u.n - 1)::text, 12, '0')
            ELSE NULL END,
       CASE WHEN u.n % 2 = 0 THEN 'SECOND_HAND' ELSE 'NEW' END,
       CASE WHEN u.n % 2 = 0 THEN 'B' ELSE 'A+' END,
       CASE WHEN u.n % 2 = 0 THEN 82 + ((m.model_id + u.n) % 14) ELSE 100 END,
       ROUND(m.standard_cost * CASE WHEN u.n % 2 = 0 THEN 0.70 ELSE 1 END, 2),
       ROUND(m.standard_price * CASE WHEN u.n % 2 = 0 THEN 0.80 ELSE 1 END, 2),
       CASE WHEN u.n <= 4 THEN 'SOLD'
            WHEN u.n = 5 THEN 'RESERVED'
            WHEN u.n = 6 AND m.model_id % 5 = 0 THEN 'DAMAGED'
            WHEN u.n = 7 AND m.model_id % 7 = 0 THEN 'CLAIMING'
            ELSE 'AVAILABLE' END,
       CASE WHEN u.n <= 4 THEN
           CURRENT_TIMESTAMP - ((1 + ((m.model_id - 16) * 17 + u.n * 11) % 180) * INTERVAL '1 day')
           + CASE WHEN u.n % 2 = 0 THEN INTERVAL '3 months' ELSE INTERVAL '12 months' END
           ELSE NULL END,
       CURRENT_TIMESTAMP - INTERVAL '210 days',
       CURRENT_TIMESTAMP - ((1 + ((m.model_id - 16) * 17 + u.n * 11) % 180) * INTERVAL '1 day')
FROM product_model m CROSS JOIN generate_series(1, 12) AS u(n)
WHERE m.model_id BETWEEN 16 AND 45
ON CONFLICT (item_id) DO NOTHING;

-- 8. SALE ORDER: repeat customers and activity over the past 180 days.
-- 123 completed orders, 10 pending reservations and 10 cancelled orders.
INSERT INTO sale_order (sale_id, sale_code, sale_date, subtotal_amount,
    discount_amount, total_amount, sale_status, customer_id, created_by, created_at, updated_at)
WITH sales AS (
    SELECT 1::bigint AS id, 1::bigint AS item_id, 1::bigint AS customer_id, 3 AS staff_id, 7 AS age_days, 1000::numeric AS discount
    UNION ALL SELECT 2, 10, 2, 3, 4, 0
    UNION ALL SELECT 3, 6, 3, 3, 1, 400
    UNION ALL
    SELECT 4 + (m - 16) * 4 + u - 1, 18 + (m - 16) * 12 + u - 1,
           1 + ((m * 7 + u * 11) % 56), CASE WHEN u % 2 = 0 THEN 6 ELSE 3 END,
           1 + ((m - 16) * 17 + u * 11) % 180, (u % 3) * 100
    FROM generate_series(16, 45) AS m CROSS JOIN generate_series(1, 4) AS u
    UNION ALL
    SELECT 124 + n, 18 + n * 12 + 4, 1 + n % 56, 6, n % 5, 0
    FROM generate_series(0, 9) AS n
    UNION ALL
    SELECT 134 + n, 18 + (10 + n) * 12 + 11, 1 + (n * 3) % 56, 3, 10 + n, 0
    FROM generate_series(0, 9) AS n
), amounts AS (
    SELECT s.*, i.selling_price + CASE WHEN s.id BETWEEN 4 AND 123 AND s.id % 2 = 0
           THEN (1 + s.id % 3) * a.standard_price ELSE 0 END AS subtotal
    FROM sales s JOIN product_item i ON i.item_id = s.item_id
    JOIN product_model a ON a.model_id = 46 + s.id % 15
)
SELECT id, 'DEMO-SO-' || LPAD(id::text, 5, '0'),
       CURRENT_TIMESTAMP - (age_days * INTERVAL '1 day'), subtotal, discount, subtotal - discount,
       CASE WHEN id >= 134 THEN 'CANCELLED' WHEN id >= 124 THEN 'PENDING' ELSE 'COMPLETED' END,
       customer_id, staff_id, CURRENT_TIMESTAMP - (age_days * INTERVAL '1 day'),
       CURRENT_TIMESTAMP - (age_days * INTERVAL '1 day')
FROM amounts
ON CONFLICT (sale_id) DO NOTHING;

-- 9. SALE ORDER ITEM: 143 serialized lines plus 60 accessory lines.
INSERT INTO sale_order_item (sale_item_id, sale_id, model_id, item_id, quantity,
    unit_cost, unit_price, discount_amount, warranty_expire_date, created_at, updated_at)
WITH lines AS (
    SELECT s.sale_id, CASE s.sale_id WHEN 1 THEN 1 WHEN 2 THEN 10 WHEN 3 THEN 6
           ELSE CASE WHEN s.sale_id <= 123 THEN
               18 + ((s.sale_id - 4) / 4) * 12 + (s.sale_id - 4) % 4
           WHEN s.sale_id <= 133 THEN 18 + (s.sale_id - 124) * 12 + 4
           ELSE 18 + (10 + s.sale_id - 134) * 12 + 11 END END AS item_id
    FROM sale_order s WHERE s.sale_id BETWEEN 1 AND 143
)
SELECT s.sale_id, s.sale_id, i.model_id, i.item_id, 1,
       i.cost_price, i.selling_price, s.discount_amount,
       CASE WHEN s.sale_status = 'COMPLETED' THEN s.sale_date +
           CASE WHEN i.item_condition = 'SECOND_HAND' THEN INTERVAL '3 months' ELSE INTERVAL '12 months' END
           ELSE NULL END,
       s.sale_date, s.sale_date
FROM lines l JOIN sale_order s ON s.sale_id = l.sale_id
JOIN product_item i ON i.item_id = l.item_id
ON CONFLICT (sale_item_id) DO NOTHING;

INSERT INTO sale_order_item (sale_item_id, sale_id, model_id, item_id, quantity,
    unit_cost, unit_price, discount_amount, warranty_expire_date, created_at, updated_at)
SELECT 144 + (s.sale_id - 4) / 2, s.sale_id, a.model_id, NULL, 1 + s.sale_id % 3,
       a.standard_cost, a.standard_price, 0, NULL, s.sale_date, s.sale_date
FROM sale_order s JOIN product_model a ON a.model_id = 46 + s.sale_id % 15
WHERE s.sale_id BETWEEN 4 AND 123 AND s.sale_id % 2 = 0
ON CONFLICT (sale_item_id) DO NOTHING;

-- 10. PAYMENTS: all four payment methods; no receipts for pending/cancelled sales.
INSERT INTO payment (payment_id, sale_id, payment_method, amount, payment_status,
    reference_no, payment_date, received_by, created_at, updated_at)
SELECT s.sale_id, s.sale_id,
       CASE s.sale_id % 4 WHEN 0 THEN 'CASH' WHEN 1 THEN 'TRANSFER'
            WHEN 2 THEN 'CREDIT_CARD' ELSE 'INSTALLMENT' END,
       s.total_amount, 'COMPLETED', 'DEMO-PAY-' || LPAD(s.sale_id::text, 5, '0'),
       s.sale_date, s.created_by, s.sale_date, s.sale_date
FROM sale_order s WHERE s.sale_id BETWEEN 1 AND 123 AND s.sale_status = 'COMPLETED'
ON CONFLICT (payment_id) DO NOTHING;

-- 11. WARRANTIES: historical purchases include active and expired warranties.
INSERT INTO product_warranty (warranty_id, sale_item_id, warranty_code, item_imei,
    start_date, expire_date, terms_conditions, warranty_status, created_at, updated_at)
SELECT si.sale_item_id, si.sale_item_id, 'DEMO-WAR-' || LPAD(si.sale_item_id::text, 5, '0'),
       i.item_imei, s.sale_date::date, si.warranty_expire_date::date,
       CASE WHEN i.item_condition = 'SECOND_HAND' THEN 'รับประกันเครื่องมือสอง 3 เดือน'
            ELSE 'รับประกันตัวเครื่อง 12 เดือน ครอบคลุมความบกพร่องจากการผลิต' END,
       CASE WHEN si.warranty_expire_date::date < CURRENT_DATE THEN 'EXPIRED' ELSE 'ACTIVE' END,
       s.sale_date, s.sale_date
FROM sale_order_item si JOIN sale_order s ON s.sale_id = si.sale_id
JOIN product_item i ON i.item_id = si.item_id
WHERE s.sale_id BETWEEN 1 AND 123 AND s.sale_status = 'COMPLETED'
ON CONFLICT (warranty_id) DO NOTHING;

-- 12. TAX INVOICES: half of completed sales, plus the first demo sale.
-- Prices and VAT here are illustrative demo amounts.
INSERT INTO tax_invoice (invoice_id, sale_id, invoice_number, company_or_buyer_name,
    tax_id, branch_number, address, subtotal_amount, vat_rate, vat_amount,
    grand_total, issued_at, created_at, updated_at)
SELECT s.sale_id, s.sale_id, 'DEMO-INV-' || LPAD(s.sale_id::text, 5, '0'),
       c.customer_fname || ' ' || c.customer_lname,
       COALESCE(c.customer_tax_number, '0000000000000'), '00000', c.customer_address,
       ROUND(s.total_amount * 100 / 107, 2), 7.00,
       s.total_amount - ROUND(s.total_amount * 100 / 107, 2), s.total_amount,
       s.sale_date, s.sale_date, s.sale_date
FROM sale_order s JOIN customer c ON c.customer_id = s.customer_id
WHERE s.sale_id BETWEEN 1 AND 123 AND s.sale_status = 'COMPLETED'
  AND (s.sale_id % 2 = 0 OR s.sale_id = 1)
ON CONFLICT (invoice_id) DO NOTHING;

-- 13. Generated IDs must continue after explicitly seeded IDs.
-- Preserve higher sequence values when this script is rerun.
SELECT setval(pg_get_serial_sequence('app_user', 'user_id'),
    GREATEST((SELECT MAX(user_id) FROM app_user),
        pg_sequence_last_value(pg_get_serial_sequence('app_user', 'user_id')::regclass)), true);
SELECT setval(pg_get_serial_sequence('brand', 'brand_id'),
    GREATEST((SELECT MAX(brand_id) FROM brand),
        pg_sequence_last_value(pg_get_serial_sequence('brand', 'brand_id')::regclass)), true);
SELECT setval(pg_get_serial_sequence('category', 'category_id'),
    GREATEST((SELECT MAX(category_id) FROM category),
        pg_sequence_last_value(pg_get_serial_sequence('category', 'category_id')::regclass)), true);
SELECT setval(pg_get_serial_sequence('product_model', 'model_id'),
    GREATEST((SELECT MAX(model_id) FROM product_model),
        pg_sequence_last_value(pg_get_serial_sequence('product_model', 'model_id')::regclass)), true);
SELECT setval(pg_get_serial_sequence('customer', 'customer_id'),
    GREATEST((SELECT MAX(customer_id) FROM customer),
        pg_sequence_last_value(pg_get_serial_sequence('customer', 'customer_id')::regclass)), true);
SELECT setval(pg_get_serial_sequence('product_item', 'item_id'),
    GREATEST((SELECT MAX(item_id) FROM product_item),
        pg_sequence_last_value(pg_get_serial_sequence('product_item', 'item_id')::regclass)), true);
SELECT setval(pg_get_serial_sequence('sale_order', 'sale_id'),
    GREATEST((SELECT MAX(sale_id) FROM sale_order),
        pg_sequence_last_value(pg_get_serial_sequence('sale_order', 'sale_id')::regclass)), true);
SELECT setval(pg_get_serial_sequence('sale_order_item', 'sale_item_id'),
    GREATEST((SELECT MAX(sale_item_id) FROM sale_order_item),
        pg_sequence_last_value(pg_get_serial_sequence('sale_order_item', 'sale_item_id')::regclass)), true);
SELECT setval(pg_get_serial_sequence('payment', 'payment_id'),
    GREATEST((SELECT MAX(payment_id) FROM payment),
        pg_sequence_last_value(pg_get_serial_sequence('payment', 'payment_id')::regclass)), true);
SELECT setval(pg_get_serial_sequence('product_warranty', 'warranty_id'),
    GREATEST((SELECT MAX(warranty_id) FROM product_warranty),
        pg_sequence_last_value(pg_get_serial_sequence('product_warranty', 'warranty_id')::regclass)), true);
SELECT setval(pg_get_serial_sequence('tax_invoice', 'invoice_id'),
    GREATEST((SELECT MAX(invoice_id) FROM tax_invoice),
        pg_sequence_last_value(pg_get_serial_sequence('tax_invoice', 'invoice_id')::regclass)), true);
