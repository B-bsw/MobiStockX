package com.example.mobistock.integration;

import com.example.mobistock.domain.entity.*;
import com.example.mobistock.domain.enums.ItemStatus;
import com.example.mobistock.dto.request.*;
import com.example.mobistock.exception.*;
import com.example.mobistock.repository.*;
import com.example.mobistock.service.*;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:stock-coverage;DB_CLOSE_DELAY=-1")
@ActiveProfiles("test")
@Transactional
class StockCustomerIntegrationTest {
    @Autowired BrandService brands;
    @Autowired CategoryService categories;
    @Autowired CustomerService customers;
    @Autowired ProductModelService models;
    @Autowired ProductItemService items;
    @Autowired ProductModelRepository modelRepository;
    @Autowired ProductItemRepository itemRepository;
    @Autowired EntityManager em;
    private Long brandId, categoryId, modelId;

    @BeforeEach
    void setUp() {
        brandId = brands.createBrand(CreateBrandRequest.builder().brandName("CoverageBrand").build()).getBrandId();
        categoryId = categories.createCategory(CreateCategoryRequest.builder().categoryNameTh("CoverageCategory").build()).getCategoryId();
        modelId = models.createProductModel(modelRequest()).getModelId();
    }

    private CreateProductModelRequest modelRequest() {
        return CreateProductModelRequest.builder().modelName("CoveragePhone").brandId(brandId).categoryId(categoryId)
                .standardPrice(new BigDecimal("1070.00")).build();
    }

    private CreateProductItemRequest itemRequest(String imei, String serial) {
        return CreateProductItemRequest.builder().modelId(modelId).imei(imei).serialNumber(serial)
                .costPrice(new BigDecimal("700.00")).sellingPrice(new BigDecimal("1070.00")).build();
    }

    private void reload() {
        em.flush();
        em.clear();
    }

    private int stock() {
        return modelRepository.findById(modelId).orElseThrow().getStockQuantity();
    }

    @Test
    @DisplayName("แบรนด์สร้าง อ่าน รายการ แก้ไข และลบได้เมื่อไม่มีสินค้าผูกอยู่")
    void brandCrud() {
        Long id = brands.createBrand(CreateBrandRequest.builder().brandName("SecondBrand").brandCountry("TH").build()).getBrandId();
        reload();
        assertEquals("TH", brands.getBrandById(id).getBrandCountry());
        assertEquals(2, brands.getAllBrands().size());
        brands.updateBrand(id, UpdateBrandRequest.builder().brandName("RenamedBrand").brandCountry("JP").build());
        reload();
        assertEquals("RenamedBrand", brands.getBrandById(id).getBrandName());
        assertEquals("JP", brands.getBrandById(id).getBrandCountry());
        brands.deleteBrand(id);
        reload();
        assertThrows(ResourceNotFoundException.class, () -> brands.getBrandById(id));
    }

    @Test
    @DisplayName("สร้างแบรนด์ชื่อซ้ำต่างตัวพิมพ์ต้องปฏิเสธ")
    void duplicateBrand() {
        assertThrows(ConflictException.class, () -> brands.createBrand(CreateBrandRequest.builder().brandName("coveragebrand").build()));
        assertEquals(1, brands.getAllBrands().size());
    }

    @Test
    @DisplayName("หมวดหมู่สร้าง แก้ไข อ่าน และลบได้ โดย update null ไม่เปลี่ยน isSerialized")
    void categoryCrud() {
        Long id = categories.createCategory(CreateCategoryRequest.builder().categoryNameTh("SecondCategory").isSerialized(false).build()).getCategoryId();
        categories.updateCategory(id, UpdateCategoryRequest.builder().categoryNameTh("RenamedCategory").categoryNameEn("Accessory").build());
        reload();
        var category = categories.getCategoryById(id);
        assertEquals("RenamedCategory", category.getCategoryNameTh());
        assertEquals("Accessory", category.getCategoryNameEn());
        assertFalse(category.getIsSerialized());
        assertEquals(2, categories.getAllCategories().size());
        categories.deleteCategory(id);
        reload();
        assertThrows(ResourceNotFoundException.class, () -> categories.getCategoryById(id));
    }

