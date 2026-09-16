package com.example.mobistock.dto.response;

import com.example.mobistock.domain.enums.PaymentMethod;
import com.example.mobistock.domain.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {

    private Long paymentId;
    private PaymentMethod paymentMethod;
    private BigDecimal amount;
    private PaymentStatus paymentStatus;
    private String referenceNo;
    private LocalDateTime paymentDate;
    private Long receivedByUserId;
    private String receivedByUserName;
}
