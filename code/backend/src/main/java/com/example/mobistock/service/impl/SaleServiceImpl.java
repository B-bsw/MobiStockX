package com.example.mobistock.service.impl;

import com.example.mobistock.domain.entity.AppUser;
import com.example.mobistock.domain.entity.Customer;
import com.example.mobistock.domain.entity.Payment;
import com.example.mobistock.domain.entity.ProductItem;
import com.example.mobistock.domain.entity.ProductModel;
import com.example.mobistock.domain.entity.ProductWarranty;
import com.example.mobistock.domain.entity.SaleOrder;
import com.example.mobistock.domain.entity.SaleOrderItem;
import com.example.mobistock.domain.entity.TaxInvoice;
import com.example.mobistock.domain.enums.ItemStatus;
import com.example.mobistock.domain.enums.PaymentStatus;
import com.example.mobistock.domain.enums.SaleStatus;
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
import com.example.mobistock.service.SaleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SaleServiceImpl implements SaleService {

    private final SaleOrderRepository saleOrderRepository;
    private final CustomerRepository customerRepository;
    private final AppUserRepository appUserRepository;
    private final ProductModelRepository productModelRepository;
    private final ProductItemRepository productItemRepository;
    private final SaleMapper saleMapper;

    @Override
    @Transactional
    public SaleOrderResponse createSaleOrder(CreateSaleOrderRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + request.getCustomerId()));

        AppUser cashier = appUserRepository.findById(request.getCashierUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Cashier user not found with id: " + request.getCashierUserId()));

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BadRequestException("Sale order must contain at least one item");
        }

        BigDecimal subtotal = BigDecimal.ZERO;
        SaleOrder saleOrder = SaleOrder.builder()
                .customer(customer)
                .createdBy(cashier)
                .saleCode(generateSaleCode())
                .saleDate(LocalDateTime.now())
                .status(SaleStatus.COMPLETED)
                .discountAmount(request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO)
                .build();

        for (SaleItemRequest itemRequest : request.getItems()) {
            ProductModel model = productModelRepository.findById(itemRequest.getModelId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product model not found with id: " + itemRequest.getModelId()));

            ProductItem item = null;
            LocalDateTime warrantyExpireDate = null;

            if (itemRequest.getItemId() != null) {
                item = productItemRepository.findById(itemRequest.getItemId())
                        .orElseThrow(() -> new ResourceNotFoundException("Product item not found with id: " + itemRequest.getItemId()));

                if (!item.getProductModel().getModelId().equals(model.getModelId())) {
                    throw new BadRequestException("Product item does not match product model id: " + model.getModelId());
                }

                if (item.getStatus() != ItemStatus.AVAILABLE) {
                    throw new BadRequestException("Product item with IMEI/Serial " + (item.getImei() != null ? item.getImei() : item.getSerialNumber())
                            + " is not available for sale (status: " + item.getStatus() + ")");
                }

                item.setStatus(ItemStatus.SOLD);
                int warrantyMonths = model.getModelWarrantyDuration() != null ? model.getModelWarrantyDuration() : 12;
                warrantyExpireDate = LocalDateTime.now().plusMonths(warrantyMonths);
                item.setWarrantyExpireDate(warrantyExpireDate);
                productItemRepository.save(item);

                model.setStockQuantity(Math.max(0, model.getStockQuantity() - itemRequest.getQuantity()));
                productModelRepository.save(model);
            } else {
                if (model.getStockQuantity() < itemRequest.getQuantity()) {
                    throw new BadRequestException("Insufficient stock quantity for model: " + model.getModelName());
                }
                model.setStockQuantity(model.getStockQuantity() - itemRequest.getQuantity());
                productModelRepository.save(model);
            }

            BigDecimal unitCost = item != null ? item.getCostPrice() : (model.getStandardCost() != null ? model.getStandardCost() : BigDecimal.ZERO);
            BigDecimal itemDiscount = itemRequest.getDiscountAmount() != null ? itemRequest.getDiscountAmount() : BigDecimal.ZERO;
            BigDecimal lineTotal = itemRequest.getUnitPrice()
                    .multiply(BigDecimal.valueOf(itemRequest.getQuantity()))
                    .subtract(itemDiscount);

            subtotal = subtotal.add(lineTotal);

            SaleOrderItem orderItem = SaleOrderItem.builder()
                    .productModel(model)
                    .productItem(item)
                    .quantity(itemRequest.getQuantity())
                    .unitCost(unitCost)
                    .unitPrice(itemRequest.getUnitPrice())
                    .discountAmount(itemDiscount)
                    .warrantyExpireDate(warrantyExpireDate)
                    .build();

            if (item != null) {
                int warrantyMonths = model.getModelWarrantyDuration() != null ? model.getModelWarrantyDuration() : 12;
                ProductWarranty warranty = ProductWarranty.builder()
                        .warrantyCode(generateWarrantyCode())
                        .itemImei(item.getImei())
                        .startDate(LocalDate.now())
                        .expireDate(LocalDate.now().plusMonths(warrantyMonths))
                        .termsConditions("MobiStock warranty covers hardware faults for " + warrantyMonths + " months.")
                        .warrantyStatus("ACTIVE")
                        .build();
                orderItem.setWarranty(warranty);
            }

            saleOrder.addItem(orderItem);
        }

        BigDecimal orderDiscount = request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO;
        BigDecimal grandTotal = subtotal.subtract(orderDiscount);
        if (grandTotal.compareTo(BigDecimal.ZERO) < 0) {
            grandTotal = BigDecimal.ZERO;
        }

        saleOrder.setSubtotalAmount(subtotal);
        saleOrder.setTotalAmount(grandTotal);

        PaymentRequest paymentRequest = request.getPayment();
        if (paymentRequest.getAmount().compareTo(grandTotal) < 0) {
            throw new BadRequestException("Payment amount (" + paymentRequest.getAmount() + ") cannot be less than total amount (" + grandTotal + ")");
        }

        Payment payment = Payment.builder()
                .paymentMethod(paymentRequest.getPaymentMethod())
                .amount(paymentRequest.getAmount())
                .paymentStatus(PaymentStatus.COMPLETED)
                .referenceNo(paymentRequest.getReferenceNo())
                .paymentDate(LocalDateTime.now())
                .receivedBy(cashier)
                .build();
        saleOrder.addPayment(payment);

        if (Boolean.TRUE.equals(request.getRequiresTaxInvoice()) && request.getTaxInvoice() != null) {
            TaxInvoiceRequest invoiceReq = request.getTaxInvoice();
            BigDecimal vatRate = new BigDecimal("7.00");
            BigDecimal preVatAmount = grandTotal.multiply(BigDecimal.valueOf(100))
                    .divide(BigDecimal.valueOf(107), 2, RoundingMode.HALF_UP);
            BigDecimal vatAmount = grandTotal.subtract(preVatAmount);

            TaxInvoice taxInvoice = TaxInvoice.builder()
                    .invoiceNumber(generateInvoiceNumber())
                    .companyOrBuyerName(invoiceReq.getCompanyOrBuyerName())
                    .taxId(invoiceReq.getTaxId())
                    .branchNumber(invoiceReq.getBranchNumber() != null ? invoiceReq.getBranchNumber() : "00000")
                    .address(invoiceReq.getAddress())
                    .subtotalAmount(preVatAmount)
                    .vatRate(vatRate)
                    .vatAmount(vatAmount)
                    .grandTotal(grandTotal)
                    .issuedAt(LocalDateTime.now())
                    .build();
            saleOrder.setTaxInvoice(taxInvoice);
        }

        SaleOrder savedOrder = saleOrderRepository.save(saleOrder);
        return saleMapper.toSaleOrderResponse(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public SaleOrderResponse getSaleOrderById(Long saleId) {
        SaleOrder saleOrder = saleOrderRepository.findById(saleId)
                .orElseThrow(() -> new ResourceNotFoundException("Sale order not found with id: " + saleId));
        return saleMapper.toSaleOrderResponse(saleOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public SaleOrderResponse getSaleOrderByCode(String saleCode) {
        SaleOrder saleOrder = saleOrderRepository.findBySaleCode(saleCode)
                .orElseThrow(() -> new ResourceNotFoundException("Sale order not found with code: " + saleCode));
        return saleMapper.toSaleOrderResponse(saleOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SaleOrderResponse> getAllSaleOrders(Pageable pageable) {
        return saleOrderRepository.findAll(pageable)
                .map(saleMapper::toSaleOrderResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SaleOrderResponse> getSaleOrdersByStatus(SaleStatus status, Pageable pageable) {
        return saleOrderRepository.findByStatus(status, pageable)
                .map(saleMapper::toSaleOrderResponse);
    }

    private String generateSaleCode() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String randomSuffix = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        return "SO-" + timestamp + "-" + randomSuffix;
    }

    private String generateWarrantyCode() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomSuffix = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return "WAR-" + timestamp + "-" + randomSuffix;
    }

    private String generateInvoiceNumber() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomSuffix = UUID.randomUUID().toString().substring(0, 5).toUpperCase();
        return "INV-" + timestamp + "-" + randomSuffix;
    }
}