    @Test
    @DisplayName("หมวดหมู่ชื่อซ้ำต่างตัวพิมพ์ต้องปฏิเสธ")
    void duplicateCategory() {
        assertThrows(ConflictException.class, () -> categories.createCategory(
                CreateCategoryRequest.builder().categoryNameTh("coveragecategory").build()));
    }

    @Test
    @DisplayName("ลูกค้าสร้าง อ่านด้วย ID/โทรศัพท์ แก้ไขและลบได้")
    void customerCrud() {
        Long id = customers.createCustomer(CreateCustomerRequest.builder().firstName("Somchai").lastName("Jaidee")
                .phone("0812345678").build()).getCustomerId();
        reload();
        assertEquals("Somchai", customers.getCustomerById(id).getFirstName());
        assertEquals(id, customers.getCustomerByPhone("0812345678").getCustomerId());
        customers.updateCustomer(id, UpdateCustomerRequest.builder().firstName("Somsri").lastName("New")
                .phone("0899999999").address("Bangkok").taxNumber("123").build());
        reload();
        var updated = customers.getCustomerByPhone("0899999999");
        assertEquals("Somsri", updated.getFirstName());
        assertEquals("Bangkok", updated.getAddress());
        assertEquals("123", updated.getTaxNumber());
        customers.deleteCustomer(id);
        reload();
        assertThrows(ResourceNotFoundException.class, () -> customers.getCustomerById(id));
    }

    @Test
    @DisplayName("สร้างลูกค้าโทรศัพท์ซ้ำต้องปฏิเสธและไม่เพิ่มแถว")
    void duplicatePhone() {
        var request = CreateCustomerRequest.builder().firstName("A").lastName("B").phone("0812345678").build();
        customers.createCustomer(request);
        assertThrows(ConflictException.class, () -> customers.createCustomer(request));
        assertEquals(1, customers.getAllCustomers(PageRequest.of(0, 20)).getTotalElements());
    }

    @Test
    @DisplayName("ค้นหาลูกค้าตามชื่อ นามสกุล โทรศัพท์ แบบไม่สนตัวพิมพ์และรองรับ pagination")
    void customerSearch() {
        customers.createCustomer(CreateCustomerRequest.builder().firstName("Somchai").lastName("Jaidee").phone("0811111111").build());
        customers.createCustomer(CreateCustomerRequest.builder().firstName("Alice").lastName("Smith").phone("0822222222").build());
        reload();
        for (String keyword : new String[]{" SOMCHAI ", "JAIDEE", "11111"}) {
            var found = customers.searchCustomers(keyword, PageRequest.of(0, 10));
            assertEquals(1, found.getTotalElements());
            assertEquals("Somchai", found.getContent().getFirst().getFirstName());
        }
        assertEquals(2, customers.searchCustomers(null, PageRequest.of(0, 1)).getTotalElements());
        assertEquals(1, customers.getAllCustomers(PageRequest.of(0, 1)).getNumberOfElements());
        assertTrue(customers.searchCustomers("not-found", PageRequest.of(0, 10)).isEmpty());
    }

    @Test
    @DisplayName("รุ่นสินค้าต้นทุนไม่ระบุให้ศูนย์ สต็อกเริ่มศูนย์ และค้นหาตามชื่อ/แบรนด์/หมวดหมู่ได้")
    void modelDefaultsAndSearch() {
        reload();
        var model = models.getProductModelById(modelId);
        assertEquals(0, model.getStandardCost().compareTo(BigDecimal.ZERO));
        assertEquals(0, model.getStockQuantity());
        assertEquals(brandId, model.getBrandId());
        assertEquals(categoryId, model.getCategoryId());
        assertEquals(modelId, models.searchProductModels("coveragephone", PageRequest.of(0, 10)).getContent().getFirst().getModelId());
        assertEquals(modelId, models.getModelsByBrand(brandId).getFirst().getModelId());
        assertEquals(modelId, models.getModelsByCategory(categoryId).getFirst().getModelId());
        assertEquals(1, models.getAllProductModels(PageRequest.of(0, 10)).getTotalElements());
        assertTrue(models.searchProductModels("absent", PageRequest.of(0, 10)).isEmpty());
    }

