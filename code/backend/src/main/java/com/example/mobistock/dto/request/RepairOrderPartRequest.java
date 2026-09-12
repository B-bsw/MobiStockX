package com.example.mobistock.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor
public class RepairOrderPartRequest {
    @NotNull private Integer repairId;
    @NotNull private Integer partId;
    @Positive private Integer quantity;
    @DecimalMin(value = "0.00") private BigDecimal unitPrice;
}
