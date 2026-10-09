# Backend Test Report

ผลรันล่าสุดหลังแก้ backend: **172/172 เคสผ่าน** จาก 15 คลาส; failures 0, errors 0, skipped 0

**ผลรวม: PASS** — 11 เคสที่เคยล้มเหลวผ่านทั้งหมด พร้อม regression เพิ่ม 4 เคส

## สภาพแวดล้อมและคำสั่ง

- ช่วงรัน JUnit: 2026-10-09T10:10:12.400+07:00 ถึง 2026-10-09T10:10:21.712+07:00 (Asia/Bangkok, UTC+07:00)
- macOS / Darwin arm64; OpenJDK Homebrew 21.0.12.1; Gradle wrapper 9.7.1; Spring Boot 4.1.1
- JUnit Platform, Mockito, MockMvc และ H2 in-memory; ไม่เชื่อมต่อ PostgreSQL หรือฐานข้อมูลจริง
- Gradle exit code 0: BUILD SUCCESSFUL in 11s; รันทุกเคสใหม่ด้วย --rerun-tasks
- Git HEAD: d0220077a16735231ebe7c5e87ff56e797e56ff0; ผลรวม changes ใน working tree ที่ยังไม่ได้ commit
- ชุดเดิม 53 เคสยังผ่านทั้งหมด; ชุดเพิ่มรวม 119 เคสผ่านทั้งหมด ไม่ปิดหรือข้ามเคสที่เคย fail

รันจาก code/backend:

~~~bash
JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home ./gradlew test --rerun-tasks
~~~

เครื่องอื่นใช้ JAVA_HOME ของ JDK 21 ที่ติดตั้ง

หลักฐาน: [Gradle HTML report](../code/backend/build/reports/tests/test/index.html), XML ที่ code/backend/build/test-results/test/TEST-*.xml และ [Test Cases](backend-test-cases.md)
Build artifacts ถูก gitignore; ตารางรายเคสและประวัติผลเดิมเก็บไว้ใน Markdown นี้

## สิ่งที่แก้และผลยืนยัน

| ปัญหา | ก่อนแก้ | หลังแก้ / หลักฐาน |
| --- | --- | --- |
| JSON เสียรูปแบบ | 500 | 400; BE-031 PASS |
| Method ไม่รองรับ | 500 | 405 พร้อม Allow: GET, PUT, DELETE; BE-030 PASS |
| Unique constraint | 500 | 409 เมื่อ SQLSTATE=23505; BE-032 PASS |
| แบรนด์/หมวดหมู่/โทรศัพท์/IMEI/Serial ซ้ำ | 400 | 409; BE-069 ถึง BE-073 PASS |
| Model ขาด isSerialized | 500 | 201, isSerialized=true, warranty=12 เดือน; BE-064 PASS |
| Item ขาด condition | 500 | 201, condition=NEW; BE-065 PASS |
| itemId เดียว quantity=2 | 201 สร้างบิลและลดสต็อก 2 | 400 ไม่มีบิล สต็อกยัง 2 และเครื่องทั้งสอง AVAILABLE; BE-111 PASS |

- เพิ่ม ConflictException แยกข้อมูลซ้ำจาก BadRequestException; duplicate create ใน 4 service ส่ง conflict
- แยก unique violation จาก constraint อื่น: DuplicateKeyException/SQLSTATE 23505 เป็น 409, non-unique integrity violation เป็น 400 พร้อมข้อความทั่วไปที่ไม่เปิดเผย SQL
- เทสต์ unique violation จำลอง cause เป็น SQLException ที่มี SQLSTATE 23505 ให้ตรงกับข้อผิดพลาดจากฐานข้อมูล แทน exception ที่ไม่มีชนิด constraint; เพิ่มเทสต์ยืนยัน non-unique เป็น 400
- ค่า default ถูกใช้ที่ StockMapper ก่อนบันทึก และรักษา false, warranty=24 และ SECOND_HAND ที่ผู้ใช้ระบุ
- SaleService ปฏิเสธ quantity ที่ไม่เท่ากับหนึ่งสำหรับ itemId ก่อนเปลี่ยนสถานะหรือสต็อก
- ปรับ assertion ระดับ service สำหรับข้อมูลซ้ำเป็น ConflictException ให้ตรงสัญญา 409; คง assertion HTTP เดิมทั้งหมด

## ผล HTTP Method และ Status Code