    @Test
    @DisplayName("รุ่นสินค้าแก้ไขรายละเอียดและลบได้เมื่อไม่มีสินค้ารายชิ้น")
    void modelUpdateAndDelete() {
        models.updateProductModel(modelId, UpdateProductModelRequest.builder().modelName("Updated")
                .brandId(brandId).categoryId(categoryId).standardCost(new BigDecimal("500"))
                .standardPrice(new BigDecimal("900")).color("Blue").storageCapacity("256GB")
                .modelWarrantyDuration(24).isSerialized(false).build());
        reload();
        var model = models.getProductModelById(modelId);
        assertEquals("Updated", model.getModelName());
        assertEquals("Blue", model.getColor());
        assertEquals("256GB", model.getStorageCapacity());
        assertEquals(24, model.getModelWarrantyDuration());
        assertFalse(model.getIsSerialized());
        assertEquals(0, new BigDecimal("500").compareTo(model.getStandardCost()));
        assertEquals(0, new BigDecimal("900").compareTo(model.getStandardPrice()));
        models.deleteProductModel(modelId);
        reload();
        assertThrows(ResourceNotFoundException.class, () -> models.getProductModelById(modelId));
    }

    @Test
    @DisplayName("รุ่นสินค้าที่อ้างอิงแบรนด์หรือหมวดหมู่ไม่มีต้องปฏิเสธ")
    void missingModelReferences() {
        var request = modelRequest();
        request.setBrandId(-1L);
        assertThrows(ResourceNotFoundException.class, () -> models.createProductModel(request));
        request.setBrandId(brandId);
        request.setCategoryId(-1L);
        assertThrows(ResourceNotFoundException.class, () -> models.createProductModel(request));
        assertEquals(1, models.getAllProductModels(PageRequest.of(0, 10)).getTotalElements());
    }

    @Test
    @DisplayName("เพิ่มสินค้ารายชิ้นได้ AVAILABLE สต็อกเพิ่มหนึ่ง และอ่านผ่าน ID/IMEI/Serial ได้")
    void receiveAndLookupItem() {
        Long id = items.createProductItem(itemRequest("351234567890123", "SN-001")).getItemId();
        reload();
        assertEquals(1, stock());
        assertEquals(ItemStatus.AVAILABLE, items.getProductItemById(id).getStatus());
        assertEquals(id, items.getProductItemByImei("351234567890123").getItemId());
        assertEquals(id, items.getProductItemBySerialNumber("SN-001").getItemId());
        assertEquals(id, items.getItemsByModelAndStatus(modelId, ItemStatus.AVAILABLE).getFirst().getItemId());
        assertEquals(1, items.getItemsByStatus(ItemStatus.AVAILABLE, PageRequest.of(0, 10)).getTotalElements());
        assertTrue(items.getItemsByModelAndStatus(modelId, ItemStatus.SOLD).isEmpty());
    }

    @Test
    @DisplayName("IMEI หรือ Serial ซ้ำต้องปฏิเสธโดยไม่เพิ่มสต็อก")
    void duplicateItemIdentifiers() {
        items.createProductItem(itemRequest("351234567890123", "SN-001"));
        assertThrows(ConflictException.class, () -> items.createProductItem(itemRequest("351234567890123", "SN-002")));
        assertThrows(ConflictException.class, () -> items.createProductItem(itemRequest("351234567890124", "SN-001")));
        reload();
        assertEquals(1, stock());
        assertEquals(1, itemRepository.count());
    }

    @ParameterizedTest(name = "stock transition AVAILABLE -> {0} -> AVAILABLE")
    @EnumSource(value = ItemStatus.class, names = {"RESERVED", "SOLD", "DAMAGED", "CLAIMING"})
    @DisplayName("เปลี่ยนสถานะออกจาก AVAILABLE ลดสต็อกและเปลี่ยนกลับเพิ่มสต็อก")
    void statusTransitions(ItemStatus status) {
        Long id = items.createProductItem(itemRequest(null, "SN-001")).getItemId();
        items.updateItemStatus(id, UpdateProductItemStatusRequest.builder().status(status).build());
        reload();
        assertEquals(0, stock());
        assertEquals(status, items.getProductItemById(id).getStatus());
        items.updateItemStatus(id, UpdateProductItemStatusRequest.builder().status(ItemStatus.AVAILABLE).build());
        reload();
        assertEquals(1, stock());
        assertEquals(ItemStatus.AVAILABLE, items.getProductItemById(id).getStatus());
    }

