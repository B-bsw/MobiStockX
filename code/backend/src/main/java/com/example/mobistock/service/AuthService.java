package com.example.mobistock.service;

import com.example.mobistock.dto.request.LoginRequest;
import com.example.mobistock.dto.response.AuthUserResponse;
import com.example.mobistock.dto.response.LoginResponse;

public interface AuthService {

    LoginResponse login(LoginRequest request);

    AuthUserResponse getCurrentUser(String username);
}
