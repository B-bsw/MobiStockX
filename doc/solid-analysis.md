# เอกสารวิเคราะห์การประยุกต์ใช้หลักการ SOLID (SOLID Principles Analysis)
**โปรเจกต์:** MobiStock X (ระบบบริหารจัดการร้านค้าปลีกสินค้าอิเล็กทรอนิกส์/โทรศัพท์มือถือ)  
**วิชา:** CP353002 Principles of Software Design and Development (Spring Boot)  

---

## สรุปภาพรวมการปฏิบัติตามหลัก SOLID Principles

ในโปรเจกต์ MobiStock X มีการออกแบบโครงสร้างสถาปัตยกรรมซอฟต์แวร์โดยยึดหลักการของ SOLID ทั้ง 5 ประการอย่างเคร่งครัด เพื่อให้ระบบมีความยืดหยุ่น (Flexibility), ดูแลรักษาง่าย (Maintainability), และรองรับการขยายตัวในอนาคต (Extensibility)

---

## 1. S — Single Responsibility Principle (SRP)
> **หลักการ:** แต่ละ Class ควรมีหน้าที่ความรับผิดชอบเพียงอย่างเดียว ไม่รวม Business Logic, Request Validation, และ Data Persistence ไว้ในคลาสเดียวกัน

| ไฟล์ (File Path) | บรรทัด (Lines) | บทบาทหน้าที่ความรับผิดชอบ (Responsibility) และเหตุผล |
|---|:---:|---|
| `code/backend/src/main/java/com/example/mobistock/controller/api/CustomerController.java` | 26–79 | **Presentation Layer Only**: ทำหน้าที่รับ HTTP Request, จัดการ Status Code และส่ง HTTP Response เท่านั้น ไม่มีการเขียน Business Logic หรือเรียก Database โดยตรง |
| `code/backend/src/main/java/com/example/mobistock/service/impl/CustomerServiceImpl.java` | 20–93 | **Business Logic Layer Only**: ควบคุมตรรกะทางธุรกิจ เช่น ตรวจสอบเบอร์โทรซ้ำ จัดการ Transaction (`@Transactional`) โดยมอบหมายงาน Persistence ให้ Repository และการแปลงข้อมูลให้ Mapper |
| `code/backend/src/main/java/com/example/mobistock/repository/CustomerRepository.java` | 10–16 | **Data Access Layer Only**: จัดการการเข้าถึงข้อมูลและ Query จากฐานข้อมูล PostgreSQL เท่านั้น ไม่ยุ่งเกี่ยวกับ HTTP หรือตรรกะระบบ |
| `code/backend/src/main/java/com/example/mobistock/dto/request/CreateCustomerRequest.java` | 13–29 | **Input Validation Only**: รับและตรวจสอบความถูกต้องของข้อมูลนำเข้าจาก Client ด้วย Bean Validation Annotations (`@NotBlank`, `@Pattern`) |
| `code/backend/src/main/java/com/example/mobistock/mapper/CustomerMapper.java` | 12–25 | **Data Transformation Only**: รับผิดชอบแปลงข้อมูลระหว่าง Entity และ DTO เพื่อป้องกันไม่ให้ Entity รั่วไหลออกไปภายนอก |
| `code/backend/src/main/java/com/example/mobistock/exception/GlobalExceptionHandler.java` | 14–103 | **Centralized Error Handling Only**: รวมการดักจับข้อผิดพลาดทั้งหมดของระบบ แล้วแปลงเป็น `ErrorResponse` มาตรฐาน |

---

## 2. O — Open/Closed Principle (OCP)
> **หลักการ:** ซอฟต์แวร์ควร "เปิด" ต่อการต่อขยายฟังก์ชันใหม่ (Open for Extension) แต่ "ปิด" ต่อการแก้ไขโค้ดเดิมที่มีอยู่แล้ว (Closed for Modification) โดยใช้ Polymorphism / Strategy Pattern

| ไฟล์ (File Path) | บรรทัด (Lines) | การนำไปใช้และเหตุผลเชิงเทคนิค |
|---|:---:|---|
| `code/backend/src/main/java/com/example/mobistock/service/strategy/DiscountStrategy.java` | 9–11 | ประกาศ Interface กลยุทธ์การคำนวณส่วนลด เพื่อเปิดให้เพิ่มวิธีคำนวณแบบใหม่ ๆ ในอนาคต |
| `code/backend/src/main/java/com/example/mobistock/service/strategy/FixedAmountDiscountStrategy.java` | 11–21 | การคำนวณส่วนลดแบบยอดคงที่ (Fixed Amount) |
| `code/backend/src/main/java/com/example/mobistock/service/strategy/PercentageDiscountStrategy.java` | 12–23 | การคำนวณส่วนลดแบบเปอร์เซ็นต์ (Percentage) |
| `code/backend/src/main/java/com/example/mobistock/service/impl/SaleServiceImpl.java` | 145–147 | เรียกใช้ `discountStrategyResolver` ในการคำนวณส่วนลด หากต้องการเพิ่มโปรโมชันใหม่ เช่น สมาชิก VIP หรือ คูปองเทศกาล สามารถสร้าง Class Strategy ใหม่ได้ทันทีโดยไม่ต้องแก้ `if-else` ใน `SaleServiceImpl` |
| `code/backend/src/main/java/com/example/mobistock/security/SecurityConfig.java` | 31–55 | กำหนด Spring Security Filter Chain ซึ่งเปิดให้เพิ่ม Custom Security Filter เช่น `JwtAuthenticationFilter` เข้าไปในระบบได้โดยไม่ต้องแก้ไขโค้ดหลักของ Framework |

