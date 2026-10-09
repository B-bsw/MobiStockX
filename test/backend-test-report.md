# Backend Test Report

ผลรันจริง: **168 เคส ผ่าน 157 ไม่ผ่าน 11 errors 0 และ skipped 0** จาก 15 คลาส

**ผลรวม: FAIL — ยังไม่ผ่านทั้งหมด** คงเคสที่พบข้อผิดพลาดไว้โดยไม่แก้ production code ตามข้อกำหนดของงาน

## สภาพแวดล้อมและคำสั่ง

- ช่วงรัน JUnit: 2026-10-09T10:01:49.863+07:00 ถึง 2026-10-09T10:01:59.261+07:00 (Asia/Bangkok, UTC+07:00)
- เครื่อง: macOS / Darwin arm64; OpenJDK Homebrew 21.0.12.1; Gradle wrapper 9.7.1; Spring Boot 4.1.1
- JUnit Platform, Mockito, MockMvc และ H2 in-memory; ไม่ใช้ PostgreSQL หรือฐานข้อมูลจริง
- Gradle จบด้วย exit code 1: BUILD FAILED in 11s เนื่องจาก assertion failures; compilation สำเร็จและทุกเคสรันครบ
- Git HEAD ตอนจัดทำรายงาน: 75b754020c9ced7de1d6ffc98adacde351cd1d5a; รายงานรวม test files ใหม่ที่ยังไม่ได้ commit
- ก่อนเพิ่มเทสต์ ชุดเดิมรันผ่าน 53/53; หลังเพิ่มยังผ่านทั้ง 53 เคสเดิม ชุดเพิ่ม 115 เคสผ่าน 104 ไม่ผ่าน 11

รันจาก code/backend:

~~~bash
JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home ./gradlew test --rerun-tasks
~~~

เครื่องอื่นใช้ JDK 21 ที่ติดตั้งและกำหนด JAVA_HOME ให้ตรงเครื่อง ไม่ต้องใช้ path ของ Homebrew นี้

หลักฐาน: [Gradle HTML report](../code/backend/build/reports/tests/test/index.html), XML ที่ code/backend/build/test-results/test/TEST-*.xml และ [Test Cases](backend-test-cases.md)
ไฟล์ใน build เป็น artifacts ที่ถูก gitignore; รายงาน Markdown นี้เก็บผลและข้อความผิดพลาดไว้เพื่ออ่านย้อนหลังได้

## ผล HTTP Method และ Status Code

