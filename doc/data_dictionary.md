# พจนานุกรมข้อมูล (Data Dictionary)
**โปรเจกต์:** MobiStock X (ระบบบริหารจัดการร้านค้าปลีกสินค้าอิเล็กทรอนิกส์/โทรศัพท์มือถือ)  
**วิชา:** CP353002 Principles of Software Design and Development (Spring Boot)  
**ฐานข้อมูล:** PostgreSQL  

---

### 1. ตาราง `app_user` (ข้อมูลพนักงานและผู้ใช้งานระบบ)
| ชื่อคอลัมน์ (Column) | ชนิดข้อมูล (Data Type) | Nullable | Primary/Foreign Key | คำอธิบาย (Description) |
|---|---|:---:|:---:|---|
| `user_id` | BIGSERIAL | NO | PK | รหัสประจำตัวผู้ใช้ |
| `username` | VARCHAR(50) | NO | Unique | ชื่อผู้ใช้สำหรับ Login |
| `email` | VARCHAR(100) | NO | Unique | อีเมลพนักงาน |
| `password` | VARCHAR(255) | NO | - | รหัสผ่านเข้ารหัสด้วย BCrypt |
| `full_name` | VARCHAR(100) | NO | - | ชื่อ-นามสกุลจริง |
| `phone` | VARCHAR(20) | YES | - | เบอร์โทรศัพท์ |
| `role` | VARCHAR(20) | NO | - | บทบาทผู้ใช้ (ADMIN, MANAGER, CASHIER, TECHNICIAN) |
| `is_active` | BOOLEAN | NO | - | สถานะเปิดใช้งานบัญชี (Default: true) |
| `created_at` | TIMESTAMP | NO | - | วันเวลาที่สร้างข้อมูล |
| `updated_at` | TIMESTAMP | YES | - | วันเวลาที่แก้ไขล่าสุด |

---

### 2. ตาราง `brand` (แบรนด์สินค้า)
| ชื่อคอลัมน์ | ชนิดข้อมูล | Nullable | Key | คำอธิบาย |
|---|---|:---:|:---:|---|
| `brand_id` | BIGSERIAL | NO | PK | รหัสแบรนด์ |
| `brand_name` | VARCHAR(100) | NO | Unique | ชื่อแบรนด์ เช่น Apple, Samsung, Xiaomi |
| `brand_country` | VARCHAR(100) | YES | - | ประเทศต้นกำเนิด |
| `image_url` | VARCHAR(500) | YES | - | ลิงก์โลโก้แบรนด์ |
| `created_at` | TIMESTAMP | NO | - | วันเวลาที่สร้าง |
| `updated_at` | TIMESTAMP | YES | - | วันเวลาที่แก้ไข |

---

### 3. ตาราง `category` (หมวดหมู่สินค้า)
| ชื่อคอลัมน์ | ชนิดข้อมูล | Nullable | Key | คำอธิบาย |
|---|---|:---:|:---:|---|
| `category_id` | BIGSERIAL | NO | PK | รหัสหมวดหมู่ |
| `category_name_th` | VARCHAR(100) | NO | Unique | ชื่อหมวดหมู่ภาษาไทย (เช่น สมาร์ทโฟน, แท็บเล็ต) |
| `category_name_en` | VARCHAR(100) | YES | - | ชื่อหมวดหมู่ภาษาอังกฤษ |
| `is_serialized` | BOOLEAN | NO | - | ต้องคุม Serial/IMEI หรือไม่ (Default: true) |
| `created_at` | TIMESTAMP | NO | - | วันเวลาที่สร้าง |
| `updated_at` | TIMESTAMP | YES | - | วันเวลาที่แก้ไข |

---

