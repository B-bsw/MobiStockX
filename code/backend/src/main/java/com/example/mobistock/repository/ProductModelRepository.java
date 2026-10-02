package com.example.mobistock.repository;

import com.example.mobistock.domain.entity.ProductModel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductModelRepository extends JpaRepository<ProductModel, Long> {

    /*
     * StockMapper.toProductModelResponse แตะทั้ง brand และ category
     * → ทุก read path join fetch ไว้ ไม่งั้นเป็น 2 query ต่อ 1 model
     */
    @EntityGraph(attributePaths = {"brand", "category"})
    List<ProductModel> findByBrandBrandId(Long brandId);

    @EntityGraph(attributePaths = {"brand", "category"})
    List<ProductModel> findByCategoryCategoryId(Long categoryId);

    @EntityGraph(attributePaths = {"brand", "category"})
    Page<ProductModel> findByModelNameContainingIgnoreCase(String keyword, Pageable pageable);

    @Override
    @EntityGraph(attributePaths = {"brand", "category"})
    Page<ProductModel> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"brand", "category"})
    Optional<ProductModel> findWithRefsByModelId(Long modelId);
}
