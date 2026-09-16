package com.example.mobistock.dto.request;

import jakarta.validation.constraints.NotBlank;
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
public class TaxInvoiceRequest {

    @NotBlank(message = "Company or buyer name is required for tax invoice")
    private String companyOrBuyerName;

    @NotBlank(message = "Tax ID is required for tax invoice")
    private String taxId;

    @Builder.Default
    private String branchNumber = "00000";

    @NotBlank(message = "Address is required for tax invoice")
    private String address;
}