### 4. ตาราง `customer` (ข้อมูลลูกค้า)
| ชื่อคอลัมน์ | ชนิดข้อมูล | Nullable | Key | คำอธิบาย |
|---|---|:---:|:---:|---|
| `customer_id` | BIGSERIAL | NO | PK | รหัสลูกค้า |
| `first_name` | VARCHAR(100) | NO | - | ชื่อจริง |
| `last_name` | VARCHAR(100) | NO | - | นามสกุล |
| `phone` | VARCHAR(20) | NO | Unique, Index | เบอร์โทรศัพท์ (ใช้ค้นหาหน้าร้าน) |
| `email` | VARCHAR(100) | YES | - | อีเมล |
| `tax_id` | VARCHAR(20) | YES | - | เลขประจำตัวผู้เสียภาษี 13 หลัก |
| `address` | TEXT | YES | - | ที่อยู่สำหรับออกบิลและจัดส่ง |
| `created_at` | TIMESTAMP | NO | - | วันเวลาที่สร้าง |
| `updated_at` | TIMESTAMP | YES | - | วันเวลาที่แก้ไข |

---

### 5. ตาราง `product_model` (รุ่นสินค้า / มาสเตอร์แคตตาล็อก)
| ชื่อคอลัมน์ | ชนิดข้อมูล | Nullable | Key | คำอธิบาย |
|---|---|:---:|:---:|---|
| `model_id` | BIGSERIAL | NO | PK | รหัสรุ่นสินค้า |
| `brand_id` | BIGINT | NO | FK -> `brand(brand_id)` | แบรนด์สินค้า |
| `category_id` | BIGINT | NO | FK -> `category(category_id)` | หมวดหมู่สินค้า |
| `model_code` | VARCHAR(50) | NO | Unique, Index | รหัสรุ่นสินค้า (SKU) |
| `model_name` | VARCHAR(200) | NO | - | ชื่อทางการค้า (เช่น iPhone 15 Pro Max 256GB) |
| `color` | VARCHAR(50) | YES | - | สีตัวเครื่อง |
| `capacity` | VARCHAR(50) | YES | - | ความจุ (เช่น 128GB, 256GB) |
| `standard_price` | NUMERIC(10,2) | NO | - | ราคาขายมาตรฐานหน้าร้าน |
| `model_warranty_duration` | INT | NO | - | ระยะเวลารับประกันมาตรฐาน (จำนวนเดือน Default: 12) |
| `created_at` | TIMESTAMP | NO | - | วันเวลาที่สร้าง |
| `updated_at` | TIMESTAMP | YES | - | วันเวลาที่แก้ไข |

---

### 6. ตาราง `product_item` (เครื่องสินค้าแต่ละชิ้น คุมตาม IMEI/Serial)
| ชื่อคอลัมน์ | ชนิดข้อมูล | Nullable | Key | คำอธิบาย |
|---|---|:---:|:---:|---|
| `item_id` | BIGSERIAL | NO | PK | รหัสประจำตัวสินค้าชิ้นนี้ |
| `model_id` | BIGINT | NO | FK -> `product_model(model_id)` | รหัสรุ่นสินค้า |
| `imei` | VARCHAR(20) | YES | Unique, Index | หมายเลข IMEI ประจำเครื่อง 15 หลัก |
| `serial_number` | VARCHAR(50) | YES | Unique, Index | หมายเลข Serial Number |
| `cost_price` | NUMERIC(10,2) | NO | - | ราคาทุนที่รับเข้า |
| `status` | VARCHAR(20) | NO | Index | สถานะเครื่อง (`IN_STOCK`, `RESERVED`, `SOLD`, `DEFECTIVE`) |
| `item_condition` | VARCHAR(20) | NO | - | สภาพเครื่อง (`BRAND_NEW`, `REFURBISHED`, `USED`) |
| `received_date` | TIMESTAMP | NO | - | วันเวลาที่รับเข้าสต็อก |
| `created_at` | TIMESTAMP | NO | - | วันเวลาที่สร้าง |
| `updated_at` | TIMESTAMP | YES | - | วันเวลาที่แก้ไข |

---

