package com.example.mobistock.integration;

import static org.junit.jupiter.api.Assertions.*;

import com.example.mobistock.domain.entity.*;
import com.example.mobistock.domain.enums.*;
import com.example.mobistock.dto.request.*;
import com.example.mobistock.exception.BadRequestException;
import com.example.mobistock.exception.ConflictException;
import com.example.mobistock.exception.ResourceNotFoundException;
import com.example.mobistock.repository.*;
import com.example.mobistock.service.SaleService;
import com.example.mobistock.service.WarrantyClaimService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

@SpringBootTest(
  properties = "spring.datasource.url=jdbc:h2:mem:claim-coverage;DB_CLOSE_DELAY=-1"
)
@ActiveProfiles("test")
class WarrantyClaimIntegrationTest {

  private static final String IMEI = "357111222333444";

  @Autowired
  WarrantyClaimService claims;

  @Autowired
  SaleService sales;

  @Autowired
  WarrantyClaimRepository claimRepository;

  @Autowired
  ProductWarrantyRepository warranties;

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
  PlatformTransactionManager transactionManager;

  private TransactionTemplate tx;
  private Long staffId;

  @BeforeEach
  void setUp() {
    tx = new TransactionTemplate(transactionManager);
    tx.executeWithoutResult(status -> {
      var brand = brands.save(Brand.builder().brandName("ClaimBrand").build());
      var category = categories.save(
        Category.builder().categoryNameTh("ClaimCategory").build()
      );
      var model = models.save(
        ProductModel.builder()
          .modelName("ClaimPhone")
          .brand(brand)
          .category(category)
          .standardCost(new BigDecimal("700.00"))
          .standardPrice(new BigDecimal("1070.00"))
          .modelWarrantyDuration(12)
          .stockQuantity(1)
          .build()
      );
      var itemId = items
        .save(
          ProductItem.builder()
            .productModel(model)
            .imei(IMEI)
            .serialNumber("CLAIM-1")
            .condition(ItemCondition.NEW)
            .costPrice(new BigDecimal("700.00"))
            .sellingPrice(new BigDecimal("1070.00"))
            .status(ItemStatus.AVAILABLE)
            .build()
        )
        .getItemId();
      var customerId = customers
        .save(
          Customer.builder()
            .firstName("Claim")
            .lastName("Customer")
            .phone("0898765432")
            .build()
        )
        .getCustomerId();
      staffId = users
        .save(
          AppUser.builder()
            .username("claim-tech")
            .email("tech@example.test")
            .password("unused-hash")
            .fullName("Claim Tech")
            .role(UserRole.TECHNICIAN)
            .build()
        )
        .getUserId();

      // ขายเครื่องเพื่อให้ระบบออกใบรับประกันจริงตาม flow ปกติ
      sales.createSaleOrder(
        CreateSaleOrderRequest.builder()
          .customerId(customerId)
          .cashierUserId(staffId)
          .items(
            List.of(
              SaleItemRequest.builder()
                .modelId(model.getModelId())
                .itemId(itemId)
                .quantity(1)
                .unitPrice(new BigDecimal("1070.00"))
                .build()
            )
          )
          .payment(
            PaymentRequest.builder()
              .paymentMethod(PaymentMethod.CASH)
              .amount(new BigDecimal("1070.00"))
              .build()
          )
          .build()
      );
    });
  }

