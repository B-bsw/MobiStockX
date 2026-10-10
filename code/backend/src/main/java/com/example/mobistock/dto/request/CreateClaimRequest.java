package com.example.mobistock.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateClaimRequest {

    @NotBlank(message = "IMEI is required")
    @Size(min = 15, max = 15, message = "IMEI must be exactly 15 digits")
    private String imei;

    @NotBlank(message = "Symptom is required")
    @Size(max = 1000, message = "Symptom must not exceed 1000 characters")
    private String symptom;

    @NotNull(message = "Staff user id is required")
    private Long createdByUserId;
}
