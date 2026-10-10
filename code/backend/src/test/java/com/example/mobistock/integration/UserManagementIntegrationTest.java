package com.example.mobistock.integration;

import com.example.mobistock.domain.entity.AppUser;
import com.example.mobistock.domain.enums.UserRole;
import com.example.mobistock.repository.AppUserRepository;
import com.example.mobistock.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:user-admin;DB_CLOSE_DELAY=-1")
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class UserManagementIntegrationTest {

    @Autowired MockMvc mvc;
    @Autowired AppUserRepository users;
    @Autowired PasswordEncoder encoder;
    @Autowired JwtService jwt;

    private static final String NEW_USER = """
            {"username":"newcashier","email":"newcashier@example.test","password":"Mobistock@123",
            "fullName":"พนักงาน ทดสอบ","phone":"0812345678","role":"CASHIER"}""";

    @BeforeEach
    void seedRoles() {
        for (UserRole role : UserRole.values()) {
            users.saveAndFlush(AppUser.builder()
                    .username(role.name().toLowerCase() + "-actor")
                    .email(role.name().toLowerCase() + "@example.test")
                    .password(encoder.encode("Test-password-42"))
                    .fullName("Actor " + role.name())
                    .role(role)
                    .build());
        }
    }

    private String tokenFor(UserRole role) {
        AppUser actor = users.findByUsername(role.name().toLowerCase() + "-actor").orElseThrow();
        return jwt.generateToken(actor.getUserId(), actor.getUsername(), actor.getRole().name());
    }

    @Test
    @DisplayName("ADMIN เพิ่มผู้ใช้ได้ ตอบ 201 และไม่ส่งรหัสผ่านกลับ")
    void adminCreatesUser() throws Exception {
        mvc.perform(post("/api/v1/users").header("Authorization", "Bearer " + tokenFor(UserRole.ADMIN))
                        .contentType(MediaType.APPLICATION_JSON).content(NEW_USER))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.username").value("newcashier"))
                .andExpect(jsonPath("$.data.role").value("CASHIER"))
                .andExpect(jsonPath("$.data.isActive").value(true))
                .andExpect(jsonPath("$.data.password").doesNotExist());

        AppUser saved = users.findByUsername("newcashier").orElseThrow();
        assertNotEquals("Mobistock@123", saved.getPassword(), "รหัสผ่านต้องถูก hash ก่อนบันทึก");
        assertTrue(encoder.matches("Mobistock@123", saved.getPassword()));
    }

    @Test
    @DisplayName("ADMIN อ่านรายชื่อผู้ใช้ได้ครบทุก role")
    void adminListsUsers() throws Exception {
        mvc.perform(get("/api/v1/users").header("Authorization", "Bearer " + tokenFor(UserRole.ADMIN)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(UserRole.values().length))
                .andExpect(jsonPath("$.data[0].password").doesNotExist());
    }

    @ParameterizedTest(name = "role {0} ต้องถูกปฏิเสธ")
    @EnumSource(value = UserRole.class, names = {"MANAGER", "CASHIER", "TECHNICIAN"})
    @DisplayName("role ที่ไม่ใช่ ADMIN เพิ่มหรืออ่านผู้ใช้ไม่ได้ ต้องได้ 403")
    void nonAdminIsForbidden(UserRole role) throws Exception {
        String token = "Bearer " + tokenFor(role);

        mvc.perform(get("/api/v1/users").header("Authorization", token))
                .andExpect(status().isForbidden());
        mvc.perform(post("/api/v1/users").header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON).content(NEW_USER))
                .andExpect(status().isForbidden());

        assertTrue(users.findByUsername("newcashier").isEmpty(), "ต้องไม่มีผู้ใช้ใหม่ถูกสร้าง");
    }

    @Test
    @DisplayName("เรียก /api/v1/users โดยไม่มี token ต้องได้ 401")
    void anonymousIsUnauthorized() throws Exception {
        mvc.perform(get("/api/v1/users")).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/v1/users").contentType(MediaType.APPLICATION_JSON).content(NEW_USER))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("ชื่อผู้ใช้หรืออีเมลซ้ำ (ไม่สนตัวพิมพ์) ต้องได้ 409")
    void duplicateUserReturns409() throws Exception {
        String token = "Bearer " + tokenFor(UserRole.ADMIN);

        mvc.perform(post("/api/v1/users").header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON).content(NEW_USER))
                .andExpect(status().isCreated());

        mvc.perform(post("/api/v1/users").header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(NEW_USER.replace("newcashier@", "other@").replace("newcashier", "NEWCASHIER")))
                .andExpect(status().isConflict());

        mvc.perform(post("/api/v1/users").header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(NEW_USER.replace("\"username\":\"newcashier\"", "\"username\":\"other\"")
                                .replace("newcashier@example.test", "NEWCASHIER@EXAMPLE.TEST")))
                .andExpect(status().isConflict());
    }

    @ParameterizedTest(name = "invalid body: {0}")
    @org.junit.jupiter.params.provider.ValueSource(strings = {
            "{}",
            "{\"username\":\"ab\",\"email\":\"a@b.co\",\"password\":\"Mobistock@123\",\"fullName\":\"X\",\"role\":\"CASHIER\"}",
            "{\"username\":\"okname\",\"email\":\"not-an-email\",\"password\":\"Mobistock@123\",\"fullName\":\"X\",\"role\":\"CASHIER\"}",
            "{\"username\":\"okname\",\"email\":\"a@b.co\",\"password\":\"short\",\"fullName\":\"X\",\"role\":\"CASHIER\"}",
            "{\"username\":\"okname\",\"email\":\"a@b.co\",\"password\":\"Mobistock@123\",\"fullName\":\" \",\"role\":\"CASHIER\"}"})
    @DisplayName("ข้อมูลไม่ครบหรือผิดรูปแบบต้องได้ 400 พร้อม validationErrors")
    void invalidPayloadReturns400(String body) throws Exception {
        mvc.perform(post("/api/v1/users").header("Authorization", "Bearer " + tokenFor(UserRole.ADMIN))
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors").isMap());
    }

    @Test
    @DisplayName("role ที่ไม่มีในระบบต้องได้ 400 ไม่ใช่ 500")
    void unknownRoleReturns400() throws Exception {
        mvc.perform(post("/api/v1/users").header("Authorization", "Bearer " + tokenFor(UserRole.ADMIN))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(NEW_USER.replace("\"CASHIER\"", "\"SUPERUSER\"")))
                .andExpect(status().isBadRequest());
    }
}
