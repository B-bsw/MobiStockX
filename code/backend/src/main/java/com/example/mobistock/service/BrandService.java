package com.example.mobistock.service;

import com.example.mobistock.dto.request.CreateBrandRequest;
import com.example.mobistock.dto.request.UpdateBrandRequest;
import com.example.mobistock.dto.response.BrandResponse;

import java.util.List;

public interface BrandService {
    BrandResponse createBrand(CreateBrandRequest request);
    BrandResponse updateBrand(Long brandId, UpdateBrandRequest request);
    BrandResponse getBrandById(Long brandId);
    List<BrandResponse> getAllBrands();
    void deleteBrand(Long brandId);
}
