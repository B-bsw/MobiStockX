package com.example.mobistock.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class UserResponse {

    private final Integer userId;
    private final String username;
    private final String email;
    private final String role;
    private final LocalDateTime createdAt;
}
