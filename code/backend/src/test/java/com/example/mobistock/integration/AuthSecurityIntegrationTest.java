package com.example.mobistock.integration;

import com.example.mobistock.domain.entity.AppUser;
import com.example.mobistock.domain.enums.UserRole;
import com.example.mobistock.repository.AppUserRepository;
import com.example.mobistock.security.JwtService;
import com.example.mobistock.service.AuthService;
import com.example.mobistock.exception.ResourceNotFoundException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:auth-coverage;DB_CLOSE_DELAY=-1")
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AuthSecurityIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired AppUserRepository users;
    @Autowired PasswordEncoder encoder;
    @Autowired JwtService jwt;
    @Autowired AuthService auth;
    private final ObjectMapper json = new ObjectMapper();
    private AppUser user;
    private static final String SECRET = "test-only-secret-key-must-be-at-least-32-chars-long";

    @BeforeEach
    void setUp() {
        user = users.saveAndFlush(AppUser.builder().username("coverage-user").email("coverage@example.test")
                .password(encoder.encode("Test-password-42")).fullName("Test User").role(UserRole.CASHIER).build());
    }

    private String token() {
        return jwt.generateToken(user.getUserId(), user.getUsername(), user.getRole().name());
    }

    @Test
    @DisplayName("หน้า root เปิดได้โดยไม่ต้อง login และ status อ่านได้เมื่อมี JWT")
    void welcomeAndStatus() throws Exception {
        mvc.perform(get("/")).andExpect(status().isOk()).andExpect(jsonPath("$.message").isString());
        mvc.perform(get("/status").header("Authorization", "Bearer " + token()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("OK"));
    }

    @Test
    @DisplayName("login ด้วยรหัสถูกต้องได้ Bearer token และใช้เรียก me ได้โดยไม่มี session")
    void loginAndCurrentUser() throws Exception {
        var result = mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"coverage-user\",\"password\":\"Test-password-42\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.data.expiresIn").value(3600))
                .andExpect(jsonPath("$.data.user.role").value("CASHIER"))
                .andExpect(jsonPath("$.data.user.password").doesNotExist()).andReturn();
        String issuedToken = json.readTree(result.getResponse().getContentAsString()).at("/data/token").asText();
        assertTrue(jwt.isTokenValid(issuedToken));
        assertNull(result.getRequest().getSession(false));
        mvc.perform(get("/api/v1/auth/me").header("Authorization", "Bearer " + issuedToken))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.username").value("coverage-user"))
                .andExpect(jsonPath("$.data.userId").value(user.getUserId()))
                .andExpect(jsonPath("$.data.password").doesNotExist());
        mvc.perform(get("/api/v1/auth/me")).andExpect(status().isUnauthorized());
    }

    @ParameterizedTest(name = "bad credentials: {0}")
    @ValueSource(strings = {
            "{\"username\":\"missing\",\"password\":\"Test-password-42\"}",
            "{\"username\":\"coverage-user\",\"password\":\"wrong\"}"})
    @DisplayName("ชื่อผู้ใช้ไม่มีหรือรหัสผิดต้องได้ 401 และข้อความเดียวกัน")
    void invalidCredentials(String body) throws Exception {
        mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isUnauthorized()).andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"));
    }

    @ParameterizedTest(name = "invalid login fields: {0}")
    @ValueSource(strings = {"{}", "{\"username\":\" \",\"password\":\" \"}",
            "{\"username\":\"coverage-user\"}"})
    @DisplayName("login ที่ขาดข้อมูลหรือช่องว่างต้องได้ 400 พร้อม validationErrors")
    void invalidLoginFields(String body) throws Exception {
        mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.validationErrors").isMap());
    }

    @Test
    @DisplayName("บัญชีปิดใช้งาน login ไม่ได้และ token เดิมเข้า API ไม่ได้")
    void disabledAccount() throws Exception {
        String issued = token();
        user.setIsActive(false);
        users.saveAndFlush(user);
        mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"coverage-user\",\"password\":\"Test-password-42\"}"))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/auth/me").header("Authorization", "Bearer " + issued))
                .andExpect(status().isUnauthorized());
    }

    @ParameterizedTest(name = "protected path: {0}")
    @ValueSource(strings = {"/api/v1/auth/me", "/api/v1/brands", "/api/v1/categories", "/api/v1/customers",
            "/api/v1/products/models", "/api/v1/products/items", "/api/v1/sales"})
    @DisplayName("API ที่ต้อง login ปฏิเสธ request ที่ไม่มี token ด้วย 401")
    void protectedEndpoints(String path) throws Exception {
        mvc.perform(get(path)).andExpect(status().isUnauthorized());
    }

    @ParameterizedTest(name = "Authorization header: {0}")
    @ValueSource(strings = {"Bearer invalid", "Bearer ", "Basic dXNlcjpwYXNz", "bearer invalid"})
    @DisplayName("token ผิดรูปแบบหรือ scheme ไม่ถูกต้องต้องได้ 401")
    void invalidAuthorization(String header) throws Exception {
        mvc.perform(get("/api/v1/auth/me").header("Authorization", header)).andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("token หมดอายุหรือเซ็นด้วยกุญแจอื่นต้องได้ 401")
    void expiredAndForgedTokens() throws Exception {
        String expired = new JwtService(SECRET, -60_000).generateToken(user.getUserId(), user.getUsername(), "CASHIER");
        String forged = new JwtService("another-secret-key-at-least-32-characters-long", 60_000)
                .generateToken(user.getUserId(), user.getUsername(), "CASHIER");
        for (String invalid : new String[]{expired, forged}) {
            mvc.perform(get("/api/v1/auth/me").header("Authorization", "Bearer " + invalid))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Test
    @DisplayName("token ของผู้ใช้ที่ถูกลบต้องได้ 401")
    void deletedUserToken() throws Exception {
        String issued = token();
        users.delete(user);
        users.flush();
        mvc.perform(get("/api/v1/auth/me").header("Authorization", "Bearer " + issued))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("service อ่านผู้ใช้ที่ไม่มีต้องแจ้ง not found")
    void missingCurrentUser() {
        assertThrows(ResourceNotFoundException.class, () -> auth.getCurrentUser("missing"));
    }

    @Test
    @DisplayName("JWT ที่ถูกต้องใช้สร้างและอ่านแบรนด์ผ่าน API และฐานข้อมูลจริงได้")
    void authenticatedBrandApi() throws Exception {
        var created = mvc.perform(post("/api/v1/brands").header("Authorization", "Bearer " + token())
                        .contentType(MediaType.APPLICATION_JSON).content("{\"brandName\":\"IntegrationBrand\"}"))
                .andExpect(status().isCreated()).andReturn();
        long id = json.readTree(created.getResponse().getContentAsString()).at("/data/brandId").asLong();
        mvc.perform(get("/api/v1/brands/" + id).header("Authorization", "Bearer " + token()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.brandName").value("IntegrationBrand"));
    }

    private long createThroughApi(String path, String body, String idField) throws Exception {
        var created = mvc.perform(post(path).header("Authorization", "Bearer " + token())
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated()).andReturn();
        return json.readTree(created.getResponse().getContentAsString()).at("/data/" + idField).asLong();
    }

    private long createModelForItem() throws Exception {
        long brand = createThroughApi("/api/v1/brands", "{\"brandName\":\"ItemBrand\"}", "brandId");
        long category = createThroughApi("/api/v1/categories", "{\"categoryNameTh\":\"ItemCategory\"}", "categoryId");
        return createThroughApi("/api/v1/products/models", "{\"modelName\":\"ConflictPhone\",\"standardPrice\":1070,"
                + "\"isSerialized\":true,\"modelWarrantyDuration\":12,\"brandId\":" + brand
                + ",\"categoryId\":" + category + "}", "modelId");
    }

    @Test
    @DisplayName("HTTP POST รุ่นสินค้าที่ไม่ระบุ isSerialized ต้องใช้ default และตอบ 201")
    void modelApiDefaultsReturn201() throws Exception {
        long brand = createThroughApi("/api/v1/brands", "{\"brandName\":\"DefaultBrand\"}", "brandId");
        long category = createThroughApi("/api/v1/categories", "{\"categoryNameTh\":\"DefaultCategory\"}", "categoryId");
        mvc.perform(post("/api/v1/products/models").header("Authorization", "Bearer " + token())
                        .contentType(MediaType.APPLICATION_JSON).content("{\"modelName\":\"DefaultPhone\",\"standardPrice\":1070,"
                                + "\"brandId\":" + brand + ",\"categoryId\":" + category + "}"))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.data.isSerialized").value(true));
    }

    @Test
    @DisplayName("HTTP POST สินค้ารายชิ้นที่ไม่ระบุ condition ต้องใช้ NEW และตอบ 201")
    void itemApiDefaultsReturn201() throws Exception {
        long model = createModelForItem();
        mvc.perform(post("/api/v1/products/items").header("Authorization", "Bearer " + token())
                        .contentType(MediaType.APPLICATION_JSON).content("{\"modelId\":" + model
                                + ",\"serialNumber\":\"DEFAULT-1\",\"costPrice\":700,\"sellingPrice\":1070}"))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.data.condition").value("NEW"));
    }

    @ParameterizedTest(name = "duplicate resource conflict: {0}")
    @ValueSource(strings = {"brand", "category", "customerPhone", "itemImei", "itemSerial"})
    @DisplayName("HTTP POST ข้อมูลซ้ำที่ขัดแย้งกับข้อมูลเดิมต้องตอบ 409")
    void duplicateResourceReturns409(String scenario) throws Exception {
        String path;
        String body;
        String duplicateBody;
        String idField;
        switch (scenario) {
            case "brand" -> {
                path = "/api/v1/brands"; body = "{\"brandName\":\"ConflictBrand\"}"; idField = "brandId";
                duplicateBody = "{\"brandName\":\"conflictbrand\"}";
            }
            case "category" -> {
                path = "/api/v1/categories"; body = "{\"categoryNameTh\":\"ConflictCategory\"}"; idField = "categoryId";
                duplicateBody = "{\"categoryNameTh\":\"conflictcategory\"}";
            }
            case "customerPhone" -> {
                path = "/api/v1/customers";
                body = "{\"firstName\":\"Test\",\"lastName\":\"Customer\",\"phone\":\"0899999999\"}";
                duplicateBody = body; idField = "customerId";
            }
            case "itemImei", "itemSerial" -> {
                long model = createModelForItem();
                path = "/api/v1/products/items"; idField = "itemId";
                body = "{\"modelId\":" + model + ",\"imei\":\"351234567890123\",\"serialNumber\":\"CONFLICT-1\","
                        + "\"condition\":\"NEW\",\"costPrice\":700,\"sellingPrice\":1070}";
                duplicateBody = scenario.equals("itemImei") ? body.replace("CONFLICT-1", "CONFLICT-2")
                        : body.replace("351234567890123", "351234567890124");
            }
            default -> throw new AssertionError(scenario);
        }
        createThroughApi(path, body, idField);
        mvc.perform(post(path).header("Authorization", "Bearer " + token())
                        .contentType(MediaType.APPLICATION_JSON).content(duplicateBody))
                .andExpect(status().isConflict());
    }
}
