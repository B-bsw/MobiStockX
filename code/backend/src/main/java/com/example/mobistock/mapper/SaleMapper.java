package com.example.mobistock.mapper;

import com.example.mobistock.domain.entity.Payment;
import com.example.mobistock.domain.entity.ProductWarranty;
import com.example.mobistock.domain.entity.SaleOrder;
import com.example.mobistock.domain.entity.SaleOrderItem;
import com.example.mobistock.domain.entity.TaxInvoice;
import com.example.mobistock.dto.response.PaymentResponse;
import com.example.mobistock.dto.response.ProductWarrantyResponse;
import com.example.mobistock.dto.response.SaleOrderItemResponse;
import com.example.mobistock.dto.response.SaleOrderResponse;
import com.example.mobistock.dto.response.TaxInvoiceResponse;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

@Component
public class SaleMapper {

    public SaleOrderResponse toSaleOrderResponse(SaleOrder saleOrder) {
        List<SaleOrderItemResponse> itemResponses = saleOrder.getItems() != null
                ? saleOrder.getItems().stream().map(this::toSaleOrderItemResponse).toList()
                : Collections.emptyList();

        List<PaymentResponse> paymentResponses = saleOrder.getPayments() != null
                ? saleOrder.getPayments().stream().map(this::toPaymentResponse).toList()
                : Collections.emptyList();

        TaxInvoiceResponse taxInvoiceResponse = saleOrder.getTaxInvoice() != null
                ? toTaxInvoiceResponse(saleOrder.getTaxInvoice())
                : null;

        return SaleOrderResponse.builder()
                .saleId(saleOrder.getSaleId())
                .saleCode(saleOrder.getSaleCode())
                .saleDate(saleOrder.getSaleDate())
                .customerId(saleOrder.getCustomer().getCustomerId())
                .customerName(saleOrder.getCustomer().getFirstName() + " " + saleOrder.getCustomer().getLastName())
                .customerPhone(saleOrder.getCustomer().getPhone())
                .createdByUserId(saleOrder.getCreatedBy().getUserId())
                .createdByUserName(saleOrder.getCreatedBy().getFullName())
                .subtotalAmount(saleOrder.getSubtotalAmount())
                .discountAmount(saleOrder.getDiscountAmount())
                .totalAmount(saleOrder.getTotalAmount())
                .status(saleOrder.getStatus())
                .items(itemResponses)
                .taxInvoice(taxInvoiceResponse)
                .payments(paymentResponses)
                .createdAt(saleOrder.getCreatedAt())
                .updatedAt(saleOrder.getUpdatedAt())
                .build();
    }

    public SaleOrderItemResponse toSaleOrderItemResponse(SaleOrderItem item) {
        BigDecimal subtotal = item.getUnitPrice()
                .multiply(BigDecimal.valueOf(item.getQuantity()))
                .subtract(item.getDiscountAmount() != null ? item.getDiscountAmount() : BigDecimal.ZERO);

        ProductWarrantyResponse warrantyResponse = item.getWarranty() != null
                ? toProductWarrantyResponse(item.getWarranty())
                : null;

        return SaleOrderItemResponse.builder()
                .saleItemId(item.getSaleItemId())
                .modelId(item.getProductModel().getModelId())
                .modelName(item.getProductModel().getModelName())
                .itemId(item.getProductItem() != null ? item.getProductItem().getItemId() : null)
                .itemSerialNumber(item.getProductItem() != null ? item.getProductItem().getSerialNumber() : null)
                .itemImei(item.getProductItem() != null ? item.getProductItem().getImei() : null)
                .quantity(item.getQuantity())
                .unitCost(item.getUnitCost())
                .unitPrice(item.getUnitPrice())
                .discountAmount(item.getDiscountAmount())
                .subtotal(subtotal)
                .warrantyExpireDate(item.getWarrantyExpireDate())
                .warranty(warrantyResponse)
                .build();
    }

    public TaxInvoiceResponse toTaxInvoiceResponse(TaxInvoice invoice) {
        return TaxInvoiceResponse.builder()
                .invoiceId(invoice.getInvoiceId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .companyOrBuyerName(invoice.getCompanyOrBuyerName())
                .taxId(invoice.getTaxId())
                .branchNumber(invoice.getBranchNumber())
                .address(invoice.getAddress())
                .subtotalAmount(invoice.getSubtotalAmount())
                .vatRate(invoice.getVatRate())
                .vatAmount(invoice.getVatAmount())
                .grandTotal(invoice.getGrandTotal())
                .issuedAt(invoice.getIssuedAt())
                .pdfUrl(invoice.getPdfUrl())
                .build();
    }

    public ProductWarrantyResponse toProductWarrantyResponse(ProductWarranty warranty) {
        return ProductWarrantyResponse.builder()
                .warrantyId(warranty.getWarrantyId())
                .warrantyCode(warranty.getWarrantyCode())
                .itemImei(warranty.getItemImei())
                .startDate(warranty.getStartDate())
                .expireDate(warranty.getExpireDate())
                .termsConditions(warranty.getTermsConditions())
                .warrantyStatus(warranty.getWarrantyStatus())
                .createdAt(warranty.getCreatedAt())
                .build();
    }

    public PaymentResponse toPaymentResponse(Payment payment) {
        return PaymentResponse.builder()
                .paymentId(payment.getPaymentId())
                .paymentMethod(payment.getPaymentMethod())
                .amount(payment.getAmount())
                .paymentStatus(payment.getPaymentStatus())
                .referenceNo(payment.getReferenceNo())
                .paymentDate(payment.getPaymentDate())
                .receivedByUserId(payment.getReceivedBy().getUserId())
                .receivedByUserName(payment.getReceivedBy().getFullName())
                .build();
    }
}
