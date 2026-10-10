package com.example.mobistock.mapper;

import com.example.mobistock.domain.entity.Customer;
import com.example.mobistock.domain.entity.ProductWarranty;
import com.example.mobistock.domain.entity.SaleOrderItem;
import com.example.mobistock.domain.entity.WarrantyClaim;
import com.example.mobistock.dto.response.WarrantyClaimResponse;
import org.springframework.stereotype.Component;

@Component
public class WarrantyClaimMapper {

    public WarrantyClaimResponse toWarrantyClaimResponse(WarrantyClaim claim) {
        ProductWarranty warranty = claim.getWarranty();
        SaleOrderItem saleItem = warranty.getSaleOrderItem();

        return WarrantyClaimResponse.builder()
                .claimId(claim.getClaimId())
                .claimCode(claim.getClaimCode())
                .warrantyId(warranty.getWarrantyId())
                .warrantyCode(warranty.getWarrantyCode())
                .itemImei(warranty.getItemImei())
                .modelName(saleItem.getProductModel() != null ? saleItem.getProductModel().getModelName() : null)
                .customerName(resolveCustomerName(saleItem))
                .warrantyExpireDate(warranty.getExpireDate())
                .claimDate(claim.getClaimDate())
                .symptom(claim.getSymptom())
                .resolution(claim.getResolution())
                .claimStatus(claim.getClaimStatus())
                .closedDate(claim.getClosedDate())
                .createdByName(claim.getCreatedBy() != null ? claim.getCreatedBy().getFullName() : null)
                .createdAt(claim.getCreatedAt())
                .build();
    }

    private String resolveCustomerName(SaleOrderItem saleItem) {
        if (saleItem.getSaleOrder() == null || saleItem.getSaleOrder().getCustomer() == null) {
            return null;
        }
        Customer customer = saleItem.getSaleOrder().getCustomer();
        return customer.getFirstName() + " " + customer.getLastName();
    }
}