ตรวจตามเกณฑ์ใน [Test Cases](backend-test-cases.md) ซึ่งอ้างอิง [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html#section-15)

| Method / สถานการณ์ | Expected | Actual | ผล |
| --- | ---: | --- | --- |
| GET อ่าน / PUT แก้ไข / PATCH เปลี่ยนสถานะ | 200 | 200 พร้อม body | PASS |
| POST สร้างข้อมูล รวม default ที่ไม่ระบุ | 201 | 201 พร้อม identifier และ default ที่ถูกต้อง | PASS |
| DELETE สำเร็จ | 204 | 204 ไม่มี body | PASS |
| Validation หรือ JSON ไม่ถูกต้อง | 400 | 400 | PASS |
| Resource ไม่พบ | 404 | 404 | PASS |
| ข้อมูลซ้ำหรือ unique constraint conflict | 409 | 409 | PASS |
| Unexpected internal exception (fault injection) | 500 | 500 พร้อม error body | PASS |
| Method ไม่รองรับ (เพิ่มเติม) | 405 | 405 พร้อม Allow header | PASS |

## สรุปรายคลาส

| Test class | ทั้งหมด | PASS | FAIL | ERROR | SKIP |
| --- | ---: | ---: | ---: | ---: | ---: |
| [MobistockBackendApplicationTests](../code/backend/src/test/java/com/example/mobistock/MobistockBackendApplicationTests.java) | 1 | 1 | 0 | 0 | 0 |
| [CorsConfigTest](../code/backend/src/test/java/com/example/mobistock/config/CorsConfigTest.java) | 2 | 2 | 0 | 0 | 0 |
| [BrandControllerTest](../code/backend/src/test/java/com/example/mobistock/controller/BrandControllerTest.java) | 7 | 7 | 0 | 0 | 0 |
| [CategoryControllerTest](../code/backend/src/test/java/com/example/mobistock/controller/CategoryControllerTest.java) | 7 | 7 | 0 | 0 | 0 |
| [CustomerControllerTest](../code/backend/src/test/java/com/example/mobistock/controller/CustomerControllerTest.java) | 8 | 8 | 0 | 0 | 0 |
| [HttpStatusContractTest](../code/backend/src/test/java/com/example/mobistock/controller/HttpStatusContractTest.java) | 13 | 13 | 0 | 0 | 0 |
| [ProductItemControllerTest](../code/backend/src/test/java/com/example/mobistock/controller/ProductItemControllerTest.java) | 9 | 9 | 0 | 0 | 0 |
| [ProductModelControllerTest](../code/backend/src/test/java/com/example/mobistock/controller/ProductModelControllerTest.java) | 9 | 9 | 0 | 0 | 0 |
| [SaleOrderControllerTest](../code/backend/src/test/java/com/example/mobistock/controller/SaleOrderControllerTest.java) | 6 | 6 | 0 | 0 | 0 |
| [AuthSecurityIntegrationTest](../code/backend/src/test/java/com/example/mobistock/integration/AuthSecurityIntegrationTest.java) | 31 | 31 | 0 | 0 | 0 |
| [SalePersistenceIntegrationTest](../code/backend/src/test/java/com/example/mobistock/integration/SalePersistenceIntegrationTest.java) | 22 | 22 | 0 | 0 | 0 |
| [StockCustomerIntegrationTest](../code/backend/src/test/java/com/example/mobistock/integration/StockCustomerIntegrationTest.java) | 21 | 21 | 0 | 0 | 0 |
| [JwtServiceTest](../code/backend/src/test/java/com/example/mobistock/security/JwtServiceTest.java) | 9 | 9 | 0 | 0 | 0 |
| [PricingAndDocumentTest](../code/backend/src/test/java/com/example/mobistock/service/PricingAndDocumentTest.java) | 23 | 23 | 0 | 0 | 0 |
| [SaleServiceImplTest](../code/backend/src/test/java/com/example/mobistock/service/SaleServiceImplTest.java) | 4 | 4 | 0 | 0 | 0 |

## ผลราย Test Case

ID เดิม BE-001 ถึง BE-168 ยังคงเดิม; BE-169 ถึง BE-172 เป็น regression ที่เพิ่มหลังแก้ backend PASS หมายถึง assertions ที่กำหนดผ่าน ไม่ใช่การรับรองทุก branch ของระบบ

| ID | Test class / Case | Actual | เวลา (วินาที) |
| --- | --- | --- | ---: |
| BE-001 | MobistockBackendApplicationTests: contextLoads() | **PASS** — assertions ผ่าน | 0.001 |
| BE-002 | CorsConfigTest: allowsConfiguredOrigins() | **PASS** — assertions ผ่าน | 0.002 |
| BE-003 | CorsConfigTest: rejectsUnconfiguredOrigin() | **PASS** — assertions ผ่าน | 0.0 |
| BE-004 | BrandControllerTest: DELETE /api/v1/brands/{id} - Should return 204 No Content | **PASS** — assertions ผ่าน | 0.002 |
| BE-005 | BrandControllerTest: GET /api/v1/brands - Should return 200 with list of brands | **PASS** — assertions ผ่าน | 0.004 |
| BE-006 | BrandControllerTest: GET /api/v1/brands/{id} - Should return 200 when brand exists | **PASS** — assertions ผ่าน | 0.001 |
| BE-007 | BrandControllerTest: GET /api/v1/brands/{id} - Should return 404 when brand does not exist | **PASS** — assertions ผ่าน | 0.002 |
| BE-008 | BrandControllerTest: POST /api/v1/brands - Should return 201 when request is valid | **PASS** — assertions ผ่าน | 0.003 |
| BE-009 | BrandControllerTest: POST /api/v1/brands - Should return 400 when brandName is blank | **PASS** — assertions ผ่าน | 0.002 |
| BE-010 | BrandControllerTest: PUT /api/v1/brands/{id} - Should return 200 when update is successful | **PASS** — assertions ผ่าน | 0.005 |
| BE-011 | CategoryControllerTest: DELETE /api/v1/categories/{id} - Should return 204 No Content | **PASS** — assertions ผ่าน | 0.002 |
| BE-012 | CategoryControllerTest: GET /api/v1/categories - Should return 200 with list of categories | **PASS** — assertions ผ่าน | 0.003 |
| BE-013 | CategoryControllerTest: GET /api/v1/categories/{id} - Should return 200 when category exists | **PASS** — assertions ผ่าน | 0.005 |
| BE-014 | CategoryControllerTest: GET /api/v1/categories/{id} - Should return 404 when category not found | **PASS** — assertions ผ่าน | 0.002 |
| BE-015 | CategoryControllerTest: POST /api/v1/categories - Should return 201 when category created successfully | **PASS** — assertions ผ่าน | 0.003 |
| BE-016 | CategoryControllerTest: POST /api/v1/categories - Should return 400 when categoryNameTh is blank | **PASS** — assertions ผ่าน | 0.005 |
| BE-017 | CategoryControllerTest: PUT /api/v1/categories/{id} - Should return 200 when update succeeds | **PASS** — assertions ผ่าน | 0.009 |
| BE-018 | CustomerControllerTest: DELETE /api/v1/customers/{id} - Should return 204 No Content | **PASS** — assertions ผ่าน | 0.002 |
| BE-019 | CustomerControllerTest: GET /api/v1/customers - Should return 200 with paginated customers | **PASS** — assertions ผ่าน | 0.004 |
| BE-020 | CustomerControllerTest: GET /api/v1/customers/phone/{phone} - Should return 200 when customer found by phone | **PASS** — assertions ผ่าน | 0.003 |
| BE-021 | CustomerControllerTest: GET /api/v1/customers/{id} - Should return 200 when customer exists | **PASS** — assertions ผ่าน | 0.001 |
| BE-022 | CustomerControllerTest: GET /api/v1/customers/{id} - Should return 404 when customer not found | **PASS** — assertions ผ่าน | 0.003 |
| BE-023 | CustomerControllerTest: POST /api/v1/customers - Should return 201 when customer registered successfully | **PASS** — assertions ผ่าน | 0.003 |
| BE-024 | CustomerControllerTest: POST /api/v1/customers - Should return 400 when required fields are missing | **PASS** — assertions ผ่าน | 0.002 |
| BE-025 | CustomerControllerTest: PUT /api/v1/customers/{id} - Should return 200 when updated successfully | **PASS** — assertions ผ่าน | 0.005 |
| BE-026 | HttpStatusContractTest: HTTP DELETE สำเร็จต้องตอบ 204 และไม่มี response body | **PASS** — assertions ผ่าน | 0.003 |
| BE-027 | HttpStatusContractTest: HTTP GET resource ไม่มีต้องตอบ 404 | **PASS** — assertions ผ่าน | 0.003 |
| BE-028 | HttpStatusContractTest: HTTP GET อ่านข้อมูลสำเร็จต้องตอบ 200 | **PASS** — assertions ผ่าน | 0.003 |
| BE-029 | HttpStatusContractTest: HTTP GET เมื่อเกิด unexpected internal exception ต้องตอบ 500 พร้อม error body | **PASS** — assertions ผ่าน | 0.082 |
| BE-030 | HttpStatusContractTest: HTTP Method ที่ route ไม่รองรับต้องตอบ 405 ไม่ใช่ 500 และไม่เรียก service | **PASS** — assertions ผ่าน | 0.007 |
| BE-031 | HttpStatusContractTest: HTTP POST JSON เสียรูปแบบต้องตอบ 400 ไม่ใช่ 500 | **PASS** — assertions ผ่าน | 0.003 |
| BE-032 | HttpStatusContractTest: HTTP POST ขัดแย้ง unique constraint ต้องตอบ 409 ไม่ใช่ 500 | **PASS** — assertions ผ่าน | 0.004 |
| BE-033 | HttpStatusContractTest: HTTP POST ข้อมูลไม่ผ่าน validation ต้องตอบ 400 และไม่เรียก service | **PASS** — assertions ผ่าน | 0.006 |
| BE-034 | HttpStatusContractTest: HTTP POST สร้างข้อมูลสำเร็จต้องตอบ 201 | **PASS** — assertions ผ่าน | 0.009 |
| BE-169 | HttpStatusContractTest: HTTP POST เมื่อ Spring ระบุ DuplicateKeyException ต้องตอบ 409 | **PASS** — assertions ผ่าน | 0.04 |
| BE-035 | HttpStatusContractTest: HTTP PUT แก้ไขข้อมูลสำเร็จพร้อม response body ต้องตอบ 200 | **PASS** — assertions ผ่าน | 0.005 |
| BE-170 | HttpStatusContractTest: non-unique constraint SQLSTATE: "23502" | **PASS** — assertions ผ่าน | 0.005 |
| BE-171 | HttpStatusContractTest: non-unique constraint SQLSTATE: "23503" | **PASS** — assertions ผ่าน | 0.002 |
| BE-036 | ProductItemControllerTest: DELETE /api/v1/products/items/{id} - Should return 204 No Content | **PASS** — assertions ผ่าน | 0.002 |
| BE-037 | ProductItemControllerTest: GET /api/v1/products/items - Should return 200 with paginated items | **PASS** — assertions ผ่าน | 0.003 |
| BE-038 | ProductItemControllerTest: GET /api/v1/products/items/imei/{imei} - Should return 200 when IMEI exists | **PASS** — assertions ผ่าน | 0.001 |
| BE-039 | ProductItemControllerTest: GET /api/v1/products/items/serial/{serialNumber} - Should return 200 when serial number exists | **PASS** — assertions ผ่าน | 0.003 |
| BE-040 | ProductItemControllerTest: GET /api/v1/products/items/{id} - Should return 200 when item exists | **PASS** — assertions ผ่าน | 0.002 |
| BE-041 | ProductItemControllerTest: GET /api/v1/products/items/{id} - Should return 404 when item not found | **PASS** — assertions ผ่าน | 0.001 |
| BE-042 | ProductItemControllerTest: PATCH /api/v1/products/items/{id}/status - Should return 200 when status updated | **PASS** — assertions ผ่าน | 0.003 |
| BE-043 | ProductItemControllerTest: POST /api/v1/products/items - Should return 201 when product item created successfully | **PASS** — assertions ผ่าน | 0.004 |
| BE-044 | ProductItemControllerTest: POST /api/v1/products/items - Should return 400 when modelId or prices are invalid | **PASS** — assertions ผ่าน | 0.004 |
| BE-045 | ProductModelControllerTest: DELETE /api/v1/products/models/{id} - Should return 204 No Content | **PASS** — assertions ผ่าน | 0.002 |
| BE-046 | ProductModelControllerTest: GET /api/v1/products/models - Should return 200 with paginated product models | **PASS** — assertions ผ่าน | 0.002 |
| BE-047 | ProductModelControllerTest: GET /api/v1/products/models/brand/{brandId} - Should return 200 with models by brand | **PASS** — assertions ผ่าน | 0.001 |
| BE-048 | ProductModelControllerTest: GET /api/v1/products/models/category/{categoryId} - Should return 200 with models by category | **PASS** — assertions ผ่าน | 0.001 |
| BE-049 | ProductModelControllerTest: GET /api/v1/products/models/{id} - Should return 200 when product model exists | **PASS** — assertions ผ่าน | 0.004 |
| BE-050 | ProductModelControllerTest: GET /api/v1/products/models/{id} - Should return 404 when product model not found | **PASS** — assertions ผ่าน | 0.002 |
| BE-051 | ProductModelControllerTest: POST /api/v1/products/models - Should return 201 when product model created successfully | **PASS** — assertions ผ่าน | 0.002 |
| BE-052 | ProductModelControllerTest: POST /api/v1/products/models - Should return 400 when validation fails | **PASS** — assertions ผ่าน | 0.005 |
| BE-053 | ProductModelControllerTest: PUT /api/v1/products/models/{id} - Should return 200 when update succeeds | **PASS** — assertions ผ่าน | 0.004 |
| BE-054 | SaleOrderControllerTest: GET /api/v1/sales - Should return 200 with paginated orders | **PASS** — assertions ผ่าน | 0.003 |
| BE-055 | SaleOrderControllerTest: GET /api/v1/sales/code/{saleCode} - Should return 200 when order found by code | **PASS** — assertions ผ่าน | 0.001 |
| BE-056 | SaleOrderControllerTest: GET /api/v1/sales/{id} - Should return 200 when order exists | **PASS** — assertions ผ่าน | 0.001 |
| BE-057 | SaleOrderControllerTest: GET /api/v1/sales/{id} - Should return 404 when order does not exist | **PASS** — assertions ผ่าน | 0.004 |
| BE-058 | SaleOrderControllerTest: POST /api/v1/sales - Should return 201 when checkout succeeds | **PASS** — assertions ผ่าน | 0.012 |
| BE-059 | SaleOrderControllerTest: POST /api/v1/sales - Should return 400 when required fields are missing | **PASS** — assertions ผ่าน | 0.006 |
| BE-060 | AuthSecurityIntegrationTest: Authorization header: "Basic dXNlcjpwYXNz" | **PASS** — assertions ผ่าน | 0.07 |
| BE-061 | AuthSecurityIntegrationTest: Authorization header: "Bearer " | **PASS** — assertions ผ่าน | 0.077 |
| BE-062 | AuthSecurityIntegrationTest: Authorization header: "Bearer invalid" | **PASS** — assertions ผ่าน | 0.08 |
| BE-063 | AuthSecurityIntegrationTest: Authorization header: "bearer invalid" | **PASS** — assertions ผ่าน | 0.069 |
| BE-064 | AuthSecurityIntegrationTest: HTTP POST รุ่นสินค้าที่ไม่ระบุ isSerialized ต้องใช้ default และตอบ 201 | **PASS** — assertions ผ่าน | 0.079 |
| BE-065 | AuthSecurityIntegrationTest: HTTP POST สินค้ารายชิ้นที่ไม่ระบุ condition ต้องใช้ NEW และตอบ 201 | **PASS** — assertions ผ่าน | 0.08 |
| BE-066 | AuthSecurityIntegrationTest: JWT ที่ถูกต้องใช้สร้างและอ่านแบรนด์ผ่าน API และฐานข้อมูลจริงได้ | **PASS** — assertions ผ่าน | 0.127 |
| BE-067 | AuthSecurityIntegrationTest: bad credentials: "{\"username\":\"coverage-user\",\"password\":\"wrong\"}" | **PASS** — assertions ผ่าน | 0.136 |
| BE-068 | AuthSecurityIntegrationTest: bad credentials: "{\"username\":\"missing\",\"password\":\"Test-password-42\"}" | **PASS** — assertions ผ่าน | 0.072 |
| BE-069 | AuthSecurityIntegrationTest: duplicate resource conflict: "brand" | **PASS** — assertions ผ่าน | 0.078 |
| BE-070 | AuthSecurityIntegrationTest: duplicate resource conflict: "category" | **PASS** — assertions ผ่าน | 0.082 |
| BE-071 | AuthSecurityIntegrationTest: duplicate resource conflict: "customerPhone" | **PASS** — assertions ผ่าน | 0.082 |
| BE-072 | AuthSecurityIntegrationTest: duplicate resource conflict: "itemImei" | **PASS** — assertions ผ่าน | 0.105 |
| BE-073 | AuthSecurityIntegrationTest: duplicate resource conflict: "itemSerial" | **PASS** — assertions ผ่าน | 0.086 |
| BE-074 | AuthSecurityIntegrationTest: invalid login fields: "{\"username\":\" \",\"password\":\" \"}" | **PASS** — assertions ผ่าน | 0.071 |
| BE-075 | AuthSecurityIntegrationTest: invalid login fields: "{\"username\":\"coverage-user\"}" | **PASS** — assertions ผ่าน | 0.07 |
| BE-076 | AuthSecurityIntegrationTest: invalid login fields: "{}" | **PASS** — assertions ผ่าน | 0.07 |
| BE-077 | AuthSecurityIntegrationTest: login ด้วยรหัสถูกต้องได้ Bearer token และใช้เรียก me ได้โดยไม่มี session | **PASS** — assertions ผ่าน | 0.152 |
| BE-078 | AuthSecurityIntegrationTest: protected path: "/api/v1/auth/me" | **PASS** — assertions ผ่าน | 0.068 |
| BE-079 | AuthSecurityIntegrationTest: protected path: "/api/v1/brands" | **PASS** — assertions ผ่าน | 0.069 |
| BE-080 | AuthSecurityIntegrationTest: protected path: "/api/v1/categories" | **PASS** — assertions ผ่าน | 0.069 |
| BE-081 | AuthSecurityIntegrationTest: protected path: "/api/v1/customers" | **PASS** — assertions ผ่าน | 0.068 |
| BE-082 | AuthSecurityIntegrationTest: protected path: "/api/v1/products/items" | **PASS** — assertions ผ่าน | 0.068 |
| BE-083 | AuthSecurityIntegrationTest: protected path: "/api/v1/products/models" | **PASS** — assertions ผ่าน | 0.068 |
| BE-084 | AuthSecurityIntegrationTest: protected path: "/api/v1/sales" | **PASS** — assertions ผ่าน | 0.069 |
| BE-085 | AuthSecurityIntegrationTest: service อ่านผู้ใช้ที่ไม่มีต้องแจ้ง not found | **PASS** — assertions ผ่าน | 0.07 |
| BE-086 | AuthSecurityIntegrationTest: token ของผู้ใช้ที่ถูกลบต้องได้ 401 | **PASS** — assertions ผ่าน | 0.072 |
| BE-087 | AuthSecurityIntegrationTest: token หมดอายุหรือเซ็นด้วยกุญแจอื่นต้องได้ 401 | **PASS** — assertions ผ่าน | 0.175 |
| BE-172 | AuthSecurityIntegrationTest: ค่า default ต้องไม่ทับ isSerialized=false ระยะประกันที่ระบุ หรือ condition=SECOND_HAND | **PASS** — assertions ผ่าน | 0.081 |
| BE-088 | AuthSecurityIntegrationTest: บัญชีปิดใช้งาน login ไม่ได้และ token เดิมเข้า API ไม่ได้ | **PASS** — assertions ผ่าน | 0.144 |
| BE-089 | AuthSecurityIntegrationTest: หน้า root เปิดได้โดยไม่ต้อง login และ status อ่านได้เมื่อมี JWT | **PASS** — assertions ผ่าน | 0.072 |
| BE-090 | SalePersistenceIntegrationTest: invalid API sale input: "emptyItems" | **PASS** — assertions ผ่าน | 0.016 |
| BE-091 | SalePersistenceIntegrationTest: invalid API sale input: "missingPayment" | **PASS** — assertions ผ่าน | 0.013 |
| BE-092 | SalePersistenceIntegrationTest: invalid API sale input: "negativeDiscount" | **PASS** — assertions ผ่าน | 0.012 |
| BE-093 | SalePersistenceIntegrationTest: invalid API sale input: "negativePrice" | **PASS** — assertions ผ่าน | 0.016 |
| BE-094 | SalePersistenceIntegrationTest: invalid API sale input: "zeroQuantity" | **PASS** — assertions ผ่าน | 0.02 |
| BE-095 | SalePersistenceIntegrationTest: invalid sale scenario: "duplicateItem" | **PASS** — assertions ผ่าน | 0.01 |
| BE-096 | SalePersistenceIntegrationTest: invalid sale scenario: "emptyItems" | **PASS** — assertions ผ่าน | 0.009 |
| BE-097 | SalePersistenceIntegrationTest: invalid sale scenario: "insufficientPayment" | **PASS** — assertions ผ่าน | 0.011 |
| BE-098 | SalePersistenceIntegrationTest: invalid sale scenario: "insufficientStock" | **PASS** — assertions ผ่าน | 0.011 |
| BE-099 | SalePersistenceIntegrationTest: invalid sale scenario: "mismatchedModel" | **PASS** — assertions ผ่าน | 0.011 |
| BE-100 | SalePersistenceIntegrationTest: invalid sale scenario: "missingCashier" | **PASS** — assertions ผ่าน | 0.01 |
| BE-101 | SalePersistenceIntegrationTest: invalid sale scenario: "missingCustomer" | **PASS** — assertions ผ่าน | 0.01 |
| BE-102 | SalePersistenceIntegrationTest: invalid sale scenario: "missingItem" | **PASS** — assertions ผ่าน | 0.012 |
| BE-103 | SalePersistenceIntegrationTest: invalid sale scenario: "missingModel" | **PASS** — assertions ผ่าน | 0.011 |
| BE-104 | SalePersistenceIntegrationTest: ขายผ่าน JWT API บันทึก order/payment/warranty/tax invoice และลดสต็อกจริงหลัง commit | **PASS** — assertions ผ่าน | 0.087 |
| BE-105 | SalePersistenceIntegrationTest: ขายสินค้าจำนวนรวมที่ไม่ serialized ลดสต็อกตามจำนวนและไม่ออกประกันรายเครื่อง | **PASS** — assertions ผ่าน | 0.05 |
| BE-106 | SalePersistenceIntegrationTest: ขายเครื่องที่ SOLD แล้วต้องปฏิเสธและไม่สร้างบิลเพิ่ม | **PASS** — assertions ผ่าน | 0.012 |
| BE-107 | SalePersistenceIntegrationTest: ค้นหาบิลด้วย ID หรือรหัสที่ไม่มีต้องแจ้ง not found | **PASS** — assertions ผ่าน | 0.009 |
| BE-108 | SalePersistenceIntegrationTest: รายการแรกสำเร็จแต่รายการถัดไปไม่พบต้อง rollback ทั้งบิล | **PASS** — assertions ผ่าน | 0.016 |
| BE-109 | SalePersistenceIntegrationTest: ส่วนลดท้ายบิลเกินยอดต้องให้ยอดสุทธิศูนย์และชำระศูนย์ได้ | **PASS** — assertions ผ่าน | 0.01 |
| BE-110 | SalePersistenceIntegrationTest: ส่วนลดรายบรรทัดและส่วนลดท้ายบิลหักถูกต้อง พร้อมรับเงินเกินยอดได้ | **PASS** — assertions ผ่าน | 0.017 |
| BE-111 | SalePersistenceIntegrationTest: เครื่องเดียวที่ระบุ itemId ต้องไม่ขายด้วย quantity มากกว่าหนึ่ง | **PASS** — assertions ผ่าน | 0.014 |
| BE-112 | StockCustomerIntegrationTest: IMEI หรือ Serial ซ้ำต้องปฏิเสธโดยไม่เพิ่มสต็อก | **PASS** — assertions ผ่าน | 0.004 |
| BE-113 | StockCustomerIntegrationTest: delete item status: AVAILABLE | **PASS** — assertions ผ่าน | 0.003 |
| BE-114 | StockCustomerIntegrationTest: delete item status: SOLD | **PASS** — assertions ผ่าน | 0.003 |
| BE-115 | StockCustomerIntegrationTest: stock transition AVAILABLE -> CLAIMING -> AVAILABLE | **PASS** — assertions ผ่าน | 0.004 |
| BE-116 | StockCustomerIntegrationTest: stock transition AVAILABLE -> DAMAGED -> AVAILABLE | **PASS** — assertions ผ่าน | 0.004 |
| BE-117 | StockCustomerIntegrationTest: stock transition AVAILABLE -> RESERVED -> AVAILABLE | **PASS** — assertions ผ่าน | 0.006 |
| BE-118 | StockCustomerIntegrationTest: stock transition AVAILABLE -> SOLD -> AVAILABLE | **PASS** — assertions ผ่าน | 0.004 |
| BE-119 | StockCustomerIntegrationTest: ค้นหา แก้ไข และลบ ID ที่ไม่มีต้องแจ้ง not found ทุก service | **PASS** — assertions ผ่าน | 0.012 |
| BE-120 | StockCustomerIntegrationTest: ค้นหาลูกค้าตามชื่อ นามสกุล โทรศัพท์ แบบไม่สนตัวพิมพ์และรองรับ pagination | **PASS** — assertions ผ่าน | 0.014 |
| BE-121 | StockCustomerIntegrationTest: รุ่นสินค้าต้นทุนไม่ระบุให้ศูนย์ สต็อกเริ่มศูนย์ และค้นหาตามชื่อ/แบรนด์/หมวดหมู่ได้ | **PASS** — assertions ผ่าน | 0.01 |
| BE-122 | StockCustomerIntegrationTest: รุ่นสินค้าที่อ้างอิงแบรนด์หรือหมวดหมู่ไม่มีต้องปฏิเสธ | **PASS** — assertions ผ่าน | 0.004 |
| BE-123 | StockCustomerIntegrationTest: รุ่นสินค้าแก้ไขรายละเอียดและลบได้เมื่อไม่มีสินค้ารายชิ้น | **PASS** — assertions ผ่าน | 0.019 |
| BE-124 | StockCustomerIntegrationTest: ลูกค้าสร้าง อ่านด้วย ID/โทรศัพท์ แก้ไขและลบได้ | **PASS** — assertions ผ่าน | 0.003 |
| BE-125 | StockCustomerIntegrationTest: สร้างลูกค้าโทรศัพท์ซ้ำต้องปฏิเสธและไม่เพิ่มแถว | **PASS** — assertions ผ่าน | 0.004 |
| BE-126 | StockCustomerIntegrationTest: สร้างแบรนด์ชื่อซ้ำต่างตัวพิมพ์ต้องปฏิเสธ | **PASS** — assertions ผ่าน | 0.003 |
| BE-127 | StockCustomerIntegrationTest: หมวดหมู่ชื่อซ้ำต่างตัวพิมพ์ต้องปฏิเสธ | **PASS** — assertions ผ่าน | 0.004 |
| BE-128 | StockCustomerIntegrationTest: หมวดหมู่สร้าง แก้ไข อ่าน และลบได้ โดย update null ไม่เปลี่ยน isSerialized | **PASS** — assertions ผ่าน | 0.005 |
| BE-129 | StockCustomerIntegrationTest: เปลี่ยนสถานะเดิมซ้ำหรือเปลี่ยนระหว่างสถานะที่ไม่พร้อมขายต้องไม่ปรับสต็อกเพิ่ม | **PASS** — assertions ผ่าน | 0.003 |
| BE-130 | StockCustomerIntegrationTest: เพิ่มสินค้ารายชิ้นอ้างอิงรุ่นที่ไม่มีต้องไม่สร้างแถวหรือเพิ่มสต็อก | **PASS** — assertions ผ่าน | 0.003 |
| BE-131 | StockCustomerIntegrationTest: เพิ่มสินค้ารายชิ้นได้ AVAILABLE สต็อกเพิ่มหนึ่ง และอ่านผ่าน ID/IMEI/Serial ได้ | **PASS** — assertions ผ่าน | 0.011 |
| BE-132 | StockCustomerIntegrationTest: แบรนด์สร้าง อ่าน รายการ แก้ไข และลบได้เมื่อไม่มีสินค้าผูกอยู่ | **PASS** — assertions ผ่าน | 0.004 |
| BE-133 | JwtServiceTest: JWT invalid input [1]: null | **PASS** — assertions ผ่าน | 0.0 |
| BE-134 | JwtServiceTest: JWT invalid input [2]: "" | **PASS** — assertions ผ่าน | 0.0 |
| BE-135 | JwtServiceTest: JWT invalid input [3]: " " | **PASS** — assertions ผ่าน | 0.0 |
| BE-136 | JwtServiceTest: JWT invalid input [4]: "not-a-jwt" | **PASS** — assertions ผ่าน | 0.0 |
| BE-137 | JwtServiceTest: JWT invalid input [5]: "a.b.c" | **PASS** — assertions ผ่าน | 0.001 |
| BE-138 | JwtServiceTest: JWT ที่ลงนามด้วยกุญแจอื่นต้องไม่ผ่าน | **PASS** — assertions ผ่าน | 0.0 |
| BE-139 | JwtServiceTest: JWT ที่ออกใหม่ตรวจลายเซ็นและอ่าน username, userId, role ได้ | **PASS** — assertions ผ่าน | 0.001 |
| BE-140 | JwtServiceTest: JWT หมดอายุต้องไม่ผ่าน โดยไม่ใช้ sleep | **PASS** — assertions ผ่าน | 0.0 |
| BE-141 | JwtServiceTest: JWT ไม่มี expiration ต้องไม่ผ่าน | **PASS** — assertions ผ่าน | 0.0 |
| BE-142 | PricingAndDocumentTest: VAT included: total="0.00", preVAT="0.00", VAT="0.00" | **PASS** — assertions ผ่าน | 0.0 |
| BE-143 | PricingAndDocumentTest: VAT included: total="100.00", preVAT="93.46", VAT="6.54" | **PASS** — assertions ผ่าน | 0.001 |
| BE-144 | PricingAndDocumentTest: VAT included: total="107.00", preVAT="100.00", VAT="7.00" | **PASS** — assertions ผ่าน | 0.0 |
| BE-145 | PricingAndDocumentTest: fixed discount: subtotal="0", discount="20", expected="0" | **PASS** — assertions ผ่าน | 0.001 |
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
| BE-161 | PricingAndDocumentTest: warranty duration months: 24 | **PASS** — assertions ผ่าน | 0.001 |
| BE-162 | PricingAndDocumentTest: warranty duration months: 6 | **PASS** — assertions ผ่าน | 0.0 |
| BE-163 | PricingAndDocumentTest: warranty duration months: null | **PASS** — assertions ผ่าน | 0.0 |
| BE-164 | PricingAndDocumentTest: ใบกำกับภาษีรักษารหัสสาขาที่ระบุ | **PASS** — assertions ผ่าน | 0.0 |
| BE-165 | SaleServiceImplTest: Should successfully process sale order for serialized phone with warranty and tax invoice | **PASS** — assertions ผ่าน | 0.002 |
| BE-166 | SaleServiceImplTest: Should throw BadRequestException when payment amount is less than total amount | **PASS** — assertions ผ่าน | 0.318 |
| BE-167 | SaleServiceImplTest: Should throw BadRequestException when product item is not available | **PASS** — assertions ผ่าน | 0.001 |
| BE-168 | SaleServiceImplTest: Should throw ResourceNotFoundException when customer does not exist | **PASS** — assertions ผ่าน | 0.001 |

## ประวัติ failures ก่อนแก้ — ไม่ใช่ผลปัจจุบัน

ข้อความต่อไปนี้มาจาก XML รอบก่อนแก้ (2026-10-09 10:01 น. UTC+07:00) ซึ่งมี 168 เคส ผ่าน 157 และ fail 11; ทุกเคสด้านล่างผ่านแล้วในรอบล่าสุด เก็บข้อความเดิมเพื่อเทียบย้อนหลัง

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

## ข้อจำกัดและหลักฐานอ้างอิง

- ใช้ H2 เท่านั้น ยังไม่ได้ยืนยันบน PostgreSQL; ไม่ครอบคลุม load, concurrency/race หรือ deployment
- ไม่ได้วัด line/branch coverage จึงไม่อ้าง coverage 100%; 172/172 เป็นผลผ่านของ test invocations จาก XML
- ไม่เปลี่ยน frontend หรือ dependencies; เปลี่ยนสถานะ duplicate create จาก 400 เป็น 409 ตามเกณฑ์ที่กำหนด
- Controller slice จำลอง service และปิด security filter; integration เปิด filter ใช้ service/repository จริง
- เคส SQLSTATE/DuplicateKeyException และ unexpected 500 ใช้ fault injection ไม่ใช่ PostgreSQL จริงหรือการทดสอบ race
- เคสขายใช้ service transaction จริง ตรวจ rollback/commit จาก transaction ใหม่และ cleanup เฉพาะ H2 ของคลาส
- Warning เดิมเกี่ยวกับ deprecated API ใน JwtAuthenticationFilter และ JVM class-sharing ยังมี แต่ไม่ทำให้เทสต์ล้มเหลว
- SHA-256 ด้านล่าง hash ตามลำดับ path โดยรวม path + NUL + bytes:
  - Test source/resources: 5504ecaad70cf3129c7398bcf684be4dafb77f8bc20ac90a4977f9b108a4d62c
  - Production source/resources: 09a83c6f8fb56fc1c3de8f701e058afccd24899ece9db39dcbed60800e084234
  - XML: 1d0b876b11325ebc5ea3d80e13d56bc9600b586e1a47294c7a571c84556178a4
