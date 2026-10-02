package com.example.mobistock.service.factory;

import com.example.mobistock.domain.entity.ProductModel;
import com.example.mobistock.domain.entity.ProductWarranty;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/**
 * Factory for creating ProductWarranty entities with model-specific duration.
 */
@Component
public class ProductWarrantyFactory {

    public ProductWarranty createWarranty(String warrantyCode, String imei, ProductModel model) {
        int warrantyMonths = model.getModelWarrantyDuration() != null ? model.getModelWarrantyDuration() : 12;
        LocalDate startDate = LocalDate.now();
        LocalDate expireDate = startDate.plusMonths(warrantyMonths);

        return ProductWarranty.builder()
                .warrantyCode(warrantyCode)
                .itemImei(imei)
                .startDate(startDate)
                .expireDate(expireDate)
                .termsConditions("MobiStock warranty covers hardware faults for " + warrantyMonths + " months.")
                .warrantyStatus("ACTIVE")
                .build();
    }
}