    @Test
    @DisplayName("เปลี่ยนสถานะเดิมซ้ำหรือเปลี่ยนระหว่างสถานะที่ไม่พร้อมขายต้องไม่ปรับสต็อกเพิ่ม")
    void unchangedAndUnavailableStatus() {
        Long id = items.createProductItem(itemRequest(null, "SN-001")).getItemId();
        items.updateItemStatus(id, UpdateProductItemStatusRequest.builder().status(ItemStatus.AVAILABLE).build());
        reload();
        assertEquals(1, stock());
        items.updateItemStatus(id, UpdateProductItemStatusRequest.builder().status(ItemStatus.RESERVED).build());
        items.updateItemStatus(id, UpdateProductItemStatusRequest.builder().status(ItemStatus.DAMAGED).build());
        reload();
        assertEquals(0, stock());
    }

    @ParameterizedTest(name = "delete item status: {0}")
    @EnumSource(value = ItemStatus.class, names = {"AVAILABLE", "SOLD"})
    @DisplayName("ลบสินค้ารายชิ้นปรับสต็อกตามสถานะโดยไม่ติดลบ")
    void deleteItem(ItemStatus status) {
        Long id = items.createProductItem(itemRequest(null, "SN-001")).getItemId();
        items.createProductItem(itemRequest(null, "SN-002"));
        items.updateItemStatus(id, UpdateProductItemStatusRequest.builder().status(status).build());
        items.deleteProductItem(id);
        reload();
        assertEquals(1, stock());
        assertFalse(itemRepository.existsById(id));
    }

    @Test
    @DisplayName("ค้นหา แก้ไข และลบ ID ที่ไม่มีต้องแจ้ง not found ทุก service")
    void missingRecords() {
        assertAll(
                () -> assertThrows(ResourceNotFoundException.class, () -> brands.getBrandById(-1L)),
                () -> assertThrows(ResourceNotFoundException.class, () -> brands.updateBrand(-1L, UpdateBrandRequest.builder().build())),
                () -> assertThrows(ResourceNotFoundException.class, () -> brands.deleteBrand(-1L)),
                () -> assertThrows(ResourceNotFoundException.class, () -> categories.getCategoryById(-1L)),
                () -> assertThrows(ResourceNotFoundException.class, () -> categories.updateCategory(-1L, UpdateCategoryRequest.builder().build())),
                () -> assertThrows(ResourceNotFoundException.class, () -> categories.deleteCategory(-1L)),
                () -> assertThrows(ResourceNotFoundException.class, () -> customers.getCustomerById(-1L)),
                () -> assertThrows(ResourceNotFoundException.class, () -> customers.getCustomerByPhone("missing")),
                () -> assertThrows(ResourceNotFoundException.class, () -> customers.updateCustomer(-1L, UpdateCustomerRequest.builder().build())),
                () -> assertThrows(ResourceNotFoundException.class, () -> customers.deleteCustomer(-1L)),
                () -> assertThrows(ResourceNotFoundException.class, () -> models.getProductModelById(-1L)),
                () -> assertThrows(ResourceNotFoundException.class, () -> models.updateProductModel(-1L, UpdateProductModelRequest.builder().build())),
                () -> assertThrows(ResourceNotFoundException.class, () -> models.deleteProductModel(-1L)),
                () -> assertThrows(ResourceNotFoundException.class, () -> items.getProductItemById(-1L)),
                () -> assertThrows(ResourceNotFoundException.class, () -> items.getProductItemByImei("missing")),
                () -> assertThrows(ResourceNotFoundException.class, () -> items.getProductItemBySerialNumber("missing")),
                () -> assertThrows(ResourceNotFoundException.class, () -> items.updateItemStatus(-1L, UpdateProductItemStatusRequest.builder().build())),
                () -> assertThrows(ResourceNotFoundException.class, () -> items.deleteProductItem(-1L)));
    }

    @Test
    @DisplayName("เพิ่มสินค้ารายชิ้นอ้างอิงรุ่นที่ไม่มีต้องไม่สร้างแถวหรือเพิ่มสต็อก")
    void receiveMissingModel() {
        var request = itemRequest(null, "SN-001");
        request.setModelId(-1L);
        assertThrows(ResourceNotFoundException.class, () -> items.createProductItem(request));
        assertEquals(0, itemRepository.count());
        assertEquals(0, stock());
    }
}
