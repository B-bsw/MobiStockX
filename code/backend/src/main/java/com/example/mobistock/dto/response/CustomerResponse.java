package com.example.mobistock.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerResponse {

    private Long customerId;
    private String firstName;
    private String lastName;
    private String phone;
    private String taxNumber;
    private String idCard;
    private String address;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