---

## 3. L — Liskov Substitution Principle (LSP)
> **หลักการ:** Subclass หรือ Implementation จะต้องสามารถถูกนำไปใช้งานแทนที่ Superclass / Interface ได้อย่างสมบูรณ์ โดยไม่ทำให้พฤติกรรมของระบบผิดเพี้ยน และไม่ throw `UnsupportedOperationException`

| ไฟล์ (File Path) | บรรทัด (Lines) | การนำไปใช้และเหตุผลเชิงเทคนิค |
|---|:---:|---|
| `code/backend/src/main/java/com/example/mobistock/common/BaseEntity.java` | 18–27 | คลาสแม่ (Abstract Superclass) กำหนดฟิลด์ `createdAt` และ `updatedAt` พร้อม Auditing Entity Listener |
| `code/backend/src/main/java/com/example/mobistock/domain/entity/Customer.java` | 23 | สืบทอดจาก `BaseEntity` โดยใช้งานฟังก์ชัน Auditing ได้อย่างถูกต้อง ไม่มีการ Override เพื่อยกเลิกหรือทำให้พฤติกรรมพัง |
| `code/backend/src/main/java/com/example/mobistock/domain/entity/SaleOrder.java` | 27 | สืบทอดจาก `BaseEntity` เช่นกัน รองรับการจัดการเวลาสร้างและแก้ไขข้อมูลอย่างสม่ำเสมอ |
| `code/backend/src/main/java/com/example/mobistock/security/AppUserDetailsService.java` | 18–35 | Implement `UserDetailsService` ของ Spring Security โดยเมธอด `loadUserByUsername` คืนค่า `UserDetails` ที่ถูกต้องสมบูรณ์ สามารถนำไปแทนที่ในระบบ Security Authentication Provider ของ Spring ได้โดยตรง |

---

## 4. I — Interface Segregation Principle (ISP)
> **หลักการ:** ผู้ใช้งานไม่ควรถูกบังคับให้ต้องพึ่งพา Interface ที่ตนเองไม่ได้ใช้งาน ควรแบ่งแยก Interface ให้มีขนาดเล็กและเฉพาะเจาะจง (No Fat Interface)

| ไฟล์ (File Path) | บรรทัด (Lines) | การนำไปใช้และเหตุผลเชิงเทคนิค |
|---|:---:|---|
| `code/backend/src/main/java/com/example/mobistock/service/CustomerService.java` | 12–22 | กำหนดสัญญาเฉพาะการจัดการลูกค้า (Create, Read, Update, Search) |
| `code/backend/src/main/java/com/example/mobistock/service/SaleService.java` | 10–18 | กำหนดสัญญาเฉพาะกระบวนการขายและการค้นหาประวัติการขาย |
| `code/backend/src/main/java/com/example/mobistock/service/ProductItemService.java` | 13–24 | กำหนดสัญญาเฉพาะการจัดการเครื่องรายชิ้น (Serial/IMEI Tracking) |
| `code/backend/src/main/java/com/example/mobistock/service/ProductModelService.java` | 13–24 | กำหนดสัญญาเฉพาะรุ่นสินค้า (Master Catalog) |
| **โครงสร้างโดยรวม** | - | แทนที่จะรวมทุกอย่างไว้ใน `StoreService` ตัวเดียวขนาดใหญ่ (Fat Interface) ระบบได้แยกเป็น 7 Service Interfaces ย่อย ทำให้ Controller แต่ละตัวพึ่งพาเฉพาะ Service ที่จำเป็นจริง ๆ |

---

## 5. D — Dependency Inversion Principle (DIP)
> **หลักการ:** High-level Module ต้องไม่ขึ้นกับ Low-level Module ทั้งสองต้องขึ้นกับ Abstraction (Interface) และ Abstraction ต้องไม่ขึ้นกับ Details โดยบังคับใช้ **Constructor Injection** เท่านั้น

| ไฟล์ (File Path) | บรรทัด (Lines) | การนำไปใช้และเหตุผลเชิงเทคนิค |
|---|:---:|---|
| `code/backend/src/main/java/com/example/mobistock/controller/api/CustomerController.java` | 28–31 | Controller พึ่งพา Interface `CustomerService` (Abstraction) ไม่ได้พึ่งพา Concrete Class `CustomerServiceImpl` โดยใช้ Constructor Injection ผ่าน `@RequiredArgsConstructor` และ `private final` |
| `code/backend/src/main/java/com/example/mobistock/controller/api/SaleOrderController.java` | 23–26 | Controller พึ่งพา Interface `SaleService` ผ่าน Constructor Injection |
| `code/backend/src/main/java/com/example/mobistock/service/impl/CustomerServiceImpl.java` | 19–24 | Service Implementation พึ่งพา Interface `CustomerRepository` ผ่าน Constructor Injection |
| `code/backend/src/main/java/com/example/mobistock/service/impl/SaleServiceImpl.java` | 43–52 | บังคับใช้ Constructor Injection สำหรับ Repositories, Mappers, Factories และ Strategy Resolvers ทั้งหมด ไม่มี Field Injection (`@Autowired`) ที่ละเมิด DIP |
