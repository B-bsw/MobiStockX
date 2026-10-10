package com.example.mobistock.service.impl;

import com.example.mobistock.domain.entity.AppUser;
import com.example.mobistock.domain.enums.UserRole;
import com.example.mobistock.dto.request.CreateUserRequest;
import com.example.mobistock.dto.request.UpdateUserRequest;
import com.example.mobistock.dto.response.UserResponse;
import com.example.mobistock.exception.BadRequestException;
import com.example.mobistock.exception.ConflictException;
import com.example.mobistock.exception.ResourceNotFoundException;
import com.example.mobistock.repository.AppUserRepository;
import com.example.mobistock.repository.PaymentRepository;
import com.example.mobistock.repository.SaleOrderRepository;
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
    private final SaleOrderRepository saleOrderRepository;
    private final PaymentRepository paymentRepository;
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

    @Override
    @Transactional
    public UserResponse updateUser(Long userId, UpdateUserRequest request) {
        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        String username = request.getUsername().trim();
        String email = request.getEmail().trim();

        if (!user.getUsername().equalsIgnoreCase(username)
                && appUserRepository.existsByUsernameIgnoreCase(username)) {
            throw new ConflictException("Username '" + username + "' already exists");
        }
        if (!user.getEmail().equalsIgnoreCase(email)
                && appUserRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("Email '" + email + "' already exists");
        }

        boolean active = request.getIsActive() == null || request.getIsActive();
        boolean losesAdmin = user.getRole() == UserRole.ADMIN
                && (request.getRole() != UserRole.ADMIN || !active);

        if (losesAdmin && Boolean.TRUE.equals(user.getIsActive())
                && appUserRepository.countByRoleAndIsActiveTrue(UserRole.ADMIN) <= 1) {
            throw new BadRequestException("Cannot remove the last active administrator");
        }

        user.setUsername(username);
        user.setEmail(email);
        user.setFullName(request.getFullName().trim());
        user.setPhone(request.getPhone() == null || request.getPhone().isBlank()
                ? null
                : request.getPhone().trim());
        user.setRole(request.getRole());
        user.setIsActive(active);

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        return toResponse(appUserRepository.save(user));
    }

    @Override
    @Transactional
    public void deleteUser(Long userId, String currentUsername) {
        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (user.getUsername().equalsIgnoreCase(currentUsername)) {
            throw new BadRequestException("You cannot delete your own account");
        }

        if (user.getRole() == UserRole.ADMIN && Boolean.TRUE.equals(user.getIsActive())
                && appUserRepository.countByRoleAndIsActiveTrue(UserRole.ADMIN) <= 1) {
            throw new BadRequestException("Cannot delete the last active administrator");
        }

        if (saleOrderRepository.existsByCreatedByUserId(userId)
                || paymentRepository.existsByReceivedByUserId(userId)) {
            throw new BadRequestException(
                    "This user has sales history and cannot be deleted. Deactivate the account instead.");
        }

        appUserRepository.delete(user);
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