  @AfterEach
  void cleanUp() {
    tx.executeWithoutResult(status -> {
      claimRepository.deleteAll();
      claimRepository.flush();
      orders.deleteAll();
      orders.flush();
      warranties.deleteAll();
      warranties.flush();
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

  private CreateClaimRequest claimRequest() {
    return new CreateClaimRequest(IMEI, "จอไม่ติด", staffId);
  }

  @Test
  void sellingADeviceIssuesALookupableWarranty() {
    var warranty = claims.getWarrantyByImei(IMEI);

    assertEquals(IMEI, warranty.getItemImei());
    assertEquals("ACTIVE", warranty.getWarrantyStatus());
    assertEquals(
      warranty.getStartDate().plusMonths(12),
      warranty.getExpireDate()
    );
  }

  @Test
  void unknownImeiHasNoWarranty() {
    assertThrows(
      ResourceNotFoundException.class,
      () -> claims.getWarrantyByImei("000000000000000")
    );
  }

  @Test
  void createdClaimStartsOpenAndCarriesDeviceContext() {
    var claim = claims.createClaim(claimRequest());

    assertEquals(ClaimStatus.OPEN, claim.getClaimStatus());
    assertTrue(claim.getClaimCode().startsWith("CLM-"));
    assertEquals(IMEI, claim.getItemImei());
    assertEquals("ClaimPhone", claim.getModelName());
    assertEquals("Claim Customer", claim.getCustomerName());
    assertEquals(LocalDate.now(), claim.getClaimDate());
    assertNull(claim.getClosedDate());
  }

  @Test
  void aSecondOpenClaimOnTheSameDeviceIsRejected() {
    claims.createClaim(claimRequest());

    assertThrows(
      ConflictException.class,
      () -> claims.createClaim(claimRequest())
    );
  }

  @Test
  void expiredWarrantyCannotBeClaimed() {
    tx.executeWithoutResult(status -> {
      var warranty = warranties.findByItemImei(IMEI).orElseThrow();
      warranty.setExpireDate(LocalDate.now().minusDays(1));
      warranties.save(warranty);
    });

    assertThrows(
      BadRequestException.class,
      () -> claims.createClaim(claimRequest())
    );
  }

  @Test
  void repairFlowMovesDeviceToClaimingThenBackToSold() {
    var claim = claims.createClaim(claimRequest());

    var sentForRepair = claims.resolveClaim(
      claim.getClaimId(),
      new ResolveClaimRequest(ClaimStatus.UNDER_REPAIR, "ส่งศูนย์ซ่อม")
    );
    assertEquals(ClaimStatus.UNDER_REPAIR, sentForRepair.getClaimStatus());
    assertNull(sentForRepair.getClosedDate());
    assertEquals(
      ItemStatus.CLAIMING,
      items.findByImei(IMEI).orElseThrow().getStatus()
    );

    var repaired = claims.resolveClaim(
      claim.getClaimId(),
      new ResolveClaimRequest(ClaimStatus.REPAIRED, "เปลี่ยนจอ คืนลูกค้า")
    );
    assertEquals(ClaimStatus.REPAIRED, repaired.getClaimStatus());
    assertEquals(LocalDate.now(), repaired.getClosedDate());
    assertEquals(
      ItemStatus.SOLD,
      items.findByImei(IMEI).orElseThrow().getStatus()
    );
  }

  @Test
  void replacementMarksDeviceDefectiveAndClosesWarranty() {
    var claim = claims.createClaim(claimRequest());
    claims.resolveClaim(
      claim.getClaimId(),
      new ResolveClaimRequest(ClaimStatus.UNDER_REPAIR, null)
    );

    claims.resolveClaim(
      claim.getClaimId(),
      new ResolveClaimRequest(ClaimStatus.REPLACED, "ซ่อมไม่ได้ เปลี่ยนเครื่อง")
    );

    assertEquals(
      ItemStatus.DAMAGED,
      items.findByImei(IMEI).orElseThrow().getStatus()
    );
    assertEquals(
      "CLAIMED",
      warranties.findByItemImei(IMEI).orElseThrow().getWarrantyStatus()
    );
  }

  @Test
  void closedWarrantyBlocksAFurtherClaim() {
    var claim = claims.createClaim(claimRequest());
    claims.resolveClaim(
      claim.getClaimId(),
      new ResolveClaimRequest(ClaimStatus.UNDER_REPAIR, null)
    );
    claims.resolveClaim(
      claim.getClaimId(),
      new ResolveClaimRequest(ClaimStatus.REPLACED, null)
    );

    assertThrows(
      BadRequestException.class,
      () -> claims.createClaim(claimRequest())
    );
  }

  @Test
  void repairedClaimReopensTheDeviceForAnotherClaimLater() {
    var claim = claims.createClaim(claimRequest());
    claims.resolveClaim(
      claim.getClaimId(),
      new ResolveClaimRequest(ClaimStatus.UNDER_REPAIR, null)
    );
    claims.resolveClaim(
      claim.getClaimId(),
      new ResolveClaimRequest(ClaimStatus.REPAIRED, null)
    );

    var second = claims.createClaim(
      new CreateClaimRequest(IMEI, "แบตเสื่อม", staffId)
    );

    assertEquals(ClaimStatus.OPEN, second.getClaimStatus());
    assertNotEquals(claim.getClaimId(), second.getClaimId());
  }

  @Test
  void illegalTransitionsAreRefused() {
    var claim = claims.createClaim(claimRequest());

    // OPEN ข้ามไป REPAIRED ไม่ได้ ต้องผ่าน UNDER_REPAIR ก่อน
    assertThrows(
      BadRequestException.class,
      () ->
        claims.resolveClaim(
          claim.getClaimId(),
          new ResolveClaimRequest(ClaimStatus.REPAIRED, null)
        )
    );

    claims.resolveClaim(
      claim.getClaimId(),
      new ResolveClaimRequest(ClaimStatus.REJECTED, "ตกน้ำ ไม่เข้าเงื่อนไข")
    );

    // REJECTED เป็นสถานะปลายทาง
    assertThrows(
      BadRequestException.class,
      () ->
        claims.resolveClaim(
          claim.getClaimId(),
          new ResolveClaimRequest(ClaimStatus.UNDER_REPAIR, null)
        )
    );
  }

  @Test
  void listFiltersByStatus() {
    var claim = claims.createClaim(claimRequest());
    claims.resolveClaim(
      claim.getClaimId(),
      new ResolveClaimRequest(ClaimStatus.UNDER_REPAIR, null)
    );

    var page = PageRequest.of(0, 20);

    assertEquals(1, claims.getAllClaims(null, page).getTotalElements());
    assertEquals(
      1,
      claims.getAllClaims(ClaimStatus.UNDER_REPAIR, page).getTotalElements()
    );
    assertEquals(
      0,
      claims.getAllClaims(ClaimStatus.OPEN, page).getTotalElements()
    );
  }

  @Test
  void missingClaimIsReported() {
    assertThrows(
      ResourceNotFoundException.class,
      () -> claims.getClaimById(999_999L)
    );
  }
}