### 7. ตาราง `product_warranty` (ข้อมูลการรับประกันสินค้า)
| ชื่อคอลัมน์ | ชนิดข้อมูล | Nullable | Key | คำอธิบาย |
|---|---|:---:|:---:|---|
| `warranty_id` | BIGSERIAL | NO | PK | รหัสการรับประกัน |
| `warranty_code` | VARCHAR(50) | NO | Unique, Index | รหัสบัตรรับประกัน (เช่น WAR-202610-001) |
| `item_imei` | VARCHAR(20) | NO | Index | หมายเลขอีมี่เครื่องที่รับประกัน |
| `start_date` | DATE | NO | - | วันที่เริ่มคุ้มครอง (วันที่ซื้อ) |
| `expire_date` | DATE | NO | - | วันที่หมดอายุความคุ้มครอง |
| `terms_conditions` | TEXT | YES | - | เงื่อนไขการรับประกัน |
| `warranty_status` | VARCHAR(20) | NO | - | สถานะ (`ACTIVE`, `EXPIRED`, `VOID`) |
| `created_at` | TIMESTAMP | NO | - | วันเวลาที่สร้าง |
| `updated_at` | TIMESTAMP | YES | - | วันเวลาที่แก้ไข |

---

### 8. ตาราง `sale_order` (ใบสั่งขาย / รายการขาย)
| ชื่อคอลัมน์ | ชนิดข้อมูล | Nullable | Key | คำอธิบาย |
|---|---|:---:|:---:|---|
| `sale_id` | BIGSERIAL | NO | PK | รหัสรายการขาย |
| `sale_code` | VARCHAR(50) | NO | Unique, Index | เลขที่ใบเสร็จรับเงิน (เช่น SO-202610-001) |
| `customer_id` | BIGINT | YES | FK -> `customer(customer_id)` | ลูกค้าที่ซื้อ (หรือลูกค้าทั่วไป) |
| `cashier_id` | BIGINT | NO | FK -> `app_user(user_id)` | พนักงานขายที่ทำรายการ |
| `sale_date` | TIMESTAMP | NO | Index | วันเวลาที่ทำการขาย |
| `subtotal_amount` | NUMERIC(10,2) | NO | - | ยอดรวมก่อนหักส่วนลด |
| `discount_amount` | NUMERIC(10,2) | NO | - | ส่วนลดรวมที่ได้รับ |
| `total_amount` | NUMERIC(10,2) | NO | - | ยอดสุทธิที่ต้องชำระ (Grand Total) |
| `status` | VARCHAR(20) | NO | - | สถานะการขาย (`PENDING`, `COMPLETED`, `CANCELLED`) |
| `created_at` | TIMESTAMP | NO | - | วันเวลาที่สร้าง |
| `updated_at` | TIMESTAMP | YES | - | วันเวลาที่แก้ไข |

---

### 9. ตาราง `sale_order_item` (รายการสินค้าย่อยในบิลขาย)
| ชื่อคอลัมน์ | ชนิดข้อมูล | Nullable | Key | คำอธิบาย |
|---|---|:---:|:---:|---|
| `order_item_id` | BIGSERIAL | NO | PK | รหัสรายการย่อย |
| `sale_id` | BIGINT | NO | FK -> `sale_order(sale_id)` | บิลขายที่สังกัด |
| `model_id` | BIGINT | NO | FK -> `product_model(model_id)` | รุ่นสินค้า |
| `item_id` | BIGINT | YES | FK -> `product_item(item_id)` | เครื่องสินค้าเฉพาะชิ้นที่ตัดสต็อก |
| `warranty_id` | BIGINT | YES | FK -> `product_warranty(warranty_id)` | สิทธิ์รับประกันที่ผูกกับรายการนี้ |
| `quantity` | INT | NO | - | จำนวนที่ซื้อ |
| `unit_cost` | NUMERIC(10,2) | NO | - | ราคาทุนต่อหน่วย ณ เวลาขาย |
| `unit_price` | NUMERIC(10,2) | NO | - | ราคาขายต่อหน่วย |
| `discount_amount` | NUMERIC(10,2) | NO | - | ส่วนลดเฉพาะรายการนี้ |
| `warranty_expire_date` | DATE | YES | - | วันหมดประกัน |

