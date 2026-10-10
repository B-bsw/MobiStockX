package com.example.mobistock.service;

import com.example.mobistock.dto.request.CreateUserRequest;
import com.example.mobistock.dto.request.UpdateUserRequest;
import com.example.mobistock.dto.response.UserResponse;

import java.util.List;

public interface UserService {

    UserResponse createUser(CreateUserRequest request);

    List<UserResponse> getAllUsers();

    UserResponse updateUser(Long userId, UpdateUserRequest request);

    void deleteUser(Long userId, String currentUsername);
}
