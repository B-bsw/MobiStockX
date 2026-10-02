package com.example.mobistock.service.strategy;

import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Resolver / Context for selecting DiscountStrategy.
 */
@Component
public class DiscountStrategyResolver {

    private final Map<String, DiscountStrategy> strategies;

    public DiscountStrategyResolver(Map<String, DiscountStrategy> strategies) {
        this.strategies = strategies;
    }

    public DiscountStrategy getStrategy(String strategyName) {
        if (strategyName != null && strategies.containsKey(strategyName)) {
            return strategies.get(strategyName);
        }
        return strategies.getOrDefault("fixedDiscountStrategy", (subtotal, val) -> val);
    }
}
