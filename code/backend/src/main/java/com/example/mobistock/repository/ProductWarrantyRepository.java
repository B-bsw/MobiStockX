package com.example.mobistock.repository;

import com.example.mobistock.domain.entity.ProductWarranty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductWarrantyRepository extends JpaRepository<ProductWarranty, Long> {
    Optional<ProductWarranty> findByWarrantyCode(String warrantyCode);
    Optional<ProductWarranty> findByItemImei(String itemImei);
}
