package com.example.mobistock.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {
    private static final String SECRET = "test-only-secret-key-must-be-at-least-32-chars-long";
    private final JwtService service = new JwtService(SECRET, 3_600_000);

    @Test
    @DisplayName("JWT ที่ออกใหม่ตรวจลายเซ็นและอ่าน username, userId, role ได้")
    void tokenRoundTrip() {
        String token = service.generateToken(42L, "cashier", "CASHIER");
        assertTrue(service.isTokenValid(token));
        assertEquals("cashier", service.extractUsername(token));
        var claims = Jwts.parser().verifyWith(Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8)))
                .build().parseSignedClaims(token).getPayload();
        assertEquals(42L, ((Number) claims.get("userId")).longValue());
        assertEquals("CASHIER", claims.get("role"));
        assertEquals(3_600_000, claims.getExpiration().getTime() - claims.getIssuedAt().getTime());
        assertEquals(3600, service.getExpirationSeconds());
    }

    @ParameterizedTest(name = "JWT invalid input [{index}]: {0}")
    @NullAndEmptySource
    @ValueSource(strings = {" ", "not-a-jwt", "a.b.c"})
    @DisplayName("JWT ว่างหรือผิดรูปแบบต้องไม่ผ่านการตรวจสอบ")
    void invalidToken(String token) {
        assertFalse(service.isTokenValid(token));
    }

    @Test
    @DisplayName("JWT หมดอายุต้องไม่ผ่าน โดยไม่ใช้ sleep")
    void expiredToken() {
        String token = new JwtService(SECRET, -60_000).generateToken(1L, "user", "ADMIN");
        assertFalse(service.isTokenValid(token));
    }

    @Test
    @DisplayName("JWT ที่ลงนามด้วยกุญแจอื่นต้องไม่ผ่าน")
    void wrongSigningKey() {
        String token = new JwtService("another-secret-key-at-least-32-characters-long", 60_000)
                .generateToken(1L, "user", "ADMIN");
        assertFalse(service.isTokenValid(token));
    }

    @Test
    @DisplayName("JWT ไม่มี expiration ต้องไม่ผ่าน")
    void missingExpiration() {
        String token = Jwts.builder().subject("user").issuedAt(new Date())
                .signWith(Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8))).compact();
        assertFalse(service.isTokenValid(token));
    }
}
