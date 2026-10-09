package com.example.mobistock.service;

import com.example.mobistock.domain.entity.ProductModel;
import com.example.mobistock.dto.request.TaxInvoiceRequest;
import com.example.mobistock.service.factory.ProductWarrantyFactory;
import com.example.mobistock.service.factory.TaxInvoiceFactory;
import com.example.mobistock.service.strategy.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.NullSource;
import org.junit.jupiter.params.provider.ValueSource;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class PricingAndDocumentTest {
    @ParameterizedTest(name = "fixed discount: subtotal={0}, discount={1}, expected={2}")
    @CsvSource({"100,20,20", "100,150,100", "100,0,0", "100,-1,0", "0,20,0", "100,,0"})
    @DisplayName("ส่วนลดจำนวนเงินต้องไม่เกินยอดรวม และค่าลบหรือ null ให้ส่วนลดศูนย์")
    void fixedDiscount(BigDecimal subtotal, BigDecimal discount, BigDecimal expected) {
        assertEquals(0, expected.compareTo(new FixedAmountDiscountStrategy().calculateDiscount(subtotal, discount)));
    }

    @ParameterizedTest(name = "percentage: subtotal={0}, percent={1}, expected={2}")
    @CsvSource({"100,10,10.00", "100,150,100.00", "10.05,10,1.01", "100,0,0", "100,-5,0", "0,50,0", "100,,0"})
    @DisplayName("ส่วนลดเปอร์เซ็นต์จำกัดที่ 100% และปัด HALF_UP สองตำแหน่ง")
    void percentageDiscount(BigDecimal subtotal, BigDecimal discount, BigDecimal expected) {
        assertEquals(0, expected.compareTo(new PercentageDiscountStrategy().calculateDiscount(subtotal, discount)));
    }

    @Test
    @DisplayName("resolver เลือก strategy ตามชื่อ และใช้ fixed เมื่อชื่อไม่พบหรือ null")
    void strategySelection() {
        var fixed = new FixedAmountDiscountStrategy();
        var percentage = new PercentageDiscountStrategy();
        var resolver = new DiscountStrategyResolver(Map.of("fixedDiscountStrategy", fixed, "percentageDiscountStrategy", percentage));
        assertSame(percentage, resolver.getStrategy("percentageDiscountStrategy"));
        assertSame(fixed, resolver.getStrategy("unknown"));
        assertSame(fixed, resolver.getStrategy(null));
    }

    @ParameterizedTest(name = "VAT included: total={0}, preVAT={1}, VAT={2}")
    @CsvSource({"107.00,100.00,7.00", "100.00,93.46,6.54", "0.00,0.00,0.00"})
    @DisplayName("ใบกำกับภาษีแยก VAT 7% จากยอดรวมและเก็บข้อมูลผู้ซื้อ")
    void taxInvoice(BigDecimal total, BigDecimal preVat, BigDecimal vat) {
        var request = TaxInvoiceRequest.builder().companyOrBuyerName("Buyer").taxId("1234567890123")
                .address("Bangkok").branchNumber(null).build();
        var invoice = new TaxInvoiceFactory().createTaxInvoice("INV-TEST", request, total);
        assertEquals(preVat, invoice.getSubtotalAmount());
        assertEquals(vat, invoice.getVatAmount());
        assertEquals(total, invoice.getGrandTotal());
        assertEquals(0, total.compareTo(invoice.getSubtotalAmount().add(invoice.getVatAmount())));
        assertEquals(new BigDecimal("7.00"), invoice.getVatRate());
        assertEquals("00000", invoice.getBranchNumber());
        assertEquals("INV-TEST", invoice.getInvoiceNumber());
        assertEquals("Buyer", invoice.getCompanyOrBuyerName());
        assertEquals(request.getTaxId(), invoice.getTaxId());
        assertEquals("Bangkok", invoice.getAddress());
        assertNotNull(invoice.getIssuedAt());
    }

    @Test
    @DisplayName("ใบกำกับภาษีรักษารหัสสาขาที่ระบุ")
    void explicitBranch() {
        var invoice = new TaxInvoiceFactory().createTaxInvoice("INV", TaxInvoiceRequest.builder()
                .branchNumber("00001").build(), BigDecimal.ZERO);
        assertEquals("00001", invoice.getBranchNumber());
    }

    @ParameterizedTest(name = "warranty duration months: {0}")
    @NullSource
    @ValueSource(ints = {0, 6, 12, 24})
    @DisplayName("ประกันใช้ระยะของรุ่น หรือ 12 เดือนเมื่อไม่ระบุ พร้อมสถานะ ACTIVE")
    void warrantyDuration(Integer months) {
        LocalDate before = LocalDate.now();
        var warranty = new ProductWarrantyFactory().createWarranty("WAR-TEST", "351234567890123",
                ProductModel.builder().modelWarrantyDuration(months).build());
        LocalDate after = LocalDate.now();
        assertFalse(warranty.getStartDate().isBefore(before));
        assertFalse(warranty.getStartDate().isAfter(after));
        assertEquals(warranty.getStartDate().plusMonths(months == null ? 12 : months), warranty.getExpireDate());
        assertEquals("WAR-TEST", warranty.getWarrantyCode());
        assertEquals("351234567890123", warranty.getItemImei());
        assertEquals("ACTIVE", warranty.getWarrantyStatus());
    }
}
