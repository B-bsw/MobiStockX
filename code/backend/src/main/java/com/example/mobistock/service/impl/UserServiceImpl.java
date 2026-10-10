package com.example.mobistock.service.impl;

import com.example.mobistock.domain.entity.AppUser;
import com.example.mobistock.dto.request.CreateUserRequest;
import com.example.mobistock.dto.response.UserResponse;
import com.example.mobistock.exception.ConflictException;
import com.example.mobistock.repository.AppUserRepository;
import com.example.mobistock.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        String username = request.getUsername().trim();
        String email = request.getEmail().trim();

        if (appUserRepository.existsByUsernameIgnoreCase(username)) {
            throw new ConflictException("Username '" + username + "' already exists");
        }
        if (appUserRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("Email '" + email + "' already exists");
        }

        String phone = request.getPhone() == null || request.getPhone().isBlank()
                ? null
                : request.getPhone().trim();

        AppUser user = AppUser.builder()
                .username(username)
                .email(email)
                // Never stored in the clear: the raw password leaves this method hashed.
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName().trim())
                .phone(phone)
                .role(request.getRole())
                .isActive(request.getIsActive() == null || request.getIsActive())
                .build();

        return toResponse(appUserRepository.save(user));
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return appUserRepository.findAll(Sort.by(Sort.Direction.ASC, "userId"))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private UserResponse toResponse(AppUser user) {
        return UserResponse.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .build();
    }
}