ใช้เกณฑ์ใน [Test Cases](backend-test-cases.md) ซึ่งอ้างอิง [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html#section-15); 409 สำหรับ duplicate conflict เป็นเกณฑ์ API ที่ต้องการในงานนี้ แม้ implementation ปัจจุบันเลือกตอบ 400

| Expected / สถานการณ์ | Actual | ผล |
| --- | --- | --- |
| 200: GET / PUT / PATCH สำเร็จ | 200 | PASS |
| 201: POST สร้างข้อมูลครบถ้วน | 201 | PASS |
| 201: POST model ไม่ระบุ isSerialized / item ไม่ระบุ condition | 500 / 500 | FAIL 2 เคส |
| 204: DELETE สำเร็จและไม่มี body | 204 และ body ว่าง | PASS |
| 400: validation ไม่ผ่าน | 400 | PASS |
| 400: JSON เสียรูปแบบ | 500 | FAIL |
| 404: resource ไม่มี | 404 | PASS |
| 409: ชื่อแบรนด์/หมวดหมู่ โทรศัพท์ IMEI และ Serial ซ้ำ | 400 ทั้ง 5 เคส | FAIL |
| 409: จำลอง unique constraint violation ใน service | 500 | FAIL |
| 500: จำลอง unexpected internal exception | 500 พร้อม error body | PASS |
| 405: Method ที่ route ไม่รองรับ (เพิ่มเติม) | 500 | FAIL |

## ปัญหาที่พบและวิธีทำซ้ำ

### 1. itemId เดียวขาย quantity มากกว่าหนึ่งได้

- ใน SalePersistenceIntegrationTest.serializedItemCannotRepresentMultipleUnits ส่ง POST /api/v1/sales พร้อม JWT, itemId ของเครื่องแรก, quantity=2, unitPrice=1070 และ payment=2140 ขณะที่รุ่นมี stock=2 และเครื่อง AVAILABLE สองเครื่อง
- คาด 400 และไม่มีการเปลี่ยนข้อมูล; ได้ 201 สร้างบิลหนึ่งใบ สต็อกลดจาก 2 เหลือ 0 เครื่องแรก SOLD แต่เครื่องที่สองยัง AVAILABLE ยืนยันทั้ง response และฐานข้อมูลหลัง commit
- เก็บเป็น FAIL และล้างเฉพาะข้อมูล H2 หลังเคส ไม่มีการแก้ service

### 2. Duplicate conflict ตอบ 400 แทนเกณฑ์ 409

- POST สร้างข้อมูลหนึ่งครั้ง จากนั้น POST ซ้ำชื่อแบรนด์/หมวดหมู่ (ต่างตัวพิมพ์), โทรศัพท์ลูกค้า, IMEI หรือ Serial
- ทั้งห้าเคสสร้างครั้งแรกได้ 201 และครั้งซ้ำได้ 400; คาด 409 ตามเกณฑ์ conflict ของงานนี้
- โค้ด service ใช้ BadRequestException และ GlobalExceptionHandler แปลงเป็น 400; เป็นความต่างจากเกณฑ์ที่เพิ่ม ไม่ใช่การพังของเทสต์เดิม

### 3. JSON เสียรูปแบบและ Method ไม่รองรับถูกแปลงเป็น 500

- POST /api/v1/brands ด้วย Content-Type application/json และ body เครื่องหมายปีกกาเปิดอย่างเดียว: คาด 400 แต่ได้ 500
- PATCH /api/v1/brands/1: route ไม่รองรับ PATCH คาด 405 แต่ได้ 500
- ทั้งสองเคสใช้ real GlobalExceptionHandler ใน MVC slice; generic exception handler ส่ง 500 สำหรับข้อผิดพลาดฝั่ง request เหล่านี้

### 4. Unique constraint exception ถูกแปลงเป็น 500

- ใน HttpStatusContractTest ให้ BrandService.createBrand โยน DataIntegrityViolationException("duplicate brand name") แล้ว POST brand ที่ผ่าน validation
- คาด 409 แต่ได้ 500 จาก handler จริง; เคสนี้เป็น fault injection ไม่ใช่การสร้าง constraint race ในฐานข้อมูลจริง

### 5. ค่า default ใน request สร้างสินค้าไม่ถูกใช้ผ่าน HTTP

- POST /api/v1/products/models ด้วย modelName, standardPrice, brandId, categoryId ที่ถูกต้อง โดยไม่ส่ง isSerialized: คาด 201 และ isSerialized=true แต่ได้ 500 พร้อม NULL not allowed for IS_SERIALIZED
- POST /api/v1/products/items ด้วย modelId ที่มีอยู่, serialNumber, costPrice และ sellingPrice โดยไม่ส่ง condition: คาด 201 และ condition=NEW แต่ได้ 500 พร้อม NULL not allowed for ITEM_CONDITION
- Request DTO มี default ของสองฟิลด์นี้; การสร้างผ่าน service ด้วย builder ในเทสต์ผ่าน แต่เส้นทาง HTTP ไม่ใช้ default ตามที่คาด
- เคส duplicate identifier ส่ง isSerialized/condition อย่างชัดเจนเพื่อแยกการทดสอบ conflict ออกจากปัญหาค่า default; มีเทสต์แยกเก็บปัญหา default ไว้

## สรุปรายคลาส

| Test class | ทั้งหมด | PASS | FAIL | ERROR | SKIP |
| --- | ---: | ---: | ---: | ---: | ---: |
| [MobistockBackendApplicationTests](../code/backend/src/test/java/com/example/mobistock/MobistockBackendApplicationTests.java) | 1 | 1 | 0 | 0 | 0 |
| [CorsConfigTest](../code/backend/src/test/java/com/example/mobistock/config/CorsConfigTest.java) | 2 | 2 | 0 | 0 | 0 |
| [BrandControllerTest](../code/backend/src/test/java/com/example/mobistock/controller/BrandControllerTest.java) | 7 | 7 | 0 | 0 | 0 |
| [CategoryControllerTest](../code/backend/src/test/java/com/example/mobistock/controller/CategoryControllerTest.java) | 7 | 7 | 0 | 0 | 0 |
| [CustomerControllerTest](../code/backend/src/test/java/com/example/mobistock/controller/CustomerControllerTest.java) | 8 | 8 | 0 | 0 | 0 |
| [HttpStatusContractTest](../code/backend/src/test/java/com/example/mobistock/controller/HttpStatusContractTest.java) | 10 | 7 | 3 | 0 | 0 |
| [ProductItemControllerTest](../code/backend/src/test/java/com/example/mobistock/controller/ProductItemControllerTest.java) | 9 | 9 | 0 | 0 | 0 |
| [ProductModelControllerTest](../code/backend/src/test/java/com/example/mobistock/controller/ProductModelControllerTest.java) | 9 | 9 | 0 | 0 | 0 |
| [SaleOrderControllerTest](../code/backend/src/test/java/com/example/mobistock/controller/SaleOrderControllerTest.java) | 6 | 6 | 0 | 0 | 0 |
| [AuthSecurityIntegrationTest](../code/backend/src/test/java/com/example/mobistock/integration/AuthSecurityIntegrationTest.java) | 30 | 23 | 7 | 0 | 0 |
| [SalePersistenceIntegrationTest](../code/backend/src/test/java/com/example/mobistock/integration/SalePersistenceIntegrationTest.java) | 22 | 21 | 1 | 0 | 0 |
| [StockCustomerIntegrationTest](../code/backend/src/test/java/com/example/mobistock/integration/StockCustomerIntegrationTest.java) | 21 | 21 | 0 | 0 | 0 |
| [JwtServiceTest](../code/backend/src/test/java/com/example/mobistock/security/JwtServiceTest.java) | 9 | 9 | 0 | 0 | 0 |
| [PricingAndDocumentTest](../code/backend/src/test/java/com/example/mobistock/service/PricingAndDocumentTest.java) | 23 | 23 | 0 | 0 | 0 |
| [SaleServiceImplTest](../code/backend/src/test/java/com/example/mobistock/service/SaleServiceImplTest.java) | 4 | 4 | 0 | 0 | 0 |

## รายละเอียดเคสที่ไม่ผ่าน

ID อ้างอิงตรงกับ Test Cases; ข้อความต่อไปนี้อ่านจาก Gradle XML โดยตรง

### BE-030: HTTP Method ที่ route ไม่รองรับต้องตอบ 405 ไม่ใช่ 500 และไม่เรียก service

- Class: com.example.mobistock.controller.HttpStatusContractTest
- Expected: HTTP Method ที่ route ไม่รองรับต้องตอบ 405 ไม่ใช่ 500 และไม่เรียก service
- Actual assertion failure:

~~~text
java.lang.AssertionError: Status expected:<405> but was:<500>
~~~

### BE-031: HTTP POST JSON เสียรูปแบบต้องตอบ 400 ไม่ใช่ 500

- Class: com.example.mobistock.controller.HttpStatusContractTest
- Expected: HTTP POST JSON เสียรูปแบบต้องตอบ 400 ไม่ใช่ 500
- Actual assertion failure:

~~~text
java.lang.AssertionError: Status expected:<400> but was:<500>
~~~

### BE-032: HTTP POST ขัดแย้ง unique constraint ต้องตอบ 409 ไม่ใช่ 500

- Class: com.example.mobistock.controller.HttpStatusContractTest
- Expected: HTTP POST ขัดแย้ง unique constraint ต้องตอบ 409 ไม่ใช่ 500
- Actual assertion failure:

~~~text
java.lang.AssertionError: Status expected:<409> but was:<500>
~~~

### BE-064: HTTP POST รุ่นสินค้าที่ไม่ระบุ isSerialized ต้องใช้ default และตอบ 201

- Class: com.example.mobistock.integration.AuthSecurityIntegrationTest
- Expected: HTTP POST รุ่นสินค้าที่ไม่ระบุ isSerialized ต้องใช้ default และตอบ 201
- Actual assertion failure:

~~~text
java.lang.AssertionError: Status expected:<201> but was:<500>
~~~

### BE-065: HTTP POST สินค้ารายชิ้นที่ไม่ระบุ condition ต้องใช้ NEW และตอบ 201

- Class: com.example.mobistock.integration.AuthSecurityIntegrationTest
- Expected: HTTP POST สินค้ารายชิ้นที่ไม่ระบุ condition ต้องใช้ NEW และตอบ 201
- Actual assertion failure:

~~~text
java.lang.AssertionError: Status expected:<201> but was:<500>
~~~

### BE-069: duplicate resource conflict: "brand"

- Class: com.example.mobistock.integration.AuthSecurityIntegrationTest
- Expected: สร้างครั้งแรก 201; ส่งข้อมูลชนกับข้อมูลเดิมอีกครั้งต้อง 409
- Actual assertion failure:

~~~text
java.lang.AssertionError: Status expected:<409> but was:<400>
~~~

### BE-070: duplicate resource conflict: "category"

- Class: com.example.mobistock.integration.AuthSecurityIntegrationTest
- Expected: สร้างครั้งแรก 201; ส่งข้อมูลชนกับข้อมูลเดิมอีกครั้งต้อง 409
- Actual assertion failure:

~~~text
java.lang.AssertionError: Status expected:<409> but was:<400>
~~~

### BE-071: duplicate resource conflict: "customerPhone"

- Class: com.example.mobistock.integration.AuthSecurityIntegrationTest
- Expected: สร้างครั้งแรก 201; ส่งข้อมูลชนกับข้อมูลเดิมอีกครั้งต้อง 409
- Actual assertion failure:

~~~text
java.lang.AssertionError: Status expected:<409> but was:<400>
~~~

### BE-072: duplicate resource conflict: "itemImei"

- Class: com.example.mobistock.integration.AuthSecurityIntegrationTest
- Expected: สร้างครั้งแรก 201; ส่งข้อมูลชนกับข้อมูลเดิมอีกครั้งต้อง 409
- Actual assertion failure:

~~~text
java.lang.AssertionError: Status expected:<409> but was:<400>
~~~

### BE-073: duplicate resource conflict: "itemSerial"

- Class: com.example.mobistock.integration.AuthSecurityIntegrationTest
- Expected: สร้างครั้งแรก 201; ส่งข้อมูลชนกับข้อมูลเดิมอีกครั้งต้อง 409
- Actual assertion failure:

~~~text
java.lang.AssertionError: Status expected:<409> but was:<400>
~~~

### BE-111: เครื่องเดียวที่ระบุ itemId ต้องไม่ขายด้วย quantity มากกว่าหนึ่ง

- Class: com.example.mobistock.integration.SalePersistenceIntegrationTest
- Expected: เครื่องเดียวที่ระบุ itemId ต้องไม่ขายด้วย quantity มากกว่าหนึ่ง
- Actual assertion failure:

~~~text
org.opentest4j.MultipleFailuresError: Multiple Failures (4 failures)
	org.opentest4j.AssertionFailedError: เครื่องเดียว quantity=2 ต้องถูกปฏิเสธ ==> expected: <400> but was: <201>
	org.opentest4j.AssertionFailedError: ต้องไม่สร้างบิล ==> expected: <0> but was: <1>
	org.opentest4j.AssertionFailedError: สต็อกต้องไม่เปลี่ยน ==> expected: <2> but was: <0>
	org.opentest4j.AssertionFailedError: เครื่องต้องยังพร้อมขาย ==> expected: <AVAILABLE> but was: <SOLD>
~~~

## ผลราย Test Case

PASS หมายถึง assertion ที่กำหนดใน source ผ่านทั้งหมด ไม่ได้หมายถึงตรวจทุก branch หรือรับรองทั้งระบบ; expected และ input ดูใน Test Cases ตาม ID เดียวกัน

| ID | Test class / Case | Actual | เวลา (วินาที) |
| --- | --- | --- | ---: |
| BE-001 | MobistockBackendApplicationTests: contextLoads() | **PASS** — assertions ผ่าน | 0.001 |
| BE-002 | CorsConfigTest: allowsConfiguredOrigins() | **PASS** — assertions ผ่าน | 0.003 |
| BE-003 | CorsConfigTest: rejectsUnconfiguredOrigin() | **PASS** — assertions ผ่าน | 0.001 |
| BE-004 | BrandControllerTest: DELETE /api/v1/brands/{id} - Should return 204 No Content | **PASS** — assertions ผ่าน | 0.001 |
| BE-005 | BrandControllerTest: GET /api/v1/brands - Should return 200 with list of brands | **PASS** — assertions ผ่าน | 0.004 |
| BE-006 | BrandControllerTest: GET /api/v1/brands/{id} - Should return 200 when brand exists | **PASS** — assertions ผ่าน | 0.001 |
| BE-007 | BrandControllerTest: GET /api/v1/brands/{id} - Should return 404 when brand does not exist | **PASS** — assertions ผ่าน | 0.003 |
| BE-008 | BrandControllerTest: POST /api/v1/brands - Should return 201 when request is valid | **PASS** — assertions ผ่าน | 0.002 |
| BE-009 | BrandControllerTest: POST /api/v1/brands - Should return 400 when brandName is blank | **PASS** — assertions ผ่าน | 0.002 |
| BE-010 | BrandControllerTest: PUT /api/v1/brands/{id} - Should return 200 when update is successful | **PASS** — assertions ผ่าน | 0.006 |
| BE-011 | CategoryControllerTest: DELETE /api/v1/categories/{id} - Should return 204 No Content | **PASS** — assertions ผ่าน | 0.001 |
| BE-012 | CategoryControllerTest: GET /api/v1/categories - Should return 200 with list of categories | **PASS** — assertions ผ่าน | 0.002 |
| BE-013 | CategoryControllerTest: GET /api/v1/categories/{id} - Should return 200 when category exists | **PASS** — assertions ผ่าน | 0.004 |
| BE-014 | CategoryControllerTest: GET /api/v1/categories/{id} - Should return 404 when category not found | **PASS** — assertions ผ่าน | 0.001 |
| BE-015 | CategoryControllerTest: POST /api/v1/categories - Should return 201 when category created successfully | **PASS** — assertions ผ่าน | 0.002 |
| BE-016 | CategoryControllerTest: POST /api/v1/categories - Should return 400 when categoryNameTh is blank | **PASS** — assertions ผ่าน | 0.003 |
| BE-017 | CategoryControllerTest: PUT /api/v1/categories/{id} - Should return 200 when update succeeds | **PASS** — assertions ผ่าน | 0.003 |
| BE-018 | CustomerControllerTest: DELETE /api/v1/customers/{id} - Should return 204 No Content | **PASS** — assertions ผ่าน | 0.002 |
| BE-019 | CustomerControllerTest: GET /api/v1/customers - Should return 200 with paginated customers | **PASS** — assertions ผ่าน | 0.004 |
| BE-020 | CustomerControllerTest: GET /api/v1/customers/phone/{phone} - Should return 200 when customer found by phone | **PASS** — assertions ผ่าน | 0.002 |
| BE-021 | CustomerControllerTest: GET /api/v1/customers/{id} - Should return 200 when customer exists | **PASS** — assertions ผ่าน | 0.001 |
| BE-022 | CustomerControllerTest: GET /api/v1/customers/{id} - Should return 404 when customer not found | **PASS** — assertions ผ่าน | 0.003 |
| BE-023 | CustomerControllerTest: POST /api/v1/customers - Should return 201 when customer registered successfully | **PASS** — assertions ผ่าน | 0.002 |
| BE-024 | CustomerControllerTest: POST /api/v1/customers - Should return 400 when required fields are missing | **PASS** — assertions ผ่าน | 0.002 |
| BE-025 | CustomerControllerTest: PUT /api/v1/customers/{id} - Should return 200 when updated successfully | **PASS** — assertions ผ่าน | 0.004 |
| BE-026 | HttpStatusContractTest: HTTP DELETE สำเร็จต้องตอบ 204 และไม่มี response body | **PASS** — assertions ผ่าน | 0.003 |
| BE-027 | HttpStatusContractTest: HTTP GET resource ไม่มีต้องตอบ 404 | **PASS** — assertions ผ่าน | 0.003 |
| BE-028 | HttpStatusContractTest: HTTP GET อ่านข้อมูลสำเร็จต้องตอบ 200 | **PASS** — assertions ผ่าน | 0.003 |
| BE-029 | HttpStatusContractTest: HTTP GET เมื่อเกิด unexpected internal exception ต้องตอบ 500 พร้อม error body | **PASS** — assertions ผ่าน | 0.086 |
| BE-030 | HttpStatusContractTest: HTTP Method ที่ route ไม่รองรับต้องตอบ 405 ไม่ใช่ 500 และไม่เรียก service | **FAIL** — java.lang.AssertionError: Status expected:<405> but was:<500> | 0.008 |
| BE-031 | HttpStatusContractTest: HTTP POST JSON เสียรูปแบบต้องตอบ 400 ไม่ใช่ 500 | **FAIL** — java.lang.AssertionError: Status expected:<400> but was:<500> | 0.019 |
| BE-032 | HttpStatusContractTest: HTTP POST ขัดแย้ง unique constraint ต้องตอบ 409 ไม่ใช่ 500 | **FAIL** — java.lang.AssertionError: Status expected:<409> but was:<500> | 0.004 |
| BE-033 | HttpStatusContractTest: HTTP POST ข้อมูลไม่ผ่าน validation ต้องตอบ 400 และไม่เรียก service | **PASS** — assertions ผ่าน | 0.007 |
| BE-034 | HttpStatusContractTest: HTTP POST สร้างข้อมูลสำเร็จต้องตอบ 201 | **PASS** — assertions ผ่าน | 0.031 |
| BE-035 | HttpStatusContractTest: HTTP PUT แก้ไขข้อมูลสำเร็จพร้อม response body ต้องตอบ 200 | **PASS** — assertions ผ่าน | 0.005 |
| BE-036 | ProductItemControllerTest: DELETE /api/v1/products/items/{id} - Should return 204 No Content | **PASS** — assertions ผ่าน | 0.002 |
| BE-037 | ProductItemControllerTest: GET /api/v1/products/items - Should return 200 with paginated items | **PASS** — assertions ผ่าน | 0.004 |
| BE-038 | ProductItemControllerTest: GET /api/v1/products/items/imei/{imei} - Should return 200 when IMEI exists | **PASS** — assertions ผ่าน | 0.001 |
| BE-039 | ProductItemControllerTest: GET /api/v1/products/items/serial/{serialNumber} - Should return 200 when serial number exists | **PASS** — assertions ผ่าน | 0.003 |
| BE-040 | ProductItemControllerTest: GET /api/v1/products/items/{id} - Should return 200 when item exists | **PASS** — assertions ผ่าน | 0.002 |
| BE-041 | ProductItemControllerTest: GET /api/v1/products/items/{id} - Should return 404 when item not found | **PASS** — assertions ผ่าน | 0.001 |
| BE-042 | ProductItemControllerTest: PATCH /api/v1/products/items/{id}/status - Should return 200 when status updated | **PASS** — assertions ผ่าน | 0.003 |
| BE-043 | ProductItemControllerTest: POST /api/v1/products/items - Should return 201 when product item created successfully | **PASS** — assertions ผ่าน | 0.005 |
| BE-044 | ProductItemControllerTest: POST /api/v1/products/items - Should return 400 when modelId or prices are invalid | **PASS** — assertions ผ่าน | 0.004 |
| BE-045 | ProductModelControllerTest: DELETE /api/v1/products/models/{id} - Should return 204 No Content | **PASS** — assertions ผ่าน | 0.001 |
| BE-046 | ProductModelControllerTest: GET /api/v1/products/models - Should return 200 with paginated product models | **PASS** — assertions ผ่าน | 0.002 |
| BE-047 | ProductModelControllerTest: GET /api/v1/products/models/brand/{brandId} - Should return 200 with models by brand | **PASS** — assertions ผ่าน | 0.002 |
| BE-048 | ProductModelControllerTest: GET /api/v1/products/models/category/{categoryId} - Should return 200 with models by category | **PASS** — assertions ผ่าน | 0.003 |
| BE-049 | ProductModelControllerTest: GET /api/v1/products/models/{id} - Should return 200 when product model exists | **PASS** — assertions ผ่าน | 0.005 |
| BE-050 | ProductModelControllerTest: GET /api/v1/products/models/{id} - Should return 404 when product model not found | **PASS** — assertions ผ่าน | 0.001 |
| BE-051 | ProductModelControllerTest: POST /api/v1/products/models - Should return 201 when product model created successfully | **PASS** — assertions ผ่าน | 0.004 |
| BE-052 | ProductModelControllerTest: POST /api/v1/products/models - Should return 400 when validation fails | **PASS** — assertions ผ่าน | 0.006 |
| BE-053 | ProductModelControllerTest: PUT /api/v1/products/models/{id} - Should return 200 when update succeeds | **PASS** — assertions ผ่าน | 0.005 |
| BE-054 | SaleOrderControllerTest: GET /api/v1/sales - Should return 200 with paginated orders | **PASS** — assertions ผ่าน | 0.004 |
| BE-055 | SaleOrderControllerTest: GET /api/v1/sales/code/{saleCode} - Should return 200 when order found by code | **PASS** — assertions ผ่าน | 0.001 |
| BE-056 | SaleOrderControllerTest: GET /api/v1/sales/{id} - Should return 200 when order exists | **PASS** — assertions ผ่าน | 0.001 |
| BE-057 | SaleOrderControllerTest: GET /api/v1/sales/{id} - Should return 404 when order does not exist | **PASS** — assertions ผ่าน | 0.003 |
| BE-058 | SaleOrderControllerTest: POST /api/v1/sales - Should return 201 when checkout succeeds | **PASS** — assertions ผ่าน | 0.013 |
| BE-059 | SaleOrderControllerTest: POST /api/v1/sales - Should return 400 when required fields are missing | **PASS** — assertions ผ่าน | 0.007 |
| BE-060 | AuthSecurityIntegrationTest: Authorization header: "Basic dXNlcjpwYXNz" | **PASS** — assertions ผ่าน | 0.071 |
| BE-061 | AuthSecurityIntegrationTest: Authorization header: "Bearer " | **PASS** — assertions ผ่าน | 0.071 |
| BE-062 | AuthSecurityIntegrationTest: Authorization header: "Bearer invalid" | **PASS** — assertions ผ่าน | 0.074 |
| BE-063 | AuthSecurityIntegrationTest: Authorization header: "bearer invalid" | **PASS** — assertions ผ่าน | 0.07 |
| BE-064 | AuthSecurityIntegrationTest: HTTP POST รุ่นสินค้าที่ไม่ระบุ isSerialized ต้องใช้ default และตอบ 201 | **FAIL** — java.lang.AssertionError: Status expected:<201> but was:<500> | 0.084 |
| BE-065 | AuthSecurityIntegrationTest: HTTP POST สินค้ารายชิ้นที่ไม่ระบุ condition ต้องใช้ NEW และตอบ 201 | **FAIL** — java.lang.AssertionError: Status expected:<201> but was:<500> | 0.084 |
| BE-066 | AuthSecurityIntegrationTest: JWT ที่ถูกต้องใช้สร้างและอ่านแบรนด์ผ่าน API และฐานข้อมูลจริงได้ | **PASS** — assertions ผ่าน | 0.129 |
| BE-067 | AuthSecurityIntegrationTest: bad credentials: "{\"username\":\"coverage-user\",\"password\":\"wrong\"}" | **PASS** — assertions ผ่าน | 0.14 |
| BE-068 | AuthSecurityIntegrationTest: bad credentials: "{\"username\":\"missing\",\"password\":\"Test-password-42\"}" | **PASS** — assertions ผ่าน | 0.078 |
| BE-069 | AuthSecurityIntegrationTest: duplicate resource conflict: "brand" | **FAIL** — java.lang.AssertionError: Status expected:<409> but was:<400> | 0.08 |
| BE-070 | AuthSecurityIntegrationTest: duplicate resource conflict: "category" | **FAIL** — java.lang.AssertionError: Status expected:<409> but was:<400> | 0.084 |
| BE-071 | AuthSecurityIntegrationTest: duplicate resource conflict: "customerPhone" | **FAIL** — java.lang.AssertionError: Status expected:<409> but was:<400> | 0.084 |
| BE-072 | AuthSecurityIntegrationTest: duplicate resource conflict: "itemImei" | **FAIL** — java.lang.AssertionError: Status expected:<409> but was:<400> | 0.107 |
| BE-073 | AuthSecurityIntegrationTest: duplicate resource conflict: "itemSerial" | **FAIL** — java.lang.AssertionError: Status expected:<409> but was:<400> | 0.088 |
| BE-074 | AuthSecurityIntegrationTest: invalid login fields: "{\"username\":\" \",\"password\":\" \"}" | **PASS** — assertions ผ่าน | 0.072 |
| BE-075 | AuthSecurityIntegrationTest: invalid login fields: "{\"username\":\"coverage-user\"}" | **PASS** — assertions ผ่าน | 0.072 |
| BE-076 | AuthSecurityIntegrationTest: invalid login fields: "{}" | **PASS** — assertions ผ่าน | 0.074 |
| BE-077 | AuthSecurityIntegrationTest: login ด้วยรหัสถูกต้องได้ Bearer token และใช้เรียก me ได้โดยไม่มี session | **PASS** — assertions ผ่าน | 0.146 |
| BE-078 | AuthSecurityIntegrationTest: protected path: "/api/v1/auth/me" | **PASS** — assertions ผ่าน | 0.07 |
| BE-079 | AuthSecurityIntegrationTest: protected path: "/api/v1/brands" | **PASS** — assertions ผ่าน | 0.07 |
| BE-080 | AuthSecurityIntegrationTest: protected path: "/api/v1/categories" | **PASS** — assertions ผ่าน | 0.07 |
| BE-081 | AuthSecurityIntegrationTest: protected path: "/api/v1/customers" | **PASS** — assertions ผ่าน | 0.071 |
| BE-082 | AuthSecurityIntegrationTest: protected path: "/api/v1/products/items" | **PASS** — assertions ผ่าน | 0.07 |
| BE-083 | AuthSecurityIntegrationTest: protected path: "/api/v1/products/models" | **PASS** — assertions ผ่าน | 0.07 |
| BE-084 | AuthSecurityIntegrationTest: protected path: "/api/v1/sales" | **PASS** — assertions ผ่าน | 0.071 |
| BE-085 | AuthSecurityIntegrationTest: service อ่านผู้ใช้ที่ไม่มีต้องแจ้ง not found | **PASS** — assertions ผ่าน | 0.071 |
| BE-086 | AuthSecurityIntegrationTest: token ของผู้ใช้ที่ถูกลบต้องได้ 401 | **PASS** — assertions ผ่าน | 0.074 |
| BE-087 | AuthSecurityIntegrationTest: token หมดอายุหรือเซ็นด้วยกุญแจอื่นต้องได้ 401 | **PASS** — assertions ผ่าน | 0.175 |
| BE-088 | AuthSecurityIntegrationTest: บัญชีปิดใช้งาน login ไม่ได้และ token เดิมเข้า API ไม่ได้ | **PASS** — assertions ผ่าน | 0.146 |
| BE-089 | AuthSecurityIntegrationTest: หน้า root เปิดได้โดยไม่ต้อง login และ status อ่านได้เมื่อมี JWT | **PASS** — assertions ผ่าน | 0.075 |
| BE-090 | SalePersistenceIntegrationTest: invalid API sale input: "emptyItems" | **PASS** — assertions ผ่าน | 0.011 |
| BE-091 | SalePersistenceIntegrationTest: invalid API sale input: "missingPayment" | **PASS** — assertions ผ่าน | 0.014 |
| BE-092 | SalePersistenceIntegrationTest: invalid API sale input: "negativeDiscount" | **PASS** — assertions ผ่าน | 0.013 |
| BE-093 | SalePersistenceIntegrationTest: invalid API sale input: "negativePrice" | **PASS** — assertions ผ่าน | 0.012 |
| BE-094 | SalePersistenceIntegrationTest: invalid API sale input: "zeroQuantity" | **PASS** — assertions ผ่าน | 0.013 |
| BE-095 | SalePersistenceIntegrationTest: invalid sale scenario: "duplicateItem" | **PASS** — assertions ผ่าน | 0.011 |
| BE-096 | SalePersistenceIntegrationTest: invalid sale scenario: "emptyItems" | **PASS** — assertions ผ่าน | 0.01 |
| BE-097 | SalePersistenceIntegrationTest: invalid sale scenario: "insufficientPayment" | **PASS** — assertions ผ่าน | 0.012 |
| BE-098 | SalePersistenceIntegrationTest: invalid sale scenario: "insufficientStock" | **PASS** — assertions ผ่าน | 0.011 |
| BE-099 | SalePersistenceIntegrationTest: invalid sale scenario: "mismatchedModel" | **PASS** — assertions ผ่าน | 0.012 |
| BE-100 | SalePersistenceIntegrationTest: invalid sale scenario: "missingCashier" | **PASS** — assertions ผ่าน | 0.011 |
| BE-101 | SalePersistenceIntegrationTest: invalid sale scenario: "missingCustomer" | **PASS** — assertions ผ่าน | 0.011 |
| BE-102 | SalePersistenceIntegrationTest: invalid sale scenario: "missingItem" | **PASS** — assertions ผ่าน | 0.01 |
| BE-103 | SalePersistenceIntegrationTest: invalid sale scenario: "missingModel" | **PASS** — assertions ผ่าน | 0.011 |
| BE-104 | SalePersistenceIntegrationTest: ขายผ่าน JWT API บันทึก order/payment/warranty/tax invoice และลดสต็อกจริงหลัง commit | **PASS** — assertions ผ่าน | 0.103 |
| BE-105 | SalePersistenceIntegrationTest: ขายสินค้าจำนวนรวมที่ไม่ serialized ลดสต็อกตามจำนวนและไม่ออกประกันรายเครื่อง | **PASS** — assertions ผ่าน | 0.051 |
| BE-106 | SalePersistenceIntegrationTest: ขายเครื่องที่ SOLD แล้วต้องปฏิเสธและไม่สร้างบิลเพิ่ม | **PASS** — assertions ผ่าน | 0.015 |
| BE-107 | SalePersistenceIntegrationTest: ค้นหาบิลด้วย ID หรือรหัสที่ไม่มีต้องแจ้ง not found | **PASS** — assertions ผ่าน | 0.008 |
| BE-108 | SalePersistenceIntegrationTest: รายการแรกสำเร็จแต่รายการถัดไปไม่พบต้อง rollback ทั้งบิล | **PASS** — assertions ผ่าน | 0.017 |
| BE-109 | SalePersistenceIntegrationTest: ส่วนลดท้ายบิลเกินยอดต้องให้ยอดสุทธิศูนย์และชำระศูนย์ได้ | **PASS** — assertions ผ่าน | 0.012 |
| BE-110 | SalePersistenceIntegrationTest: ส่วนลดรายบรรทัดและส่วนลดท้ายบิลหักถูกต้อง พร้อมรับเงินเกินยอดได้ | **PASS** — assertions ผ่าน | 0.015 |
| BE-111 | SalePersistenceIntegrationTest: เครื่องเดียวที่ระบุ itemId ต้องไม่ขายด้วย quantity มากกว่าหนึ่ง | **FAIL** — org.opentest4j.MultipleFailuresError: Multiple Failures (4 failures) | 0.019 |
| BE-112 | StockCustomerIntegrationTest: IMEI หรือ Serial ซ้ำต้องปฏิเสธโดยไม่เพิ่มสต็อก | **PASS** — assertions ผ่าน | 0.004 |
| BE-113 | StockCustomerIntegrationTest: delete item status: AVAILABLE | **PASS** — assertions ผ่าน | 0.004 |
| BE-114 | StockCustomerIntegrationTest: delete item status: SOLD | **PASS** — assertions ผ่าน | 0.004 |
| BE-115 | StockCustomerIntegrationTest: stock transition AVAILABLE -> CLAIMING -> AVAILABLE | **PASS** — assertions ผ่าน | 0.004 |
| BE-116 | StockCustomerIntegrationTest: stock transition AVAILABLE -> DAMAGED -> AVAILABLE | **PASS** — assertions ผ่าน | 0.004 |
| BE-117 | StockCustomerIntegrationTest: stock transition AVAILABLE -> RESERVED -> AVAILABLE | **PASS** — assertions ผ่าน | 0.005 |
| BE-118 | StockCustomerIntegrationTest: stock transition AVAILABLE -> SOLD -> AVAILABLE | **PASS** — assertions ผ่าน | 0.004 |
| BE-119 | StockCustomerIntegrationTest: ค้นหา แก้ไข และลบ ID ที่ไม่มีต้องแจ้ง not found ทุก service | **PASS** — assertions ผ่าน | 0.011 |
| BE-120 | StockCustomerIntegrationTest: ค้นหาลูกค้าตามชื่อ นามสกุล โทรศัพท์ แบบไม่สนตัวพิมพ์และรองรับ pagination | **PASS** — assertions ผ่าน | 0.011 |
| BE-121 | StockCustomerIntegrationTest: รุ่นสินค้าต้นทุนไม่ระบุให้ศูนย์ สต็อกเริ่มศูนย์ และค้นหาตามชื่อ/แบรนด์/หมวดหมู่ได้ | **PASS** — assertions ผ่าน | 0.011 |
| BE-122 | StockCustomerIntegrationTest: รุ่นสินค้าที่อ้างอิงแบรนด์หรือหมวดหมู่ไม่มีต้องปฏิเสธ | **PASS** — assertions ผ่าน | 0.004 |
| BE-123 | StockCustomerIntegrationTest: รุ่นสินค้าแก้ไขรายละเอียดและลบได้เมื่อไม่มีสินค้ารายชิ้น | **PASS** — assertions ผ่าน | 0.016 |
| BE-124 | StockCustomerIntegrationTest: ลูกค้าสร้าง อ่านด้วย ID/โทรศัพท์ แก้ไขและลบได้ | **PASS** — assertions ผ่าน | 0.004 |
| BE-125 | StockCustomerIntegrationTest: สร้างลูกค้าโทรศัพท์ซ้ำต้องปฏิเสธและไม่เพิ่มแถว | **PASS** — assertions ผ่าน | 0.004 |
| BE-126 | StockCustomerIntegrationTest: สร้างแบรนด์ชื่อซ้ำต่างตัวพิมพ์ต้องปฏิเสธ | **PASS** — assertions ผ่าน | 0.003 |
| BE-127 | StockCustomerIntegrationTest: หมวดหมู่ชื่อซ้ำต่างตัวพิมพ์ต้องปฏิเสธ | **PASS** — assertions ผ่าน | 0.003 |
| BE-128 | StockCustomerIntegrationTest: หมวดหมู่สร้าง แก้ไข อ่าน และลบได้ โดย update null ไม่เปลี่ยน isSerialized | **PASS** — assertions ผ่าน | 0.005 |
| BE-129 | StockCustomerIntegrationTest: เปลี่ยนสถานะเดิมซ้ำหรือเปลี่ยนระหว่างสถานะที่ไม่พร้อมขายต้องไม่ปรับสต็อกเพิ่ม | **PASS** — assertions ผ่าน | 0.003 |
| BE-130 | StockCustomerIntegrationTest: เพิ่มสินค้ารายชิ้นอ้างอิงรุ่นที่ไม่มีต้องไม่สร้างแถวหรือเพิ่มสต็อก | **PASS** — assertions ผ่าน | 0.002 |
| BE-131 | StockCustomerIntegrationTest: เพิ่มสินค้ารายชิ้นได้ AVAILABLE สต็อกเพิ่มหนึ่ง และอ่านผ่าน ID/IMEI/Serial ได้ | **PASS** — assertions ผ่าน | 0.014 |
| BE-132 | StockCustomerIntegrationTest: แบรนด์สร้าง อ่าน รายการ แก้ไข และลบได้เมื่อไม่มีสินค้าผูกอยู่ | **PASS** — assertions ผ่าน | 0.004 |
| BE-133 | JwtServiceTest: JWT invalid input [1]: null | **PASS** — assertions ผ่าน | 0.0 |
| BE-134 | JwtServiceTest: JWT invalid input [2]: "" | **PASS** — assertions ผ่าน | 0.0 |
| BE-135 | JwtServiceTest: JWT invalid input [3]: " " | **PASS** — assertions ผ่าน | 0.0 |
| BE-136 | JwtServiceTest: JWT invalid input [4]: "not-a-jwt" | **PASS** — assertions ผ่าน | 0.0 |
| BE-137 | JwtServiceTest: JWT invalid input [5]: "a.b.c" | **PASS** — assertions ผ่าน | 0.001 |
| BE-138 | JwtServiceTest: JWT ที่ลงนามด้วยกุญแจอื่นต้องไม่ผ่าน | **PASS** — assertions ผ่าน | 0.0 |
| BE-139 | JwtServiceTest: JWT ที่ออกใหม่ตรวจลายเซ็นและอ่าน username, userId, role ได้ | **PASS** — assertions ผ่าน | 0.001 |
| BE-140 | JwtServiceTest: JWT หมดอายุต้องไม่ผ่าน โดยไม่ใช้ sleep | **PASS** — assertions ผ่าน | 0.001 |
| BE-141 | JwtServiceTest: JWT ไม่มี expiration ต้องไม่ผ่าน | **PASS** — assertions ผ่าน | 0.0 |
| BE-142 | PricingAndDocumentTest: VAT included: total="0.00", preVAT="0.00", VAT="0.00" | **PASS** — assertions ผ่าน | 0.001 |
| BE-143 | PricingAndDocumentTest: VAT included: total="100.00", preVAT="93.46", VAT="6.54" | **PASS** — assertions ผ่าน | 0.0 |
| BE-144 | PricingAndDocumentTest: VAT included: total="107.00", preVAT="100.00", VAT="7.00" | **PASS** — assertions ผ่าน | 0.0 |
| BE-145 | PricingAndDocumentTest: fixed discount: subtotal="0", discount="20", expected="0" | **PASS** — assertions ผ่าน | 0.0 |
| BE-146 | PricingAndDocumentTest: fixed discount: subtotal="100", discount="-1", expected="0" | **PASS** — assertions ผ่าน | 0.0 |
| BE-147 | PricingAndDocumentTest: fixed discount: subtotal="100", discount="0", expected="0" | **PASS** — assertions ผ่าน | 0.0 |
| BE-148 | PricingAndDocumentTest: fixed discount: subtotal="100", discount="150", expected="100" | **PASS** — assertions ผ่าน | 0.0 |
| BE-149 | PricingAndDocumentTest: fixed discount: subtotal="100", discount="20", expected="20" | **PASS** — assertions ผ่าน | 0.003 |
| BE-150 | PricingAndDocumentTest: fixed discount: subtotal="100", discount=null, expected="0" | **PASS** — assertions ผ่าน | 0.0 |
| BE-151 | PricingAndDocumentTest: percentage: subtotal="0", percent="50", expected="0" | **PASS** — assertions ผ่าน | 0.0 |
| BE-152 | PricingAndDocumentTest: percentage: subtotal="10.05", percent="10", expected="1.01" | **PASS** — assertions ผ่าน | 0.0 |
| BE-153 | PricingAndDocumentTest: percentage: subtotal="100", percent="-5", expected="0" | **PASS** — assertions ผ่าน | 0.0 |
| BE-154 | PricingAndDocumentTest: percentage: subtotal="100", percent="0", expected="0" | **PASS** — assertions ผ่าน | 0.0 |
| BE-155 | PricingAndDocumentTest: percentage: subtotal="100", percent="10", expected="10.00" | **PASS** — assertions ผ่าน | 0.0 |
| BE-156 | PricingAndDocumentTest: percentage: subtotal="100", percent="150", expected="100.00" | **PASS** — assertions ผ่าน | 0.001 |
| BE-157 | PricingAndDocumentTest: percentage: subtotal="100", percent=null, expected="0" | **PASS** — assertions ผ่าน | 0.0 |
| BE-158 | PricingAndDocumentTest: resolver เลือก strategy ตามชื่อ และใช้ fixed เมื่อชื่อไม่พบหรือ null | **PASS** — assertions ผ่าน | 0.0 |
| BE-159 | PricingAndDocumentTest: warranty duration months: 0 | **PASS** — assertions ผ่าน | 0.0 |
| BE-160 | PricingAndDocumentTest: warranty duration months: 12 | **PASS** — assertions ผ่าน | 0.0 |
| BE-161 | PricingAndDocumentTest: warranty duration months: 24 | **PASS** — assertions ผ่าน | 0.0 |
| BE-162 | PricingAndDocumentTest: warranty duration months: 6 | **PASS** — assertions ผ่าน | 0.001 |
| BE-163 | PricingAndDocumentTest: warranty duration months: null | **PASS** — assertions ผ่าน | 0.0 |
| BE-164 | PricingAndDocumentTest: ใบกำกับภาษีรักษารหัสสาขาที่ระบุ | **PASS** — assertions ผ่าน | 0.0 |
| BE-165 | SaleServiceImplTest: Should successfully process sale order for serialized phone with warranty and tax invoice | **PASS** — assertions ผ่าน | 0.002 |
| BE-166 | SaleServiceImplTest: Should throw BadRequestException when payment amount is less than total amount | **PASS** — assertions ผ่าน | 0.321 |
| BE-167 | SaleServiceImplTest: Should throw BadRequestException when product item is not available | **PASS** — assertions ผ่าน | 0.001 |
| BE-168 | SaleServiceImplTest: Should throw ResourceNotFoundException when customer does not exist | **PASS** — assertions ผ่าน | 0.0 |

## ข้อจำกัดและหลักฐานอ้างอิง

- ไม่แก้ production code, public API, dependencies, frontend หรือ README; ไม่ลบ/ปิดเคสที่ไม่ผ่าน
- H2 ไม่ยืนยันพฤติกรรมเฉพาะ PostgreSQL; ไม่ครอบคลุม load, concurrency/race, deployment หรือการตรวจความปลอดภัยทั้งหมด
- ไม่มีการวัด line/branch coverage จึงไม่อ้างว่า coverage 100%; นับตาม test invocations จาก XML เท่านั้น
- เคส 500 และ unique constraint ใน HttpStatusContractTest ใช้ service mock; เคส auth, duplicate conflict และ sale persistence ใช้ service/repository/security จริง
- เทสต์ controller เดิมปิด security filter; ชุด integration ใหม่เปิด filter และครอบคลุม JWT ที่ถูกต้อง หมดอายุ ผิดลายเซ็น ผู้ใช้ถูกลบและบัญชีปิดใช้งาน
- Warning ที่พบ: deprecated API ใน JwtAuthenticationFilter และ JVM class-sharing warning; ไม่ใช่สาเหตุของ failures
- README เดิมอ้าง 51 เคส ซึ่งไม่ตรงกับจำนวนปัจจุบัน; รายงานนี้ใช้ผล XML ของการรันล่าสุด
- SHA-256 รวม test source/resources (เรียง path แล้ว hash path + NUL + bytes): df94913abc29cb0a9b74abfa65d43d8e8fa736742fe8b702d94cd1be44009983
- SHA-256 รวม XML (เรียง filename แล้ว hash filename + NUL + bytes): 4cbb0f4d6ef0814b2843f4fe80726120d95698a5b684471caf90d2ccbc20135f
