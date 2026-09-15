package com.example.mobistock.service;

import com.example.mobistock.domain.entity.AppUser;
import com.example.mobistock.domain.entity.Brand;
import com.example.mobistock.domain.entity.Category;
import com.example.mobistock.domain.entity.Customer;
import com.example.mobistock.domain.entity.ProductItem;
import com.example.mobistock.domain.entity.ProductModel;
import com.example.mobistock.domain.entity.SaleOrder;
import com.example.mobistock.domain.enums.ItemCondition;
import com.example.mobistock.domain.enums.ItemStatus;
import com.example.mobistock.domain.enums.PaymentMethod;
import com.example.mobistock.domain.enums.UserRole;
import com.example.mobistock.dto.request.CreateSaleOrderRequest;
import com.example.mobistock.dto.request.PaymentRequest;
import com.example.mobistock.dto.request.SaleItemRequest;
import com.example.mobistock.dto.request.TaxInvoiceRequest;
import com.example.mobistock.dto.response.SaleOrderResponse;
import com.example.mobistock.exception.BadRequestException;
import com.example.mobistock.exception.ResourceNotFoundException;
import com.example.mobistock.mapper.SaleMapper;
import com.example.mobistock.repository.AppUserRepository;
import com.example.mobistock.repository.CustomerRepository;
import com.example.mobistock.repository.ProductItemRepository;
import com.example.mobistock.repository.ProductModelRepository;
import com.example.mobistock.repository.SaleOrderRepository;
import com.example.mobistock.service.impl.SaleServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SaleServiceImplTest {

    @Mock
    private SaleOrderRepository saleOrderRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private AppUserRepository appUserRepository;

    @Mock
    private ProductModelRepository productModelRepository;

    @Mock
    private ProductItemRepository productItemRepository;

    @Spy
    private SaleMapper saleMapper;

    @InjectMocks
    private SaleServiceImpl saleService;

    private Customer mockCustomer;
    private AppUser mockCashier;
    private ProductModel mockModel;
    private ProductItem mockItem;

    @BeforeEach
    void setUp() {
        mockCustomer = Customer.builder()
                .customerId(1L)
                .firstName("Somchai")
                .lastName("Jaidee")
                .phone("0812345678")
                .build();

        mockCashier = AppUser.builder()
                .userId(1L)
                .username("cashier01")
                .fullName("Staff Cashier")
                .email("cashier@mobistock.com")
                .password("secret")
                .role(UserRole.CASHIER)
                .build();

        Brand brand = Brand.builder().brandId(1L).brandName("Apple").build();
        Category category = Category.builder().categoryId(1L).categoryNameTh("สมาร์ทโฟน").build();

        mockModel = ProductModel.builder()
                .modelId(10L)
                .modelName("iPhone 15 Pro")
                .standardCost(new BigDecimal("30000.00"))
                .standardPrice(new BigDecimal("39900.00"))
                .stockQuantity(5)
                .modelWarrantyDuration(12)
                .brand(brand)
                .category(category)
                .build();

        mockItem = ProductItem.builder()
                .itemId(100L)
                .imei("351234567890123")
                .serialNumber("SN-IP15P-001")
                .costPrice(new BigDecimal("30000.00"))
                .sellingPrice(new BigDecimal("39900.00"))
                .condition(ItemCondition.NEW)
                .status(ItemStatus.AVAILABLE)
                .productModel(mockModel)
                .build();
    }

    @Test
    @DisplayName("Should successfully process sale order for serialized phone with warranty and tax invoice")
    void createSaleOrder_Success() {
        CreateSaleOrderRequest request = CreateSaleOrderRequest.builder()
                .customerId(1L)
                .cashierUserId(1L)
                .discountAmount(new BigDecimal("900.00"))
                .requiresTaxInvoice(true)
                .taxInvoice(TaxInvoiceRequest.builder()
                        .companyOrBuyerName("Somchai Jaidee")
                        .taxId("1234567890123")
                        .address("123 Bangkok")
                        .build())
                .payment(PaymentRequest.builder()
                        .paymentMethod(PaymentMethod.TRANSFER)
                        .amount(new BigDecimal("39000.00"))
                        .referenceNo("REF-TRANS-001")
                        .build())
                .items(List.of(SaleItemRequest.builder()
                        .modelId(10L)
                        .itemId(100L)
                        .quantity(1)
                        .unitPrice(new BigDecimal("39900.00"))
                        .discountAmount(BigDecimal.ZERO)
                        .build()))
                .build();

        when(customerRepository.findById(1L)).thenReturn(Optional.of(mockCustomer));
        when(appUserRepository.findById(1L)).thenReturn(Optional.of(mockCashier));
        when(productModelRepository.findById(10L)).thenReturn(Optional.of(mockModel));
        when(productItemRepository.findById(100L)).thenReturn(Optional.of(mockItem));
        when(saleOrderRepository.save(any(SaleOrder.class))).thenAnswer(invocation -> {
            SaleOrder order = invocation.getArgument(0);
            order.setSaleId(999L);
            return order;
        });

        SaleOrderResponse response = saleService.createSaleOrder(request);

        assertNotNull(response);
        assertEquals(new BigDecimal("39000.00"), response.getTotalAmount());
        assertEquals(mockCustomer.getCustomerId(), response.getCustomerId());
        assertEquals(ItemStatus.SOLD, mockItem.getStatus());
        assertNotNull(mockItem.getWarrantyExpireDate());

        verify(productItemRepository).save(mockItem);
        verify(saleOrderRepository).save(any(SaleOrder.class));
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when customer does not exist")
    void createSaleOrder_ThrowsException_CustomerNotFound() {
        CreateSaleOrderRequest request = CreateSaleOrderRequest.builder()
                .customerId(999L)
                .cashierUserId(1L)
                .build();

        when(customerRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> saleService.createSaleOrder(request));
        verify(saleOrderRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw BadRequestException when product item is not available")
    void createSaleOrder_ThrowsException_ItemNotAvailable() {
        mockItem.setStatus(ItemStatus.SOLD);

        CreateSaleOrderRequest request = CreateSaleOrderRequest.builder()
                .customerId(1L)
                .cashierUserId(1L)
                .payment(PaymentRequest.builder()
                        .paymentMethod(PaymentMethod.CASH)
                        .amount(new BigDecimal("40000.00"))
                        .build())
                .items(List.of(SaleItemRequest.builder()
                        .modelId(10L)
                        .itemId(100L)
                        .quantity(1)
                        .unitPrice(new BigDecimal("39900.00"))
                        .build()))
                .build();

        when(customerRepository.findById(1L)).thenReturn(Optional.of(mockCustomer));
        when(appUserRepository.findById(1L)).thenReturn(Optional.of(mockCashier));
        when(productModelRepository.findById(10L)).thenReturn(Optional.of(mockModel));
        when(productItemRepository.findById(100L)).thenReturn(Optional.of(mockItem));

        assertThrows(BadRequestException.class, () -> saleService.createSaleOrder(request));
        verify(saleOrderRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw BadRequestException when payment amount is less than total amount")
    void createSaleOrder_ThrowsException_PaymentInsufficient() {
        CreateSaleOrderRequest request = CreateSaleOrderRequest.builder()
                .customerId(1L)
                .cashierUserId(1L)
                .discountAmount(BigDecimal.ZERO)
                .payment(PaymentRequest.builder()
                        .paymentMethod(PaymentMethod.CASH)
                        .amount(new BigDecimal("20000.00"))
                        .build())
                .items(List.of(SaleItemRequest.builder()
                        .modelId(10L)
                        .itemId(100L)
                        .quantity(1)
                        .unitPrice(new BigDecimal("39900.00"))
                        .build()))
                .build();

        when(customerRepository.findById(1L)).thenReturn(Optional.of(mockCustomer));
        when(appUserRepository.findById(1L)).thenReturn(Optional.of(mockCashier));
        when(productModelRepository.findById(10L)).thenReturn(Optional.of(mockModel));
        when(productItemRepository.findById(100L)).thenReturn(Optional.of(mockItem));

        assertThrows(BadRequestException.class, () -> saleService.createSaleOrder(request));
        verify(saleOrderRepository, never()).save(any());
    }
}
