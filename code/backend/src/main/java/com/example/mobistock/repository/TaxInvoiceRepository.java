package com.example.mobistock.repository;

import com.example.mobistock.domain.entity.TaxInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TaxInvoiceRepository extends JpaRepository<TaxInvoice, Long> {
    Optional<TaxInvoice> findByInvoiceNumber(String invoiceNumber);
    Optional<TaxInvoice> findBySaleOrderSaleId(Long saleId);
}
