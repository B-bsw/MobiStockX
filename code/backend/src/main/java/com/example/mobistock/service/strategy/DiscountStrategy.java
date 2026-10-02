package com.example.mobistock.service.strategy;

import java.math.BigDecimal;

/**
 * Strategy Pattern Interface for order discount calculation.
 * Follows Open/Closed Principle (OCP) - new discount types can be added without modifying existing logic.
 */
public interface DiscountStrategy {
    BigDecimal calculateDiscount(BigDecimal subtotal, BigDecimal discountValue);
}
