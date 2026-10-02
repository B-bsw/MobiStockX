package com.example.mobistock.service.strategy;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * Concrete Strategy: Deducts a fixed amount from the total.
 */
@Component("fixedDiscountStrategy")
public class FixedAmountDiscountStrategy implements DiscountStrategy {

    @Override
    public BigDecimal calculateDiscount(BigDecimal subtotal, BigDecimal discountValue) {
        if (discountValue == null || discountValue.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        // Discount cannot exceed subtotal
        return discountValue.min(subtotal);
    }
}
