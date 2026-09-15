package com.example.mobistock.repository;

import com.example.mobistock.domain.entity.ProductModel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductModelRepository extends JpaRepository<ProductModel, Long> {
    List<ProductModel> findByBrandBrandId(Long brandId);
    List<ProductModel> findByCategoryCategoryId(Long categoryId);
    Page<ProductModel> findByModelNameContainingIgnoreCase(String keyword, Pageable pageable);
}
