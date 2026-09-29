package com.example.mobistock.dto.response;

import com.example.mobistock.domain.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthUserResponse {

    private Long userId;
    private String username;
    private String email;
    private String fullName;
    private String phone;
    private UserRole role;
}