---

### 10. ตาราง `payment` (การชำระเงิน)
| ชื่อคอลัมน์ | ชนิดข้อมูล | Nullable | Key | คำอธิบาย |
|---|---|:---:|:---:|---|
| `payment_id` | BIGSERIAL | NO | PK | รหัสการชำระเงิน |
| `sale_id` | BIGINT | NO | FK -> `sale_order(sale_id)` | บิลขายที่ชำระ |
| `payment_method` | VARCHAR(30) | NO | - | วิธีชำระ (`CASH`, `CREDIT_CARD`, `QR_PROMPTPAID`, `TRANSFER`) |
| `amount` | NUMERIC(10,2) | NO | - | จำนวนเงินที่รับชำระ |
| `payment_status` | VARCHAR(20) | NO | - | สถานะ (`COMPLETED`, `PENDING`, `FAILED`) |
| `reference_no` | VARCHAR(100) | YES | - | เลขที่อ้างอิงสลิปโอน / เลขบัตรเครดิต |
| `payment_date` | TIMESTAMP | NO | - | วันเวลาที่ชำระเงิน |
| `received_by` | BIGINT | NO | FK -> `app_user(user_id)` | พนักงานผู้รับเงิน |
| `created_at` | TIMESTAMP | NO | - | วันเวลาที่สร้าง |
| `updated_at` | TIMESTAMP | YES | - | วันเวลาที่แก้ไข |

---

### 11. ตาราง `tax_invoice` (ใบกำกับภาษีเต็มรูป — One-to-One กับ `sale_order`)
| ชื่อคอลัมน์ | ชนิดข้อมูล | Nullable | Key | คำอธิบาย |
|---|---|:---:|:---:|---|
| `invoice_id` | BIGSERIAL | NO | PK | รหัสใบกำกับภาษี |
| `sale_id` | BIGINT | NO | Unique FK -> `sale_order(sale_id)` | บิลขาย (1:1 Relation) |
| `invoice_number` | VARCHAR(50) | NO | Unique, Index | เลขที่ใบกำกับภาษี (เช่น INV-202610-001) |
| `company_or_buyer_name` | VARCHAR(200) | NO | - | ชื่อบริษัท หรือ ชื่อ-นามสกุล ผู้ซื้อ |
| `tax_id` | VARCHAR(20) | NO | Index | เลขประจำตัวผู้เสียภาษีอากร 13 หลัก |
| `branch_number` | VARCHAR(10) | NO | - | รหัสสาขา (สำนักงานใหญ่คือ '00000') |
| `address` | TEXT | NO | - | ที่อยู่ตามทะเบียนภาษี |
| `subtotal_amount` | NUMERIC(10,2) | NO | - | มูลค่าสินค้าก่อนภาษี (ฐานภาษี) |
| `vat_rate` | NUMERIC(5,2) | NO | - | อัตราภาษีมูลค่าเพิ่ม (7.00%) |
| `vat_amount` | NUMERIC(10,2) | NO | - | จำนวนเงินภาษีมูลค่าเพิ่ม 7% |
| `grand_total` | NUMERIC(10,2) | NO | - | จำนวนเงินรวมทั้งสิ้น (ตรงกับ total ใน sale_order) |
| `issued_at` | TIMESTAMP | NO | - | วันเวลาที่ออกใบกำกับภาษี |
| `pdf_url` | VARCHAR(500) | YES | - | ลิงก์ดาวน์โหลดไฟล์ PDF ใบกำกับภาษี |
| `created_at` | TIMESTAMP | NO | - | วันเวลาที่สร้าง |
| `updated_at` | TIMESTAMP | YES | - | วันเวลาที่แก้ไข |
