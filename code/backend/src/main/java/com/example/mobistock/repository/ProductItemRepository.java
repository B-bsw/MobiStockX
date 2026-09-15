package com.example.mobistock.repository;

import com.example.mobistock.domain.entity.ProductItem;
import com.example.mobistock.domain.enums.ItemStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductItemRepository extends JpaRepository<ProductItem, Long> {
    Optional<ProductItem> findByImei(String imei);
    Optional<ProductItem> findBySerialNumber(String serialNumber);
    List<ProductItem> findByProductModelModelIdAndStatus(Long modelId, ItemStatus status);
    Page<ProductItem> findByStatus(ItemStatus status, Pageable pageable);
    long countByProductModelModelIdAndStatus(Long modelId, ItemStatus status);
}
