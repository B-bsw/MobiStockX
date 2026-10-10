package com.example.mobistock.repository;

import com.example.mobistock.domain.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    boolean existsByReceivedByUserId(Long userId);
    List<Payment> findBySaleOrderSaleId(Long saleId);
}
