package com.example.mobistock.support;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

class GenerateSeedHashTest {

    @Test
    void printSeedPasswordHash() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String hash = encoder.encode("Mobistock@123");

        System.out.println("SEED_HASH_START" + hash + "SEED_HASH_END");
        System.out.println("verify=" + encoder.matches("Mobistock@123", hash));
    }
}
