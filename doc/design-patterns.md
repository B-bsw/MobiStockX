# เอกสารการประยุกต์ใช้ Design Patterns
**โปรเจกต์:** MobiStock X (ระบบบริหารจัดการร้านค้าปลีกสินค้าอิเล็กทรอนิกส์/โทรศัพท์มือถือ)  
**วิชา:** CP353002 Principles of Software Design and Development (Spring Boot)  

---

## 1. Enterprise / Architectural Patterns (บังคับทุกกลุ่ม)

| Architectural Pattern | ปัญหาที่แก้ไข (Problem Solved) | ไฟล์ / คลาสที่ใช้งาน (Files / Classes) |
|---|---|---|
| **Layered Architecture** | ป้องกันความสับสนในการเชื่อมต่อโค้ด แยก Presentation, Business Logic, และ Persistence ออกจากกันอย่างเด็ดขาด | - `controller/api/*`<br>- `service/impl/*`<br>- `repository/*`<br>- `domain/entity/*` |
| **Model-View-Controller (MVC)** | แยกการจัดการ Request (Controller) ออกจาก Data Transfer Model และการแสดงผลบน Frontend | - `com.example.mobistock.controller.api.*`<br>- `com.example.mobistock.dto.*` |
| **Repository Pattern** | ซ่อนรายละเอียดการเข้าถึง Database (SQL/HQL) ไว้เบื้องหลัง Interface ทำให้ง่ายต่อการ Mock ใน Unit Test | - `CustomerRepository`<br>- `SaleOrderRepository`<br>- `ProductItemRepository`<br>- `AppUserRepository` |
| **Service Layer Pattern** | เป็นจุดรวม Business Logic, Validation ข้าม Domain, และจัดการขอบเขต Transaction (`@Transactional`) ในที่เดียว | - `CustomerServiceImpl`<br>- `SaleServiceImpl`<br>- `AuthServiceImpl` |
| **DTO Pattern & Data Mapper** | ป้องกัน Over-fetching / Under-fetching, ป้องกัน Entity Leak สู่ภายนอก และลด Coupling ระหว่าง Database Schema กับ API Contract | - `dto/request/*`<br>- `dto/response/*`<br>- `mapper/*` (เช่น `CustomerMapper`, `SaleMapper`) |
| **Dependency Injection (DI)** | ลดความผูกมัด (Decoupling) และสนับสนุนการทดสอบด้วย Constructor Injection | บังคับใช้ `@RequiredArgsConstructor` กับ `private final` ทุก Service และ Controller |

---

## 2. GoF Design Patterns (Gang of Four Patterns)

ระบบได้เลือกประยุกต์ใช้ **Creational Patterns** เป็นกลุ่มหลัก (3 รูปแบบ) พร้อมเสริมด้วย **Behavioral Patterns** ในส่วนการคำนวณราคา:

| หมวดหมู่ | GoF Pattern | ปัญหาที่แก้ไข (Problem Solved) | ไฟล์ / คลาสที่ใช้งาน (Files / Classes) |
|---|---|---|---|
| **Creational** | **Singleton Pattern** | จำกัดให้มี Instance เพียงหนึ่งเดียวตลอดอายุการทำงานของแอปพลิเคชัน เพื่อประหยัด Memory และควบคุมสถานะของระบบ | - Spring Managed Beans (`@Service`, `@Component`, `@Configuration`)<br>- `CorsConfig`, `SecurityConfig`, `OpenApiConfig` |
| **Creational** | **Builder Pattern** | แก้ไขปัญหา Telescoping Constructor เมื่อ Entity หรือ Response DTO มีฟิลด์จำนวนมาก (เช่น `SaleOrder`, `TaxInvoice`, `ProductItem`) ช่วยให้สร้าง Object ได้ชัดเจนและ Immutability | - Lombok `@Builder`<br>- `TaxInvoice.builder()`<br>- `SaleOrder.builder()`<br>- `ErrorResponse.builder()` |
| **Creational** | **Factory Method Pattern** | ซ่อนตรรกะการสร้าง Object ที่มีความซับซ้อน เช่น การคำนวณฐานภาษีมูลค่าเพิ่ม (VAT 7%) และการกำหนดระยะเวลารับประกันสินค้า | - `TaxInvoiceFactory`<br>- `ProductWarrantyFactory` |
| **Behavioral** | **Strategy Pattern** | รองรับการคำนวณส่วนลดได้หลากหลายรูปแบบ (Fixed Amount, Percentage) โดยไม่ใช้ `if-else` ซ้อนกัน และเปิดให้เพิ่มโปรโมชันใหม่ได้ง่าย (Open/Closed Principle) | - `DiscountStrategy` (Interface)<br>- `FixedAmountDiscountStrategy`<br>- `PercentageDiscountStrategy`<br>- `DiscountStrategyResolver` |

