package com.example.mobistock.repository;

import com.example.mobistock.domain.entity.ProductItem;
import com.example.mobistock.domain.enums.ItemStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductItemRepository extends JpaRepository<ProductItem, Long> {

    /*
     * ทุก read path ถูก map ผ่าน StockMapper ซึ่งแตะ productModel.modelName
     * → join fetch ไว้เลย ไม่งั้นเป็น N+1 หนึ่งครั้งต่อ item
     */
    @EntityGraph(attributePaths = "productModel")
    Optional<ProductItem> findByImei(String imei);

    @EntityGraph(attributePaths = "productModel")
    Optional<ProductItem> findBySerialNumber(String serialNumber);

    @EntityGraph(attributePaths = "productModel")
    List<ProductItem> findByProductModelModelIdAndStatus(Long modelId, ItemStatus status);

    @EntityGraph(attributePaths = "productModel")
    Page<ProductItem> findByStatus(ItemStatus status, Pageable pageable);

    @Override
    @EntityGraph(attributePaths = "productModel")
    Page<ProductItem> findAll(Pageable pageable);

    @EntityGraph(attributePaths = "productModel")
    Optional<ProductItem> findWithModelByItemId(Long itemId);

    long countByProductModelModelIdAndStatus(Long modelId, ItemStatus status);

    // ใช้ตอนเช็คซ้ำก่อน insert — ไม่ต้องดึง entity ทั้งก้อนมาแค่เพื่อถามว่ามีไหม
    boolean existsByImei(String imei);

    boolean existsBySerialNumber(String serialNumber);
}
