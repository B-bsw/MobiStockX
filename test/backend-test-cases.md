# Backend Test Cases

เอกสารกรณีทดสอบ backend เท่านั้น ใช้คู่กับ [ผลการรัน](backend-test-report.md) และโค้ด JUnit ที่ลิงก์ไว้ด้านล่าง

## ขอบเขตและวิธีทดสอบ

- ชุดเดิม 53 เคส และชุดเพิ่ม 119 เคส รวม 172 test invocations; parameterized test แต่ละ input นับเป็นหนึ่งเคส
- Controller slice ใช้ MockMvc กับ service จำลองเพื่อตรวจ routing, validation, status และ error handler; ชุด integration เปิด security filter จริงและใช้ H2
- Auth: สร้างบัญชี CASHIER ทดสอบด้วยรหัสที่เข้ารหัส BCrypt; login แล้วใช้ JWT เรียก API ตรวจผล response และการไม่มี session
- Stock/customer: สร้างแบรนด์ หมวดหมู่และรุ่นสินค้าในแต่ละเคส เรียก service จริง แล้ว flush/clear persistence context ก่อนอ่านข้อมูลกลับ
- Sale: ใช้ H2 แยกจากชุดอื่น สร้างลูกค้าและพนักงานหนึ่งคน รุ่น stock=2 และเครื่อง AVAILABLE สองเครื่อง ราคา 1,070 ต้นทุน 700; service ไม่มี outer test transaction จึงตรวจผล commit/rollback จาก transaction ใหม่ได้
- เคสขาย quantity=2 ของ itemId เดียว: คาด 400 ไม่มีบิล สต็อกยัง 2 และเครื่องทั้งสอง AVAILABLE
- H2 ของชุดเพิ่มแต่ละคลาสแยกชื่อฐานข้อมูลและใช้ profile test ปิด DataSeeder; cleanup หลังเคสขายไม่แตะฐานข้อมูลภายนอก

## เกณฑ์ HTTP Method และ Status Code