---

## 3. รายละเอียดและ Class Diagram ประกอบแต่ละ Pattern

### 3.1 Factory Method Pattern (TaxInvoice & ProductWarranty Creation)
**ปัญหาที่แก้:** ในการเปิดบิลขาย การออกใบกำกับภาษีต้องมีสูตรคำนวณภาษีแยกนอกและถอดภาษี 7% (Subtotal, VAT Rate, VAT Amount, Grand Total) หากเขียนปนอยู่ใน `SaleServiceImpl` จะทำให้คลาสบวมและละเมิด Single Responsibility จึงแยกตรรกะการสร้างออกเป็น Factory

```mermaid
classDiagram
    class SaleServiceImpl {
        -TaxInvoiceFactory taxInvoiceFactory
        -ProductWarrantyFactory productWarrantyFactory
        +createSaleOrder(request) SaleOrderResponse
    }
    class TaxInvoiceFactory {
        +createTaxInvoice(invoiceNumber, request, grandTotal) TaxInvoice
    }
    class ProductWarrantyFactory {
        +createWarranty(warrantyCode, imei, model) ProductWarranty
    }
    class TaxInvoice {
        -String invoiceNumber
        -BigDecimal subtotalAmount
        -BigDecimal vatAmount
        -BigDecimal grandTotal
    }
    class ProductWarranty {
        -String warrantyCode
        -LocalDate startDate
        -LocalDate expireDate
    }

    SaleServiceImpl ..> TaxInvoiceFactory : uses
    SaleServiceImpl ..> ProductWarrantyFactory : uses
    TaxInvoiceFactory ..> TaxInvoice : creates
    ProductWarrantyFactory ..> ProductWarranty : creates
```

---

### 3.2 Strategy Pattern (Discount Calculation)
**ปัญหาที่แก้:** ร้านค้ามีรูปแบบการให้ส่วนลดหลายวิธี (ส่วนลดตามจำนวนเงินคงที่, ส่วนลดเป็นเปอร์เซ็นต์ หรือในอนาคตอาจมีส่วนลดแต้มสะสม) การใช้ Strategy Pattern ช่วยให้สลับเปลี่ยนอัลกอริทึมได้ขณะ Runtime และเพิ่มคลาสใหม่ได้โดยไม่ต้องแก้ไขโค้ดเดิม

```mermaid
classDiagram
    class DiscountStrategy {
        <<interface>>
        +calculateDiscount(BigDecimal subtotal, BigDecimal discountValue) BigDecimal
    }
    class FixedAmountDiscountStrategy {
        +calculateDiscount(BigDecimal subtotal, BigDecimal discountValue) BigDecimal
    }
    class PercentageDiscountStrategy {
        +calculateDiscount(BigDecimal subtotal, BigDecimal discountValue) BigDecimal
    }
    class DiscountStrategyResolver {
        -Map~String, DiscountStrategy~ strategies
        +getStrategy(String strategyName) DiscountStrategy
    }
    class SaleServiceImpl {
        -DiscountStrategyResolver discountStrategyResolver
        +createSaleOrder(request) SaleOrderResponse
    }

    DiscountStrategy <|.. FixedAmountDiscountStrategy : implements
    DiscountStrategy <|.. PercentageDiscountStrategy : implements
    DiscountStrategyResolver o--> DiscountStrategy : aggregates
    SaleServiceImpl ..> DiscountStrategyResolver : uses
```

---

### 3.3 Builder Pattern (Data Encapsulation)
**ปัญหาที่แก้:** คลาสอย่าง `SaleOrder`, `TaxInvoice`, และ `ErrorResponse` มีข้อมูลหลายสิบฟิลด์ การสร้าง Object ผ่าน Parameterized Constructor ทำให้จำตำแหน่งพารามิเตอร์ผิดพลาดได้ง่าย Builder Pattern ช่วยให้อ่านโค้ดเข้าใจง่ายและป้องกันการสร้าง Object ในสถานะที่ไม่สมบูรณ์

```mermaid
classDiagram
    class ErrorResponse {
        -Integer status
        -String error
        -String message
        -LocalDateTime timestamp
        -Map validationErrors
        +builder() ErrorResponseBuilder$
    }
    class ErrorResponseBuilder {
        +status(Integer status) ErrorResponseBuilder
        +error(String error) ErrorResponseBuilder
        +message(String message) ErrorResponseBuilder
        +timestamp(LocalDateTime time) ErrorResponseBuilder
        +build() ErrorResponse
    }
    ErrorResponseBuilder ..> ErrorResponse : builds
```
