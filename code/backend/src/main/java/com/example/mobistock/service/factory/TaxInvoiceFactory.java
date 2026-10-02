package com.example.mobistock.service.factory;

import com.example.mobistock.domain.entity.TaxInvoice;
import com.example.mobistock.dto.request.TaxInvoiceRequest;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

/**
 * Factory Method Pattern for creating TaxInvoice entities.
 * Encapsulates the 7% VAT calculation and document number formatting.
 */
@Component
public class TaxInvoiceFactory {

    private static final BigDecimal VAT_RATE = new BigDecimal("7.00");
    private static final BigDecimal HUNDRED = new BigDecimal("100.00");
    private static final BigDecimal VAT_DIVISOR = new BigDecimal("107.00");

    public TaxInvoice createTaxInvoice(String invoiceNumber, TaxInvoiceRequest request, BigDecimal grandTotal) {
        BigDecimal preVatAmount = grandTotal.multiply(HUNDRED)
                .divide(VAT_DIVISOR, 2, RoundingMode.HALF_UP);
        BigDecimal vatAmount = grandTotal.subtract(preVatAmount);

        return TaxInvoice.builder()
                .invoiceNumber(invoiceNumber)
                .companyOrBuyerName(request.getCompanyOrBuyerName())
                .taxId(request.getTaxId())
                .branchNumber(request.getBranchNumber() != null ? request.getBranchNumber() : "00000")
                .address(request.getAddress())
                .subtotalAmount(preVatAmount)
                .vatRate(VAT_RATE)
                .vatAmount(vatAmount)
                .grandTotal(grandTotal)
                .issuedAt(LocalDateTime.now())
                .build();
    }
}
