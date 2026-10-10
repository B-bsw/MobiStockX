package com.example.mobistock.integration;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.example.mobistock.domain.entity.*;
import com.example.mobistock.domain.enums.*;
import com.example.mobistock.dto.request.*;
import com.example.mobistock.exception.*;
import com.example.mobistock.repository.*;
import com.example.mobistock.security.JwtService;
import com.example.mobistock.service.SaleService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

@SpringBootTest(
  properties = "spring.datasource.url=jdbc:h2:mem:sale-coverage;DB_CLOSE_DELAY=-1"
)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SalePersistenceIntegrationTest {

  @Autowired
  SaleService sales;

  @Autowired
  SaleOrderRepository orders;

  @Autowired
  ProductItemRepository items;

  @Autowired
  ProductModelRepository models;

  @Autowired
  BrandRepository brands;

  @Autowired
  CategoryRepository categories;

  @Autowired
  CustomerRepository customers;

  @Autowired
  AppUserRepository users;

  @Autowired
  EntityManager em;

  @Autowired
  PlatformTransactionManager transactionManager;

  @Autowired
  MockMvc mvc;

  @Autowired
  JwtService jwt;

  private final ObjectMapper json = new ObjectMapper().findAndRegisterModules();
  private TransactionTemplate tx;
  private Long customerId, cashierId, modelId, itemId, secondItemId;
  private String token;

  @BeforeEach
  void setUp() {
    tx = new TransactionTemplate(transactionManager);
    tx.executeWithoutResult(status -> {
      var brand = brands.save(Brand.builder().brandName("SaleBrand").build());
      var category = categories.save(
        Category.builder().categoryNameTh("SaleCategory").build()
      );
      var model = models.save(
        ProductModel.builder()
          .modelName("SalePhone")
          .brand(brand)
          .category(category)
          .standardCost(new BigDecimal("700.00"))
          .standardPrice(new BigDecimal("1070.00"))
          .stockQuantity(2)
          .build()
      );
      modelId = model.getModelId();
      itemId = items
        .save(
          ProductItem.builder()
            .productModel(model)
            .imei("351234567890123")
            .serialNumber("SALE-1")
            .condition(ItemCondition.NEW)
            .costPrice(new BigDecimal("700.00"))
            .sellingPrice(new BigDecimal("1070.00"))
            .status(ItemStatus.AVAILABLE)
            .build()
        )
        .getItemId();
      secondItemId = items
        .save(
          ProductItem.builder()
            .productModel(model)
            .imei("351234567890124")
            .serialNumber("SALE-2")
            .condition(ItemCondition.NEW)
            .costPrice(new BigDecimal("700.00"))
            .sellingPrice(new BigDecimal("1070.00"))
            .status(ItemStatus.AVAILABLE)
            .build()
        )
        .getItemId();
      customerId = customers
        .save(
          Customer.builder()
            .firstName("Sale")
            .lastName("Customer")
            .phone("0812345678")
            .build()
        )
        .getCustomerId();
      cashierId = users
        .save(
          AppUser.builder()
            .username("sale-cashier")
            .email("sale@example.test")
            .password("unused-hash")
            .fullName("Sale Cashier")
            .role(UserRole.CASHIER)
            .build()
        )
        .getUserId();
    });
    token = jwt.generateToken(cashierId, "sale-cashier", "CASHIER");
  }

  @AfterEach
  void cleanUp() {
    tx.executeWithoutResult(status -> {
      orders.deleteAll();
      orders.flush();
      items.deleteAll();
      items.flush();
      models.deleteAll();
      models.flush();
      customers.deleteAll();
      users.deleteAll();
      brands.deleteAll();
      categories.deleteAll();
    });
  }

  private CreateSaleOrderRequest request() {
    return CreateSaleOrderRequest.builder()
      .customerId(customerId)
      .cashierUserId(cashierId)
      .items(List.of(line(itemId, 1)))
      .payment(
        PaymentRequest.builder()
          .paymentMethod(PaymentMethod.CASH)
          .amount(new BigDecimal("1070.00"))
          .build()
      )
      .build();
  }

  private SaleItemRequest line(Long id, int quantity) {
    return SaleItemRequest.builder()
      .modelId(modelId)
      .itemId(id)
      .quantity(quantity)
      .unitPrice(new BigDecimal("1070.00"))
      .build();
  }

  private void assertInventoryUnchanged() {
    tx.executeWithoutResult(status -> {
      assertEquals(0, orders.count());
      assertEquals(
        2,
        models.findById(modelId).orElseThrow().getStockQuantity()
      );
      for (Long id : List.of(itemId, secondItemId)) {
        var item = items.findById(id).orElseThrow();
        assertEquals(ItemStatus.AVAILABLE, item.getStatus());
        assertNull(item.getWarrantyExpireDate());
      }
      assertEquals(
        0L,
        em
          .createQuery("select count(p) from Payment p", Long.class)
          .getSingleResult()
      );
      assertEquals(
        0L,
        em
          .createQuery("select count(w) from ProductWarranty w", Long.class)
          .getSingleResult()
      );
      assertEquals(
        0L,
        em
          .createQuery("select count(t) from TaxInvoice t", Long.class)
          .getSingleResult()
      );
    });
  }

  @Test
  @DisplayName(
    "ขายผ่าน JWT API บันทึก order/payment/warranty/tax invoice และลดสต็อกจริงหลัง commit"
  )
  void saleApiCommitsAggregate() throws Exception {
    var request = request();
    request.setRequiresTaxInvoice(true);
    request.setTaxInvoice(
      TaxInvoiceRequest.builder()
        .companyOrBuyerName("Buyer")
        .taxId("1234567890123")
        .address("Bangkok")
        .build()
    );
    var result = mvc
      .perform(
        post("/api/v1/sales")
          .header("Authorization", "Bearer " + token)
          .contentType(MediaType.APPLICATION_JSON)
          .content(json.writeValueAsString(request))
      )
      .andExpect(status().isCreated())
      .andExpect(jsonPath("$.data.totalAmount").value(1070))
      .andExpect(jsonPath("$.data.taxInvoice.vatAmount").value(70))
      .andExpect(
        jsonPath("$.data.items[0].warranty.warrantyStatus").value("ACTIVE")
      )
      .andReturn();
    long id = json
      .readTree(result.getResponse().getContentAsString())
      .at("/data/saleId")
      .asLong();
    tx.executeWithoutResult(status -> {
      var saved = orders.findDetailById(id).orElseThrow();
      assertEquals(SaleStatus.COMPLETED, saved.getStatus());
      assertEquals(1, saved.getItems().size());
      var savedLine = saved.getItems().getFirst();
      assertNotNull(savedLine.getSaleItemId());
      assertNotNull(savedLine.getWarranty().getWarrantyId());
      assertEquals(
        savedLine.getSaleItemId(),
        savedLine.getWarranty().getSaleOrderItem().getSaleItemId()
      );
      assertEquals(
        savedLine.getWarranty().getStartDate().plusMonths(12),
        savedLine.getWarranty().getExpireDate()
      );
      assertEquals(
        savedLine.getWarranty().getExpireDate(),
        savedLine.getWarrantyExpireDate().toLocalDate()
      );
      assertNotNull(saved.getTaxInvoice().getInvoiceId());
      assertEquals(
        0,
        new BigDecimal("1000").compareTo(
          saved.getTaxInvoice().getSubtotalAmount()
        )
      );
      assertEquals(1, saved.getPayments().size());
      assertNotNull(saved.getPayments().getFirst().getPaymentId());
      assertEquals(
        PaymentStatus.COMPLETED,
        saved.getPayments().getFirst().getPaymentStatus()
      );
      assertEquals(
        cashierId,
        saved.getPayments().getFirst().getReceivedBy().getUserId()
      );
      assertEquals(
        1,
        models.findById(modelId).orElseThrow().getStockQuantity()
      );
      assertEquals(
        ItemStatus.SOLD,
        items.findById(itemId).orElseThrow().getStatus()
      );
    });
    var response = sales.getSaleOrderById(id);
    assertEquals(
      id,
      sales.getSaleOrderByCode(response.getSaleCode()).getSaleId()
    );
    assertEquals(
      1,
      sales.getAllSaleOrders(PageRequest.of(0, 10)).getTotalElements()
    );
    assertEquals(
      1,
      sales
        .getSaleOrdersByStatus(SaleStatus.COMPLETED, PageRequest.of(0, 10))
        .getTotalElements()
    );
    assertTrue(
      sales
        .getSaleOrdersByStatus(SaleStatus.PENDING, PageRequest.of(0, 10))
        .isEmpty()
    );
    mvc
      .perform(
        get("/api/v1/sales/" + id).header("Authorization", "Bearer " + token)
      )
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.saleId").value(id));
  }

  @Test
  @DisplayName(
    "ไม่ขอใบกำกับภาษี (optional) ขายได้ปกติและไม่มีระเบียน TaxInvoice"
  )
  void saleWithoutTaxInvoice() {
    var request = request();
    request.setRequiresTaxInvoice(false);

    var response = sales.createSaleOrder(request);

    assertNull(response.getTaxInvoice());
    tx.executeWithoutResult(status ->
      assertEquals(
        0L,
        em
          .createQuery("select count(t) from TaxInvoice t", Long.class)
          .getSingleResult()
      )
    );
  }

  @Test
  @DisplayName("ขอใบกำกับภาษีแต่ไม่ส่งรายละเอียด ต้องได้ 400 และไม่ตัดสต็อก")
  void taxInvoiceRequestedWithoutDetailsIsRejected() throws Exception {
    var request = request();
    request.setRequiresTaxInvoice(true);
    request.setTaxInvoice(null);

    assertThrows(BadRequestException.class, () ->
      sales.createSaleOrder(request)
    );
    assertInventoryUnchanged();

    mvc
      .perform(
        post("/api/v1/sales")
          .header("Authorization", "Bearer " + token)
          .contentType(MediaType.APPLICATION_JSON)
          .content(json.writeValueAsString(request))
      )
      .andExpect(status().isBadRequest());
    assertInventoryUnchanged();
  }

  @ParameterizedTest(name = "ข้อมูลใบกำกับภาษีไม่ครบ: {0}")
  @ValueSource(strings = { "companyOrBuyerName", "taxId", "address" })
  @DisplayName("ฟิลด์บังคับของใบกำกับภาษีว่าง ต้องได้ 400 และไม่บันทึกการขาย")
  void blankTaxInvoiceFieldIsRejected(String blankField) throws Exception {
    var taxInvoice = TaxInvoiceRequest.builder()
      .companyOrBuyerName(
        blankField.equals("companyOrBuyerName") ? " " : "Buyer"
      )
      .taxId(blankField.equals("taxId") ? " " : "1234567890123")
      .address(blankField.equals("address") ? " " : "Bangkok")
      .build();

    var request = request();
    request.setRequiresTaxInvoice(true);
    request.setTaxInvoice(taxInvoice);

    mvc
      .perform(
        post("/api/v1/sales")
          .header("Authorization", "Bearer " + token)
          .contentType(MediaType.APPLICATION_JSON)
          .content(json.writeValueAsString(request))
      )
      .andExpect(status().isBadRequest())
      .andExpect(jsonPath("$.validationErrors").isMap());
    assertInventoryUnchanged();
  }

  @Test
  @DisplayName("ไม่ส่งเลขสาขา ต้อง default เป็น 00000")
  void branchNumberDefaultsWhenOmitted() {
    var request = request();
    request.setRequiresTaxInvoice(true);
    request.setTaxInvoice(
      TaxInvoiceRequest.builder()
        .companyOrBuyerName("Buyer")
        .taxId("1234567890123")
        .branchNumber(null)
        .address("Bangkok")
        .build()
    );

    assertEquals(
      "00000",
      sales.createSaleOrder(request).getTaxInvoice().getBranchNumber()
    );
  }

  @Test
  @DisplayName("ใบกำกับภาษีคิด VAT จากยอดหลังหักส่วนลด ไม่ใช่ยอดก่อนหัก")
  void taxInvoiceUsesDiscountedTotal() {
    var request = request();
    request.setDiscountAmount(new BigDecimal("535.00"));
    request.setPayment(
      PaymentRequest.builder()
        .paymentMethod(PaymentMethod.CASH)
        .amount(new BigDecimal("535.00"))
        .build()
    );
    request.setRequiresTaxInvoice(true);
    request.setTaxInvoice(
      TaxInvoiceRequest.builder()
        .companyOrBuyerName("Buyer")
        .taxId("1234567890123")
        .address("Bangkok")
        .build()
    );

    var invoice = sales.createSaleOrder(request).getTaxInvoice();

    assertEquals(
      0,
      new BigDecimal("535.00").compareTo(invoice.getGrandTotal())
    );
    assertEquals(
      0,
      new BigDecimal("500.00").compareTo(invoice.getSubtotalAmount())
    );
    assertEquals(0, new BigDecimal("35.00").compareTo(invoice.getVatAmount()));
  }

  @Test
  @DisplayName(
    "ขายสินค้าจำนวนรวมที่ไม่ serialized ลดสต็อกตามจำนวนและไม่ออกประกันรายเครื่อง"
  )
  void nonSerializedSale() {
    tx.executeWithoutResult(status ->
      models.findById(modelId).orElseThrow().setIsSerialized(false)
    );
    var request = request();
    request.setItems(List.of(line(null, 2)));
    request.setPayment(
      PaymentRequest.builder()
        .paymentMethod(PaymentMethod.TRANSFER)
        .amount(new BigDecimal("2140"))
        .referenceNo("REF-TEST")
        .build()
    );
    var response = sales.createSaleOrder(request);
    assertEquals(
      0,
      new BigDecimal("2140").compareTo(response.getTotalAmount())
    );
    assertNull(response.getItems().getFirst().getWarranty());
    assertNull(response.getTaxInvoice());
    assertEquals(
      "REF-TEST",
      response.getPayments().getFirst().getReferenceNo()
    );
    assertEquals(
      0,
      new BigDecimal("700").compareTo(
        response.getItems().getFirst().getUnitCost()
      )
    );
    tx.executeWithoutResult(status ->
      assertEquals(0, models.findById(modelId).orElseThrow().getStockQuantity())
    );
  }

  @Test
  @DisplayName(
    "ส่วนลดรายบรรทัดและส่วนลดท้ายบิลหักถูกต้อง พร้อมรับเงินเกินยอดได้"
  )
  void combinedDiscountAndOverpayment() {
    var request = request();
    request.getItems().getFirst().setDiscountAmount(new BigDecimal("70"));
    request.setDiscountAmount(new BigDecimal("100"));
    var response = sales.createSaleOrder(request);
    assertEquals(
      0,
      new BigDecimal("1000").compareTo(response.getSubtotalAmount())
    );
    assertEquals(0, new BigDecimal("900").compareTo(response.getTotalAmount()));
    assertEquals(
      0,
      new BigDecimal("1070").compareTo(
        response.getPayments().getFirst().getAmount()
      )
    );
  }

  @Test
  @DisplayName("ส่วนลดท้ายบิลเกินยอดต้องให้ยอดสุทธิศูนย์และชำระศูนย์ได้")
  void discountCappedAtTotal() {
    var request = request();
    request.setDiscountAmount(new BigDecimal("2000"));
    request.getPayment().setAmount(BigDecimal.ZERO);
    assertEquals(
      0,
      BigDecimal.ZERO.compareTo(sales.createSaleOrder(request).getTotalAmount())
    );
  }

  @ParameterizedTest(name = "invalid sale scenario: {0}")
  @ValueSource(
    strings = {
      "missingCustomer",
      "missingCashier",
      "emptyItems",
      "missingModel",
      "missingItem",
      "insufficientStock",
      "mismatchedModel",
      "insufficientPayment",
      "duplicateItem",
    }
  )
  @DisplayName(
    "ข้อมูลการขายผิดต้องปฏิเสธและ rollback สต็อก สถานะ ประกันและเอกสารทั้งหมด"
  )
  void rejectedSaleRollsBack(String scenario) {
    var request = request();
    Class<? extends RuntimeException> expected = BadRequestException.class;
    switch (scenario) {
      case "missingCustomer" -> {
        request.setCustomerId(-1L);
        expected = ResourceNotFoundException.class;
      }
      case "missingCashier" -> {
        request.setCashierUserId(-1L);
        expected = ResourceNotFoundException.class;
      }
      case "emptyItems" -> request.setItems(List.of());
      case "missingModel" -> {
        request.getItems().getFirst().setModelId(-1L);
        expected = ResourceNotFoundException.class;
      }
      case "missingItem" -> {
        request.getItems().getFirst().setItemId(-1L);
        expected = ResourceNotFoundException.class;
      }
      case "insufficientStock" -> request.setItems(List.of(line(null, 3)));
      case "mismatchedModel" -> {
        Long other = tx.execute(status -> {
          var original = models.findById(modelId).orElseThrow();
          return models
            .save(
              ProductModel.builder()
                .modelName("Other")
                .brand(original.getBrand())
                .category(original.getCategory())
                .standardPrice(BigDecimal.TEN)
                .stockQuantity(1)
                .build()
            )
            .getModelId();
        });
        request.getItems().getFirst().setModelId(other);
      }
      case "insufficientPayment" -> request
        .getPayment()
        .setAmount(new BigDecimal("1"));
      case "duplicateItem" -> request.setItems(
        List.of(line(itemId, 1), line(itemId, 1))
      );
      default -> throw new AssertionError(scenario);
    }
    assertThrows(expected, () -> sales.createSaleOrder(request));
    assertInventoryUnchanged();
  }

  @Test
  @DisplayName("ขายเครื่องที่ SOLD แล้วต้องปฏิเสธและไม่สร้างบิลเพิ่ม")
  void cannotSellTwice() {
    sales.createSaleOrder(request());
    assertThrows(BadRequestException.class, () ->
      sales.createSaleOrder(request())
    );
    assertEquals(1, orders.count());
    tx.executeWithoutResult(status ->
      assertEquals(1, models.findById(modelId).orElseThrow().getStockQuantity())
    );
  }

  @Test
  @DisplayName("รายการแรกสำเร็จแต่รายการถัดไปไม่พบต้อง rollback ทั้งบิล")
  void laterLineFailureRollsBackEarlierLine() {
    var request = request();
    request.setItems(List.of(line(itemId, 1), line(-1L, 1)));
    assertThrows(ResourceNotFoundException.class, () ->
      sales.createSaleOrder(request)
    );
    assertInventoryUnchanged();
  }

  @Test
  @DisplayName("ค้นหาบิลด้วย ID หรือรหัสที่ไม่มีต้องแจ้ง not found")
  void missingSale() {
    assertThrows(ResourceNotFoundException.class, () ->
      sales.getSaleOrderById(-1L)
    );
    assertThrows(ResourceNotFoundException.class, () ->
      sales.getSaleOrderByCode("SO-MISSING")
    );
  }

  @ParameterizedTest(name = "invalid API sale input: {0}")
  @ValueSource(
    strings = {
      "missingPayment",
      "emptyItems",
      "zeroQuantity",
      "negativePrice",
      "negativeDiscount",
    }
  )
  @DisplayName(
    "API validate ข้อมูลซ้อน payment/items และปฏิเสธค่าลบหรือจำนวนศูนย์ด้วย 400"
  )
  void saleApiValidation(String scenario) throws Exception {
    var request = request();
    switch (scenario) {
      case "missingPayment" -> request.setPayment(null);
      case "emptyItems" -> request.setItems(List.of());
      case "zeroQuantity" -> request.getItems().getFirst().setQuantity(0);
      case "negativePrice" -> request
        .getItems()
        .getFirst()
        .setUnitPrice(BigDecimal.ONE.negate());
      case "negativeDiscount" -> request.setDiscountAmount(
        BigDecimal.ONE.negate()
      );
      default -> throw new AssertionError(scenario);
    }
    mvc
      .perform(
        post("/api/v1/sales")
          .header("Authorization", "Bearer " + token)
          .contentType(MediaType.APPLICATION_JSON)
          .content(json.writeValueAsString(request))
      )
      .andExpect(status().isBadRequest())
      .andExpect(jsonPath("$.validationErrors").isMap());
    assertInventoryUnchanged();
  }

  @Test
  @DisplayName(
    "เครื่องเดียวที่ระบุ itemId ต้องไม่ขายด้วย quantity มากกว่าหนึ่ง"
  )
  void serializedItemCannotRepresentMultipleUnits() throws Exception {
    var request = request();
    request.getItems().getFirst().setQuantity(2);
    request.getPayment().setAmount(new BigDecimal("2140"));
    var result = mvc
      .perform(
        post("/api/v1/sales")
          .header("Authorization", "Bearer " + token)
          .contentType(MediaType.APPLICATION_JSON)
          .content(json.writeValueAsString(request))
      )
      .andReturn();
    tx.executeWithoutResult(status ->
      assertAll(
        () ->
          assertEquals(
            400,
            result.getResponse().getStatus(),
            "เครื่องเดียว quantity=2 ต้องถูกปฏิเสธ"
          ),
        () -> assertEquals(0, orders.count(), "ต้องไม่สร้างบิล"),
        () ->
          assertEquals(
            2,
            models.findById(modelId).orElseThrow().getStockQuantity(),
            "สต็อกต้องไม่เปลี่ยน"
          ),
        () ->
          assertEquals(
            ItemStatus.AVAILABLE,
            items.findById(itemId).orElseThrow().getStatus(),
            "เครื่องต้องยังพร้อมขาย"
          ),
        () ->
          assertEquals(
            ItemStatus.AVAILABLE,
            items.findById(secondItemId).orElseThrow().getStatus(),
            "เครื่องที่สองไม่เกี่ยวกับบิลต้องไม่เปลี่ยน"
          )
      )
    );
  }
}
