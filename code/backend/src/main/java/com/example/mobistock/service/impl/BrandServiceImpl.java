package com.example.mobistock.service.impl;

import com.example.mobistock.domain.entity.Brand;
import com.example.mobistock.dto.request.CreateBrandRequest;
import com.example.mobistock.dto.request.UpdateBrandRequest;
import com.example.mobistock.dto.response.BrandResponse;
import com.example.mobistock.exception.BadRequestException;
import com.example.mobistock.exception.ResourceNotFoundException;
import com.example.mobistock.mapper.StockMapper;
import com.example.mobistock.repository.BrandRepository;
import com.example.mobistock.service.BrandService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BrandServiceImpl implements BrandService {

    private final BrandRepository brandRepository;
    private final StockMapper stockMapper;

    @Override
    @Transactional
    public BrandResponse createBrand(CreateBrandRequest request) {
        if (brandRepository.findByBrandNameIgnoreCase(request.getBrandName()).isPresent()) {
            throw new BadRequestException("Brand with name '" + request.getBrandName() + "' already exists");
        }
        Brand brand = stockMapper.toBrandEntity(request);
        Brand savedBrand = brandRepository.save(brand);
        return stockMapper.toBrandResponse(savedBrand);
    }

    @Override
    @Transactional
    public BrandResponse updateBrand(Long brandId, UpdateBrandRequest request) {
        Brand brand = brandRepository.findById(brandId)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + brandId));

        brand.setBrandName(request.getBrandName());
        brand.setBrandCountry(request.getBrandCountry());
        brand.setImageUrl(request.getImageUrl());

        Brand updatedBrand = brandRepository.save(brand);
        return stockMapper.toBrandResponse(updatedBrand);
    }

    @Override
    @Transactional(readOnly = true)
    public BrandResponse getBrandById(Long brandId) {
        Brand brand = brandRepository.findById(brandId)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + brandId));
        return stockMapper.toBrandResponse(brand);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BrandResponse> getAllBrands() {
        return brandRepository.findAll().stream()
                .map(stockMapper::toBrandResponse)
                .toList();
    }

    @Override
    @Transactional
    public void deleteBrand(Long brandId) {
        if (!brandRepository.existsById(brandId)) {
            throw new ResourceNotFoundException("Brand not found with id: " + brandId);
        }
        brandRepository.deleteById(brandId);
    }
}
