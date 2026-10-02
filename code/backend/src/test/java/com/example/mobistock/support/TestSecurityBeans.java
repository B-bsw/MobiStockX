package com.example.mobistock.support;

import com.example.mobistock.security.AppUserDetailsService;
import com.example.mobistock.security.JwtService;
import org.mockito.Mockito;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;

@TestConfiguration
public class TestSecurityBeans {

    @Bean
    public JwtService jwtService() {
        return Mockito.mock(JwtService.class);
    }

    @Bean
    public AppUserDetailsService appUserDetailsService() {
        return Mockito.mock(AppUserDetailsService.class);
    }
}
