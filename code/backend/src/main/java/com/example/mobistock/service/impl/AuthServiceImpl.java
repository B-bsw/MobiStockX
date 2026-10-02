package com.example.mobistock.service.impl;

import com.example.mobistock.domain.entity.AppUser;
import com.example.mobistock.dto.request.LoginRequest;
import com.example.mobistock.dto.response.AuthUserResponse;
import com.example.mobistock.dto.response.LoginResponse;
import com.example.mobistock.exception.ResourceNotFoundException;
import com.example.mobistock.repository.AppUserRepository;
import com.example.mobistock.security.JwtService;
import com.example.mobistock.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        AppUser user = appUserRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid username or password");
        }

        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new DisabledException("This account has been disabled");
        }

        String token = jwtService.generateToken(
                user.getUserId(), user.getUsername(), user.getRole().name());

        return LoginResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(jwtService.getExpirationSeconds())
                .user(toAuthUserResponse(user))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AuthUserResponse getCurrentUser(String username) {
        AppUser user = appUserRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        return toAuthUserResponse(user);
    }

    private AuthUserResponse toAuthUserResponse(AppUser user) {
        return AuthUserResponse.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole())
                .build();
    }
}
