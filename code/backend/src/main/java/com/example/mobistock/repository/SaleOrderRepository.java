package com.example.mobistock.repository;

import com.example.mobistock.domain.entity.SaleOrder;
import com.example.mobistock.domain.enums.SaleStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SaleOrderRepository extends JpaRepository<SaleOrder, Long> {
    Optional<SaleOrder> findBySaleCode(String saleCode);
    Page<SaleOrder> findByStatus(SaleStatus status, Pageable pageable);
}
