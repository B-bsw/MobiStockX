# คำอธิบาย Use Case (Use Case Description)
**โปรเจกต์:** MobiStock X  
**วิชา:** CP353002 Principles of Software Design and Development  

---

### UC-01: เข้าสู่ระบบ (User Authentication & Login)
- **Actor:** พนักงานทุกคน (Cashier, Manager, Technician, Admin)
- **Pre-condition:** ผู้ใช้งานมีบัญชีในระบบที่ Active อยู่
- **Main Flow:**
  1. ผู้ใช้กรอก Username และ Password ในหน้า Login
  2. Frontend ส่งคำขอ POST `/api/v1/auth/login` ไปยัง Backend
  3. Backend ตรวจสอบข้อมูลผู้ใช้ในตาราง `app_user` และยืนยันรหัสผ่านด้วย BCrypt
  4. Backend สร้าง JWT Token พร้อม Role ของผู้ใช้ แล้วส่งกลับไปยัง Client
  5. Frontend บันทึก Token และนำผู้ใช้ไปยังหน้า Dashboard ตามสิทธิ์
- **Post-condition:** ผู้ใช้เข้าสู่ระบบสำเร็จและได้รับ JWT Bearer Token

---

### UC-02: ขายสินค้าหน้าร้าน (Process POS Sale)
- **Actor:** พนักงานขาย (Cashier)
- **Pre-condition:** Cashier เข้าสู่ระบบแล้ว และสินค้าในสต็อกมีสถานะ `IN_STOCK`
- **Main Flow:**
  1. Cashier เลือกหรือค้นหาข้อมูลลูกค้า (หรือกดสร้างลูกค้าใหม่)
  2. Cashier สแกนบาร์โค้ด / IMEI ของสินค้าลงในรายการขาย
  3. ระบบคำนวณยอดรวม (Subtotal) และส่วนลดตาม Strategy (Fixed/Percentage)
  4. Cashier เลือกร้องขอใบกำกับภาษีเต็มรูป (UC-03: Extend) หากลูกค้าต้องการ
  5. Cashier เลือกลักษณะการชำระเงิน (CASH, CREDIT_CARD, QR_PROMPTPAID) และกรอกยอดเงิน
  6. Backend ทำการบันทึกรายการขาย `sale_order`, `sale_order_item`, `payment`
  7. ระบบอัปเดตสถานะของเครื่องสินค้านั้นจาก `IN_STOCK` เป็น `SOLD`
  8. ระบบออกรหัสรับประกัน `product_warranty` อัตโนมัติผูกกับเลขอีมี่ (IMEI)
- **Post-condition:** การขายเสร็จสมบูรณ์ สต็อกสินค้าถูกตัด ยอดขายและประกันถูกบันทึก

---

### UC-03: ออกใบกำกับภาษีเต็มรูปแบบ (Generate Tax Invoice) <<extend>>
- **Actor:** พนักงานขาย (Cashier)
- **Main Flow:**
  1. ลูกค้าร้องขอใบกำกับภาษีเต็มรูป
  2. Cashier กรอกชื่อบริษัท/บุคคล เลขประจำตัวผู้เสียภาษี และที่อยู่
  3. ระบบคำนวณแยกภาษีมูลค่าเพิ่ม 7% (Subtotal, VAT Rate 7%, VAT Amount, Grand Total) ผ่าน `TaxInvoiceFactory`
  4. ระบบออกเลขที่ใบกำกับภาษี (Invoice Number) และบันทึกลงตาราง `tax_invoice`
- **Post-condition:** บันทึกข้อมูลใบกำกับภาษีผูกกับ `sale_order` แบบ One-to-One

---

### UC-04: ตรวจสอบและค้นหาสต็อกสินค้า (Search & Check IMEI)
- **Actor:** พนักงานขาย (Cashier), ช่างเทคนิค (Technician), ผู้จัดการ (Manager)
- **Main Flow:**
  1. ผู้ใช้สแกนหรือพิมพ์ Serial Number / IMEI ลงในช่องค้นหา
  2. ระบบแสดงรายละเอียดรุ่นสินค้า สี ความจุ ราคา สถานะสต็อก (`IN_STOCK`, `SOLD`, `DEFECTIVE`)
- **Post-condition:** ทราบสถานะปัจจุบันของตัวเครื่อง
