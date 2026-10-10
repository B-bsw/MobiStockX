package com.example.mobistock.service;

import com.example.mobistock.dto.request.CreateUserRequest;
import com.example.mobistock.dto.response.UserResponse;

import java.util.List;

public interface UserService {

    UserResponse createUser(CreateUserRequest request);

    List<UserResponse> getAllUsers();
}
