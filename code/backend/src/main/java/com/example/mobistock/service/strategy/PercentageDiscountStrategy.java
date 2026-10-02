package com.example.mobistock.service.strategy;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Concrete Strategy: Calculates discount as a percentage of subtotal.
 */
@Component("percentageDiscountStrategy")
public class PercentageDiscountStrategy implements DiscountStrategy {

    private static final BigDecimal HUNDRED = new BigDecimal("100.00");

    @Override
    public BigDecimal calculateDiscount(BigDecimal subtotal, BigDecimal discountValue) {
        if (discountValue == null || discountValue.compareTo(BigDecimal.ZERO) <= 0 || subtotal.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        // Caps percentage at 100%
        BigDecimal percent = discountValue.min(HUNDRED);
        return subtotal.multiply(percent).divide(HUNDRED, 2, RoundingMode.HALF_UP);
    }
}
