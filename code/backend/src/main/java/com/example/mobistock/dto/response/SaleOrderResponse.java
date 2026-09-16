package com.example.mobistock.dto.response;

import com.example.mobistock.domain.enums.SaleStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SaleOrderResponse {

    private Long saleId;
    private String saleCode;
    private LocalDateTime saleDate;
    private Long customerId;
    private String customerName;
    private String customerPhone;
    private Long createdByUserId;
    private String createdByUserName;
    private BigDecimal subtotalAmount;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
    private SaleStatus status;
    private List<SaleOrderItemResponse> items;
    private TaxInvoiceResponse taxInvoice;
    private List<PaymentResponse> payments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