เกณฑ์อ้างอิงความหมายของสถานะตาม [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html#section-15) โดยเลือก 409 เป็นสัญญาที่ต้องการสำหรับข้อมูลซ้ำที่ขัดแย้งกับสถานะเดิมของระบบ; ไม่ถือว่า error ทุกชนิดในฐานข้อมูลต้องเป็น 409

| Method/สถานการณ์ | Expected | วิธีตรวจ |
| --- | --- | --- |
| GET อ่านข้อมูล / PUT แก้ไข / PATCH เปลี่ยนสถานะสินค้า | 200 | ชุด controller เดิมและ HTTP contract; ตรวจ body |
| POST สร้างข้อมูลใหม่ | 201 | ตรวจ identifier ใน body; integration อ่านข้อมูลจริงกลับ |
| DELETE สำเร็จ | 204 | ตรวจ response ว่างใน HTTP contract |
| Validation ไม่ผ่าน / JSON เสียรูปแบบ | 400 | ตรวจ validationErrors หรือปฏิเสธ body ที่เป็นเครื่องหมายปีกกาเปิดอย่างเดียว |
| GET resource ที่ไม่มี | 404 | ตรวจ status และ error body |
| POST ข้อมูลซ้ำ / unique conflict | 409 | integration ซ้ำชื่อแบรนด์ หมวดหมู่ โทรศัพท์ IMEI และ Serial; slice จำลอง unique violation |
| Unexpected internal exception | 500 | Mockito ให้ service โยน IllegalStateException แล้วตรวจ real handler |
| PATCH บน route ที่รองรับเฉพาะ GET/PUT/DELETE | 405 | เพิ่มเติมเพื่อตรวจ method ที่ไม่รองรับ |

## การยืนยันหลังแก้ backend

เคสเดิมยังคง ID เดิม เพิ่ม BE-169 ถึง BE-172 เพื่อยืนยันค่า explicit ไม่ถูก default ทับ, DuplicateKeyException และ non-unique SQLSTATE 23502/23503; SQLSTATE 23505 ของ unique violation ใช้ยืนยันเคส 409 เดิม

## กรณีทดสอบทั้งหมด

Expected เป็นเกณฑ์ assertion; ขั้นตอนและ input เพิ่มเติมอยู่ใน source ของแต่ละคลาส

### MobistockBackendApplicationTests

[JUnit source](../code/backend/src/test/java/com/example/mobistock/MobistockBackendApplicationTests.java)

| ID | Scenario / Input | Expected |
| --- | --- | --- |
| BE-001 | contextLoads() | Spring application context เริ่มได้ |

### CorsConfigTest

[JUnit source](../code/backend/src/test/java/com/example/mobistock/config/CorsConfigTest.java)

| ID | Scenario / Input | Expected |
| --- | --- | --- |
| BE-002 | allowsConfiguredOrigins() | CORS preflight ได้ 200 และ Allow-Origin ตรง origin ที่อนุญาต |
| BE-003 | rejectsUnconfiguredOrigin() | CORS preflight จาก origin อื่นได้ 403 |

### BrandControllerTest

[JUnit source](../code/backend/src/test/java/com/example/mobistock/controller/BrandControllerTest.java)

| ID | Scenario / Input | Expected |
| --- | --- | --- |
| BE-004 | DELETE /api/v1/brands/{id} - Should return 204 No Content | DELETE /api/v1/brands/{id} - Should return 204 No Content |
| BE-005 | GET /api/v1/brands - Should return 200 with list of brands | GET /api/v1/brands - Should return 200 with list of brands |
| BE-006 | GET /api/v1/brands/{id} - Should return 200 when brand exists | GET /api/v1/brands/{id} - Should return 200 when brand exists |
| BE-007 | GET /api/v1/brands/{id} - Should return 404 when brand does not exist | GET /api/v1/brands/{id} - Should return 404 when brand does not exist |
| BE-008 | POST /api/v1/brands - Should return 201 when request is valid | POST /api/v1/brands - Should return 201 when request is valid |
| BE-009 | POST /api/v1/brands - Should return 400 when brandName is blank | POST /api/v1/brands - Should return 400 when brandName is blank |
| BE-010 | PUT /api/v1/brands/{id} - Should return 200 when update is successful | PUT /api/v1/brands/{id} - Should return 200 when update is successful |

### CategoryControllerTest

[JUnit source](../code/backend/src/test/java/com/example/mobistock/controller/CategoryControllerTest.java)

| ID | Scenario / Input | Expected |
| --- | --- | --- |
| BE-011 | DELETE /api/v1/categories/{id} - Should return 204 No Content | DELETE /api/v1/categories/{id} - Should return 204 No Content |
| BE-012 | GET /api/v1/categories - Should return 200 with list of categories | GET /api/v1/categories - Should return 200 with list of categories |
| BE-013 | GET /api/v1/categories/{id} - Should return 200 when category exists | GET /api/v1/categories/{id} - Should return 200 when category exists |
| BE-014 | GET /api/v1/categories/{id} - Should return 404 when category not found | GET /api/v1/categories/{id} - Should return 404 when category not found |
| BE-015 | POST /api/v1/categories - Should return 201 when category created successfully | POST /api/v1/categories - Should return 201 when category created successfully |
| BE-016 | POST /api/v1/categories - Should return 400 when categoryNameTh is blank | POST /api/v1/categories - Should return 400 when categoryNameTh is blank |
| BE-017 | PUT /api/v1/categories/{id} - Should return 200 when update succeeds | PUT /api/v1/categories/{id} - Should return 200 when update succeeds |

### CustomerControllerTest

[JUnit source](../code/backend/src/test/java/com/example/mobistock/controller/CustomerControllerTest.java)

| ID | Scenario / Input | Expected |
| --- | --- | --- |
| BE-018 | DELETE /api/v1/customers/{id} - Should return 204 No Content | DELETE /api/v1/customers/{id} - Should return 204 No Content |
| BE-019 | GET /api/v1/customers - Should return 200 with paginated customers | GET /api/v1/customers - Should return 200 with paginated customers |
| BE-020 | GET /api/v1/customers/phone/{phone} - Should return 200 when customer found by phone | GET /api/v1/customers/phone/{phone} - Should return 200 when customer found by phone |
| BE-021 | GET /api/v1/customers/{id} - Should return 200 when customer exists | GET /api/v1/customers/{id} - Should return 200 when customer exists |
| BE-022 | GET /api/v1/customers/{id} - Should return 404 when customer not found | GET /api/v1/customers/{id} - Should return 404 when customer not found |
| BE-023 | POST /api/v1/customers - Should return 201 when customer registered successfully | POST /api/v1/customers - Should return 201 when customer registered successfully |
| BE-024 | POST /api/v1/customers - Should return 400 when required fields are missing | POST /api/v1/customers - Should return 400 when required fields are missing |
| BE-025 | PUT /api/v1/customers/{id} - Should return 200 when updated successfully | PUT /api/v1/customers/{id} - Should return 200 when updated successfully |

### HttpStatusContractTest

[JUnit source](../code/backend/src/test/java/com/example/mobistock/controller/HttpStatusContractTest.java)

| ID | Scenario / Input | Expected |
| --- | --- | --- |
| BE-026 | HTTP DELETE สำเร็จต้องตอบ 204 และไม่มี response body | HTTP DELETE สำเร็จต้องตอบ 204 และไม่มี response body |
| BE-027 | HTTP GET resource ไม่มีต้องตอบ 404 | HTTP GET resource ไม่มีต้องตอบ 404 |
| BE-028 | HTTP GET อ่านข้อมูลสำเร็จต้องตอบ 200 | HTTP GET อ่านข้อมูลสำเร็จต้องตอบ 200 |
| BE-029 | HTTP GET เมื่อเกิด unexpected internal exception ต้องตอบ 500 พร้อม error body | HTTP GET เมื่อเกิด unexpected internal exception ต้องตอบ 500 พร้อม error body |
| BE-030 | HTTP Method ที่ route ไม่รองรับต้องตอบ 405 ไม่ใช่ 500 และไม่เรียก service | HTTP Method ที่ route ไม่รองรับต้องตอบ 405 ไม่ใช่ 500 และไม่เรียก service |
| BE-031 | HTTP POST JSON เสียรูปแบบต้องตอบ 400 ไม่ใช่ 500 | HTTP POST JSON เสียรูปแบบต้องตอบ 400 ไม่ใช่ 500 |
| BE-032 | HTTP POST ขัดแย้ง unique constraint ต้องตอบ 409 ไม่ใช่ 500 | HTTP POST ขัดแย้ง unique constraint ต้องตอบ 409 ไม่ใช่ 500 |
| BE-033 | HTTP POST ข้อมูลไม่ผ่าน validation ต้องตอบ 400 และไม่เรียก service | HTTP POST ข้อมูลไม่ผ่าน validation ต้องตอบ 400 และไม่เรียก service |
| BE-034 | HTTP POST สร้างข้อมูลสำเร็จต้องตอบ 201 | HTTP POST สร้างข้อมูลสำเร็จต้องตอบ 201 |
| BE-169 | HTTP POST เมื่อ Spring ระบุ DuplicateKeyException ต้องตอบ 409 | HTTP POST เมื่อ Spring ระบุ DuplicateKeyException ต้องตอบ 409 |
| BE-035 | HTTP PUT แก้ไขข้อมูลสำเร็จพร้อม response body ต้องตอบ 200 | HTTP PUT แก้ไขข้อมูลสำเร็จพร้อม response body ต้องตอบ 200 |
| BE-170 | non-unique constraint SQLSTATE: "23502" | HTTP 400 และข้อความไม่เปิดเผย SQL สำหรับ constraint ที่ไม่ใช่ unique |
| BE-171 | non-unique constraint SQLSTATE: "23503" | HTTP 400 และข้อความไม่เปิดเผย SQL สำหรับ constraint ที่ไม่ใช่ unique |

### ProductItemControllerTest

[JUnit source](../code/backend/src/test/java/com/example/mobistock/controller/ProductItemControllerTest.java)

| ID | Scenario / Input | Expected |
| --- | --- | --- |
| BE-036 | DELETE /api/v1/products/items/{id} - Should return 204 No Content | DELETE /api/v1/products/items/{id} - Should return 204 No Content |
| BE-037 | GET /api/v1/products/items - Should return 200 with paginated items | GET /api/v1/products/items - Should return 200 with paginated items |
| BE-038 | GET /api/v1/products/items/imei/{imei} - Should return 200 when IMEI exists | GET /api/v1/products/items/imei/{imei} - Should return 200 when IMEI exists |
| BE-039 | GET /api/v1/products/items/serial/{serialNumber} - Should return 200 when serial number exists | GET /api/v1/products/items/serial/{serialNumber} - Should return 200 when serial number exists |
| BE-040 | GET /api/v1/products/items/{id} - Should return 200 when item exists | GET /api/v1/products/items/{id} - Should return 200 when item exists |
| BE-041 | GET /api/v1/products/items/{id} - Should return 404 when item not found | GET /api/v1/products/items/{id} - Should return 404 when item not found |
| BE-042 | PATCH /api/v1/products/items/{id}/status - Should return 200 when status updated | PATCH /api/v1/products/items/{id}/status - Should return 200 when status updated |
| BE-043 | POST /api/v1/products/items - Should return 201 when product item created successfully | POST /api/v1/products/items - Should return 201 when product item created successfully |
| BE-044 | POST /api/v1/products/items - Should return 400 when modelId or prices are invalid | POST /api/v1/products/items - Should return 400 when modelId or prices are invalid |

### ProductModelControllerTest

[JUnit source](../code/backend/src/test/java/com/example/mobistock/controller/ProductModelControllerTest.java)

| ID | Scenario / Input | Expected |
| --- | --- | --- |
| BE-045 | DELETE /api/v1/products/models/{id} - Should return 204 No Content | DELETE /api/v1/products/models/{id} - Should return 204 No Content |
| BE-046 | GET /api/v1/products/models - Should return 200 with paginated product models | GET /api/v1/products/models - Should return 200 with paginated product models |
| BE-047 | GET /api/v1/products/models/brand/{brandId} - Should return 200 with models by brand | GET /api/v1/products/models/brand/{brandId} - Should return 200 with models by brand |
| BE-048 | GET /api/v1/products/models/category/{categoryId} - Should return 200 with models by category | GET /api/v1/products/models/category/{categoryId} - Should return 200 with models by category |
| BE-049 | GET /api/v1/products/models/{id} - Should return 200 when product model exists | GET /api/v1/products/models/{id} - Should return 200 when product model exists |
| BE-050 | GET /api/v1/products/models/{id} - Should return 404 when product model not found | GET /api/v1/products/models/{id} - Should return 404 when product model not found |
| BE-051 | POST /api/v1/products/models - Should return 201 when product model created successfully | POST /api/v1/products/models - Should return 201 when product model created successfully |
| BE-052 | POST /api/v1/products/models - Should return 400 when validation fails | POST /api/v1/products/models - Should return 400 when validation fails |
| BE-053 | PUT /api/v1/products/models/{id} - Should return 200 when update succeeds | PUT /api/v1/products/models/{id} - Should return 200 when update succeeds |

### SaleOrderControllerTest

[JUnit source](../code/backend/src/test/java/com/example/mobistock/controller/SaleOrderControllerTest.java)

| ID | Scenario / Input | Expected |
| --- | --- | --- |
| BE-054 | GET /api/v1/sales - Should return 200 with paginated orders | GET /api/v1/sales - Should return 200 with paginated orders |
| BE-055 | GET /api/v1/sales/code/{saleCode} - Should return 200 when order found by code | GET /api/v1/sales/code/{saleCode} - Should return 200 when order found by code |
| BE-056 | GET /api/v1/sales/{id} - Should return 200 when order exists | GET /api/v1/sales/{id} - Should return 200 when order exists |
| BE-057 | GET /api/v1/sales/{id} - Should return 404 when order does not exist | GET /api/v1/sales/{id} - Should return 404 when order does not exist |
| BE-058 | POST /api/v1/sales - Should return 201 when checkout succeeds | POST /api/v1/sales - Should return 201 when checkout succeeds |
| BE-059 | POST /api/v1/sales - Should return 400 when required fields are missing | POST /api/v1/sales - Should return 400 when required fields are missing |

### AuthSecurityIntegrationTest

[JUnit source](../code/backend/src/test/java/com/example/mobistock/integration/AuthSecurityIntegrationTest.java)

| ID | Scenario / Input | Expected |
| --- | --- | --- |
| BE-060 | Authorization header: "Basic dXNlcjpwYXNz" | HTTP 401 สำหรับ token/scheme ที่ไม่ถูกต้อง |
| BE-061 | Authorization header: "Bearer " | HTTP 401 สำหรับ token/scheme ที่ไม่ถูกต้อง |
| BE-062 | Authorization header: "Bearer invalid" | HTTP 401 สำหรับ token/scheme ที่ไม่ถูกต้อง |
| BE-063 | Authorization header: "bearer invalid" | HTTP 401 สำหรับ token/scheme ที่ไม่ถูกต้อง |
| BE-064 | HTTP POST รุ่นสินค้าที่ไม่ระบุ isSerialized ต้องใช้ default และตอบ 201 | HTTP POST รุ่นสินค้าที่ไม่ระบุ isSerialized ต้องใช้ default และตอบ 201 |
| BE-065 | HTTP POST สินค้ารายชิ้นที่ไม่ระบุ condition ต้องใช้ NEW และตอบ 201 | HTTP POST สินค้ารายชิ้นที่ไม่ระบุ condition ต้องใช้ NEW และตอบ 201 |
| BE-066 | JWT ที่ถูกต้องใช้สร้างและอ่านแบรนด์ผ่าน API และฐานข้อมูลจริงได้ | JWT ที่ถูกต้องใช้สร้างและอ่านแบรนด์ผ่าน API และฐานข้อมูลจริงได้ |
| BE-067 | bad credentials: "{\"username\":\"coverage-user\",\"password\":\"wrong\"}" | HTTP 401 และข้อความเดียวกันทั้ง username ไม่มีและรหัสผิด |
| BE-068 | bad credentials: "{\"username\":\"missing\",\"password\":\"Test-password-42\"}" | HTTP 401 และข้อความเดียวกันทั้ง username ไม่มีและรหัสผิด |
| BE-069 | duplicate resource conflict: "brand" | สร้างครั้งแรก 201; ส่งข้อมูลชนกับข้อมูลเดิมอีกครั้งต้อง 409 |
| BE-070 | duplicate resource conflict: "category" | สร้างครั้งแรก 201; ส่งข้อมูลชนกับข้อมูลเดิมอีกครั้งต้อง 409 |
| BE-071 | duplicate resource conflict: "customerPhone" | สร้างครั้งแรก 201; ส่งข้อมูลชนกับข้อมูลเดิมอีกครั้งต้อง 409 |
| BE-072 | duplicate resource conflict: "itemImei" | สร้างครั้งแรก 201; ส่งข้อมูลชนกับข้อมูลเดิมอีกครั้งต้อง 409 |
| BE-073 | duplicate resource conflict: "itemSerial" | สร้างครั้งแรก 201; ส่งข้อมูลชนกับข้อมูลเดิมอีกครั้งต้อง 409 |
| BE-074 | invalid login fields: "{\"username\":\" \",\"password\":\" \"}" | HTTP 400 พร้อม validationErrors |
| BE-075 | invalid login fields: "{\"username\":\"coverage-user\"}" | HTTP 400 พร้อม validationErrors |
| BE-076 | invalid login fields: "{}" | HTTP 400 พร้อม validationErrors |
| BE-077 | login ด้วยรหัสถูกต้องได้ Bearer token และใช้เรียก me ได้โดยไม่มี session | login ด้วยรหัสถูกต้องได้ Bearer token และใช้เรียก me ได้โดยไม่มี session |
| BE-078 | protected path: "/api/v1/auth/me" | HTTP 401 เมื่อไม่มี Authorization token |
| BE-079 | protected path: "/api/v1/brands" | HTTP 401 เมื่อไม่มี Authorization token |
| BE-080 | protected path: "/api/v1/categories" | HTTP 401 เมื่อไม่มี Authorization token |
| BE-081 | protected path: "/api/v1/customers" | HTTP 401 เมื่อไม่มี Authorization token |
| BE-082 | protected path: "/api/v1/products/items" | HTTP 401 เมื่อไม่มี Authorization token |
| BE-083 | protected path: "/api/v1/products/models" | HTTP 401 เมื่อไม่มี Authorization token |
| BE-084 | protected path: "/api/v1/sales" | HTTP 401 เมื่อไม่มี Authorization token |
| BE-085 | service อ่านผู้ใช้ที่ไม่มีต้องแจ้ง not found | service อ่านผู้ใช้ที่ไม่มีต้องแจ้ง not found |
| BE-086 | token ของผู้ใช้ที่ถูกลบต้องได้ 401 | token ของผู้ใช้ที่ถูกลบต้องได้ 401 |
| BE-087 | token หมดอายุหรือเซ็นด้วยกุญแจอื่นต้องได้ 401 | token หมดอายุหรือเซ็นด้วยกุญแจอื่นต้องได้ 401 |
| BE-172 | ค่า default ต้องไม่ทับ isSerialized=false ระยะประกันที่ระบุ หรือ condition=SECOND_HAND | ค่า default ต้องไม่ทับ isSerialized=false ระยะประกันที่ระบุ หรือ condition=SECOND_HAND |
| BE-088 | บัญชีปิดใช้งาน login ไม่ได้และ token เดิมเข้า API ไม่ได้ | บัญชีปิดใช้งาน login ไม่ได้และ token เดิมเข้า API ไม่ได้ |
| BE-089 | หน้า root เปิดได้โดยไม่ต้อง login และ status อ่านได้เมื่อมี JWT | หน้า root เปิดได้โดยไม่ต้อง login และ status อ่านได้เมื่อมี JWT |

### SalePersistenceIntegrationTest

[JUnit source](../code/backend/src/test/java/com/example/mobistock/integration/SalePersistenceIntegrationTest.java)

| ID | Scenario / Input | Expected |
| --- | --- | --- |
| BE-090 | invalid API sale input: "emptyItems" | HTTP 400 พร้อม validationErrors และไม่เปลี่ยนข้อมูล |
| BE-091 | invalid API sale input: "missingPayment" | HTTP 400 พร้อม validationErrors และไม่เปลี่ยนข้อมูล |
| BE-092 | invalid API sale input: "negativeDiscount" | HTTP 400 พร้อม validationErrors และไม่เปลี่ยนข้อมูล |
| BE-093 | invalid API sale input: "negativePrice" | HTTP 400 พร้อม validationErrors และไม่เปลี่ยนข้อมูล |
| BE-094 | invalid API sale input: "zeroQuantity" | HTTP 400 พร้อม validationErrors และไม่เปลี่ยนข้อมูล |
| BE-095 | invalid sale scenario: "duplicateItem" | โยน BadRequestException/ResourceNotFoundException ตามกรณี และข้อมูลทั้งหมด rollback |
| BE-096 | invalid sale scenario: "emptyItems" | โยน BadRequestException/ResourceNotFoundException ตามกรณี และข้อมูลทั้งหมด rollback |
| BE-097 | invalid sale scenario: "insufficientPayment" | โยน BadRequestException/ResourceNotFoundException ตามกรณี และข้อมูลทั้งหมด rollback |
| BE-098 | invalid sale scenario: "insufficientStock" | โยน BadRequestException/ResourceNotFoundException ตามกรณี และข้อมูลทั้งหมด rollback |
| BE-099 | invalid sale scenario: "mismatchedModel" | โยน BadRequestException/ResourceNotFoundException ตามกรณี และข้อมูลทั้งหมด rollback |
| BE-100 | invalid sale scenario: "missingCashier" | โยน BadRequestException/ResourceNotFoundException ตามกรณี และข้อมูลทั้งหมด rollback |
| BE-101 | invalid sale scenario: "missingCustomer" | โยน BadRequestException/ResourceNotFoundException ตามกรณี และข้อมูลทั้งหมด rollback |
| BE-102 | invalid sale scenario: "missingItem" | โยน BadRequestException/ResourceNotFoundException ตามกรณี และข้อมูลทั้งหมด rollback |
| BE-103 | invalid sale scenario: "missingModel" | โยน BadRequestException/ResourceNotFoundException ตามกรณี และข้อมูลทั้งหมด rollback |
| BE-104 | ขายผ่าน JWT API บันทึก order/payment/warranty/tax invoice และลดสต็อกจริงหลัง commit | ขายผ่าน JWT API บันทึก order/payment/warranty/tax invoice และลดสต็อกจริงหลัง commit |
| BE-105 | ขายสินค้าจำนวนรวมที่ไม่ serialized ลดสต็อกตามจำนวนและไม่ออกประกันรายเครื่อง | ขายสินค้าจำนวนรวมที่ไม่ serialized ลดสต็อกตามจำนวนและไม่ออกประกันรายเครื่อง |
| BE-106 | ขายเครื่องที่ SOLD แล้วต้องปฏิเสธและไม่สร้างบิลเพิ่ม | ขายเครื่องที่ SOLD แล้วต้องปฏิเสธและไม่สร้างบิลเพิ่ม |
| BE-107 | ค้นหาบิลด้วย ID หรือรหัสที่ไม่มีต้องแจ้ง not found | ค้นหาบิลด้วย ID หรือรหัสที่ไม่มีต้องแจ้ง not found |
| BE-108 | รายการแรกสำเร็จแต่รายการถัดไปไม่พบต้อง rollback ทั้งบิล | รายการแรกสำเร็จแต่รายการถัดไปไม่พบต้อง rollback ทั้งบิล |
| BE-109 | ส่วนลดท้ายบิลเกินยอดต้องให้ยอดสุทธิศูนย์และชำระศูนย์ได้ | ส่วนลดท้ายบิลเกินยอดต้องให้ยอดสุทธิศูนย์และชำระศูนย์ได้ |
| BE-110 | ส่วนลดรายบรรทัดและส่วนลดท้ายบิลหักถูกต้อง พร้อมรับเงินเกินยอดได้ | ส่วนลดรายบรรทัดและส่วนลดท้ายบิลหักถูกต้อง พร้อมรับเงินเกินยอดได้ |
| BE-111 | เครื่องเดียวที่ระบุ itemId ต้องไม่ขายด้วย quantity มากกว่าหนึ่ง | เครื่องเดียวที่ระบุ itemId ต้องไม่ขายด้วย quantity มากกว่าหนึ่ง |

### StockCustomerIntegrationTest

[JUnit source](../code/backend/src/test/java/com/example/mobistock/integration/StockCustomerIntegrationTest.java)

| ID | Scenario / Input | Expected |
| --- | --- | --- |
| BE-112 | IMEI หรือ Serial ซ้ำต้องปฏิเสธโดยไม่เพิ่มสต็อก | IMEI หรือ Serial ซ้ำต้องปฏิเสธโดยไม่เพิ่มสต็อก |
| BE-113 | delete item status: AVAILABLE | ลบแถวได้ สต็อกเหลือหนึ่งและไม่ติดลบ |
| BE-114 | delete item status: SOLD | ลบแถวได้ สต็อกเหลือหนึ่งและไม่ติดลบ |
| BE-115 | stock transition AVAILABLE -> CLAIMING -> AVAILABLE | ออกจาก AVAILABLE สต็อกลดหนึ่ง; กลับ AVAILABLE สต็อกเพิ่มหนึ่ง |
| BE-116 | stock transition AVAILABLE -> DAMAGED -> AVAILABLE | ออกจาก AVAILABLE สต็อกลดหนึ่ง; กลับ AVAILABLE สต็อกเพิ่มหนึ่ง |
| BE-117 | stock transition AVAILABLE -> RESERVED -> AVAILABLE | ออกจาก AVAILABLE สต็อกลดหนึ่ง; กลับ AVAILABLE สต็อกเพิ่มหนึ่ง |
| BE-118 | stock transition AVAILABLE -> SOLD -> AVAILABLE | ออกจาก AVAILABLE สต็อกลดหนึ่ง; กลับ AVAILABLE สต็อกเพิ่มหนึ่ง |
| BE-119 | ค้นหา แก้ไข และลบ ID ที่ไม่มีต้องแจ้ง not found ทุก service | ค้นหา แก้ไข และลบ ID ที่ไม่มีต้องแจ้ง not found ทุก service |
| BE-120 | ค้นหาลูกค้าตามชื่อ นามสกุล โทรศัพท์ แบบไม่สนตัวพิมพ์และรองรับ pagination | ค้นหาลูกค้าตามชื่อ นามสกุล โทรศัพท์ แบบไม่สนตัวพิมพ์และรองรับ pagination |
| BE-121 | รุ่นสินค้าต้นทุนไม่ระบุให้ศูนย์ สต็อกเริ่มศูนย์ และค้นหาตามชื่อ/แบรนด์/หมวดหมู่ได้ | รุ่นสินค้าต้นทุนไม่ระบุให้ศูนย์ สต็อกเริ่มศูนย์ และค้นหาตามชื่อ/แบรนด์/หมวดหมู่ได้ |
| BE-122 | รุ่นสินค้าที่อ้างอิงแบรนด์หรือหมวดหมู่ไม่มีต้องปฏิเสธ | รุ่นสินค้าที่อ้างอิงแบรนด์หรือหมวดหมู่ไม่มีต้องปฏิเสธ |
| BE-123 | รุ่นสินค้าแก้ไขรายละเอียดและลบได้เมื่อไม่มีสินค้ารายชิ้น | รุ่นสินค้าแก้ไขรายละเอียดและลบได้เมื่อไม่มีสินค้ารายชิ้น |
| BE-124 | ลูกค้าสร้าง อ่านด้วย ID/โทรศัพท์ แก้ไขและลบได้ | ลูกค้าสร้าง อ่านด้วย ID/โทรศัพท์ แก้ไขและลบได้ |
| BE-125 | สร้างลูกค้าโทรศัพท์ซ้ำต้องปฏิเสธและไม่เพิ่มแถว | สร้างลูกค้าโทรศัพท์ซ้ำต้องปฏิเสธและไม่เพิ่มแถว |
| BE-126 | สร้างแบรนด์ชื่อซ้ำต่างตัวพิมพ์ต้องปฏิเสธ | สร้างแบรนด์ชื่อซ้ำต่างตัวพิมพ์ต้องปฏิเสธ |
| BE-127 | หมวดหมู่ชื่อซ้ำต่างตัวพิมพ์ต้องปฏิเสธ | หมวดหมู่ชื่อซ้ำต่างตัวพิมพ์ต้องปฏิเสธ |
| BE-128 | หมวดหมู่สร้าง แก้ไข อ่าน และลบได้ โดย update null ไม่เปลี่ยน isSerialized | หมวดหมู่สร้าง แก้ไข อ่าน และลบได้ โดย update null ไม่เปลี่ยน isSerialized |
| BE-129 | เปลี่ยนสถานะเดิมซ้ำหรือเปลี่ยนระหว่างสถานะที่ไม่พร้อมขายต้องไม่ปรับสต็อกเพิ่ม | เปลี่ยนสถานะเดิมซ้ำหรือเปลี่ยนระหว่างสถานะที่ไม่พร้อมขายต้องไม่ปรับสต็อกเพิ่ม |
| BE-130 | เพิ่มสินค้ารายชิ้นอ้างอิงรุ่นที่ไม่มีต้องไม่สร้างแถวหรือเพิ่มสต็อก | เพิ่มสินค้ารายชิ้นอ้างอิงรุ่นที่ไม่มีต้องไม่สร้างแถวหรือเพิ่มสต็อก |
| BE-131 | เพิ่มสินค้ารายชิ้นได้ AVAILABLE สต็อกเพิ่มหนึ่ง และอ่านผ่าน ID/IMEI/Serial ได้ | เพิ่มสินค้ารายชิ้นได้ AVAILABLE สต็อกเพิ่มหนึ่ง และอ่านผ่าน ID/IMEI/Serial ได้ |
| BE-132 | แบรนด์สร้าง อ่าน รายการ แก้ไข และลบได้เมื่อไม่มีสินค้าผูกอยู่ | แบรนด์สร้าง อ่าน รายการ แก้ไข และลบได้เมื่อไม่มีสินค้าผูกอยู่ |

### JwtServiceTest

[JUnit source](../code/backend/src/test/java/com/example/mobistock/security/JwtServiceTest.java)

| ID | Scenario / Input | Expected |
| --- | --- | --- |
| BE-133 | JWT invalid input [1]: null | isTokenValid คืน false โดยไม่โยน exception |
| BE-134 | JWT invalid input [2]: "" | isTokenValid คืน false โดยไม่โยน exception |
| BE-135 | JWT invalid input [3]: " " | isTokenValid คืน false โดยไม่โยน exception |
| BE-136 | JWT invalid input [4]: "not-a-jwt" | isTokenValid คืน false โดยไม่โยน exception |
| BE-137 | JWT invalid input [5]: "a.b.c" | isTokenValid คืน false โดยไม่โยน exception |
| BE-138 | JWT ที่ลงนามด้วยกุญแจอื่นต้องไม่ผ่าน | JWT ที่ลงนามด้วยกุญแจอื่นต้องไม่ผ่าน |
| BE-139 | JWT ที่ออกใหม่ตรวจลายเซ็นและอ่าน username, userId, role ได้ | JWT ที่ออกใหม่ตรวจลายเซ็นและอ่าน username, userId, role ได้ |
| BE-140 | JWT หมดอายุต้องไม่ผ่าน โดยไม่ใช้ sleep | JWT หมดอายุต้องไม่ผ่าน โดยไม่ใช้ sleep |
| BE-141 | JWT ไม่มี expiration ต้องไม่ผ่าน | JWT ไม่มี expiration ต้องไม่ผ่าน |

### PricingAndDocumentTest

[JUnit source](../code/backend/src/test/java/com/example/mobistock/service/PricingAndDocumentTest.java)

| ID | Scenario / Input | Expected |
| --- | --- | --- |
| BE-142 | VAT included: total="0.00", preVAT="0.00", VAT="0.00" | ยอดก่อน VAT และ VAT ตรงค่าที่ระบุ รวมกันเท่ากับยอดสุทธิ |
| BE-143 | VAT included: total="100.00", preVAT="93.46", VAT="6.54" | ยอดก่อน VAT และ VAT ตรงค่าที่ระบุ รวมกันเท่ากับยอดสุทธิ |
| BE-144 | VAT included: total="107.00", preVAT="100.00", VAT="7.00" | ยอดก่อน VAT และ VAT ตรงค่าที่ระบุ รวมกันเท่ากับยอดสุทธิ |
| BE-145 | fixed discount: subtotal="0", discount="20", expected="0" | ส่วนลดตรง expected; จำกัดไม่เกิน subtotal และ null/ค่าลบเป็นศูนย์ |
| BE-146 | fixed discount: subtotal="100", discount="-1", expected="0" | ส่วนลดตรง expected; จำกัดไม่เกิน subtotal และ null/ค่าลบเป็นศูนย์ |
| BE-147 | fixed discount: subtotal="100", discount="0", expected="0" | ส่วนลดตรง expected; จำกัดไม่เกิน subtotal และ null/ค่าลบเป็นศูนย์ |
| BE-148 | fixed discount: subtotal="100", discount="150", expected="100" | ส่วนลดตรง expected; จำกัดไม่เกิน subtotal และ null/ค่าลบเป็นศูนย์ |
| BE-149 | fixed discount: subtotal="100", discount="20", expected="20" | ส่วนลดตรง expected; จำกัดไม่เกิน subtotal และ null/ค่าลบเป็นศูนย์ |
| BE-150 | fixed discount: subtotal="100", discount=null, expected="0" | ส่วนลดตรง expected; จำกัดไม่เกิน subtotal และ null/ค่าลบเป็นศูนย์ |
| BE-151 | percentage: subtotal="0", percent="50", expected="0" | ส่วนลดตรง expected; จำกัด 100% และปัด HALF_UP สองตำแหน่ง |
| BE-152 | percentage: subtotal="10.05", percent="10", expected="1.01" | ส่วนลดตรง expected; จำกัด 100% และปัด HALF_UP สองตำแหน่ง |
| BE-153 | percentage: subtotal="100", percent="-5", expected="0" | ส่วนลดตรง expected; จำกัด 100% และปัด HALF_UP สองตำแหน่ง |
| BE-154 | percentage: subtotal="100", percent="0", expected="0" | ส่วนลดตรง expected; จำกัด 100% และปัด HALF_UP สองตำแหน่ง |
| BE-155 | percentage: subtotal="100", percent="10", expected="10.00" | ส่วนลดตรง expected; จำกัด 100% และปัด HALF_UP สองตำแหน่ง |
| BE-156 | percentage: subtotal="100", percent="150", expected="100.00" | ส่วนลดตรง expected; จำกัด 100% และปัด HALF_UP สองตำแหน่ง |
| BE-157 | percentage: subtotal="100", percent=null, expected="0" | ส่วนลดตรง expected; จำกัด 100% และปัด HALF_UP สองตำแหน่ง |
| BE-158 | resolver เลือก strategy ตามชื่อ และใช้ fixed เมื่อชื่อไม่พบหรือ null | resolver เลือก strategy ตามชื่อ และใช้ fixed เมื่อชื่อไม่พบหรือ null |
| BE-159 | warranty duration months: 0 | ประกัน ACTIVE; วันหมดอายุ = วันเริ่ม + จำนวนเดือน (null ใช้ 12) |
| BE-160 | warranty duration months: 12 | ประกัน ACTIVE; วันหมดอายุ = วันเริ่ม + จำนวนเดือน (null ใช้ 12) |
| BE-161 | warranty duration months: 24 | ประกัน ACTIVE; วันหมดอายุ = วันเริ่ม + จำนวนเดือน (null ใช้ 12) |
| BE-162 | warranty duration months: 6 | ประกัน ACTIVE; วันหมดอายุ = วันเริ่ม + จำนวนเดือน (null ใช้ 12) |
| BE-163 | warranty duration months: null | ประกัน ACTIVE; วันหมดอายุ = วันเริ่ม + จำนวนเดือน (null ใช้ 12) |
| BE-164 | ใบกำกับภาษีรักษารหัสสาขาที่ระบุ | ใบกำกับภาษีรักษารหัสสาขาที่ระบุ |

### SaleServiceImplTest

[JUnit source](../code/backend/src/test/java/com/example/mobistock/service/SaleServiceImplTest.java)

| ID | Scenario / Input | Expected |
| --- | --- | --- |
| BE-165 | Should successfully process sale order for serialized phone with warranty and tax invoice | Should successfully process sale order for serialized phone with warranty and tax invoice |
| BE-166 | Should throw BadRequestException when payment amount is less than total amount | Should throw BadRequestException when payment amount is less than total amount |
| BE-167 | Should throw BadRequestException when product item is not available | Should throw BadRequestException when product item is not available |
| BE-168 | Should throw ResourceNotFoundException when customer does not exist | Should throw ResourceNotFoundException when customer does not exist |
