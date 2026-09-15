package com.example.mobistock.dto.response;

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
public class TaxInvoiceResponse {

    private Long invoiceId;
    private String invoiceNumber;
    private String companyOrBuyerName;
    private String taxId;
    private String branchNumber;
    private String address;
    private BigDecimal subtotalAmount;
    private BigDecimal vatRate;
    private BigDecimal vatAmount;
    private BigDecimal grandTotal;
    private LocalDateTime issuedAt;
    private String pdfUrl;
}
