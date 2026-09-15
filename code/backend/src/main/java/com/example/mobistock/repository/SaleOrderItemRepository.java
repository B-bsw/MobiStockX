package com.example.mobistock.repository;

import com.example.mobistock.domain.entity.SaleOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SaleOrderItemRepository extends JpaRepository<SaleOrderItem, Long> {
    List<SaleOrderItem> findBySaleOrderSaleId(Long saleId);
}
