package com.example.mobistock.config;

import com.example.mobistock.domain.entity.AppUser;
import com.example.mobistock.domain.entity.Brand;
import com.example.mobistock.domain.entity.Category;
import com.example.mobistock.domain.entity.Customer;
import com.example.mobistock.domain.entity.Payment;
import com.example.mobistock.domain.entity.ProductItem;
import com.example.mobistock.domain.entity.ProductModel;
import com.example.mobistock.domain.entity.ProductWarranty;
import com.example.mobistock.domain.entity.SaleOrder;
import com.example.mobistock.domain.entity.SaleOrderItem;
import com.example.mobistock.domain.entity.TaxInvoice;
import com.example.mobistock.domain.enums.ItemCondition;
import com.example.mobistock.domain.enums.ItemStatus;
import com.example.mobistock.domain.enums.PaymentMethod;
import com.example.mobistock.domain.enums.PaymentStatus;
import com.example.mobistock.domain.enums.SaleStatus;
import com.example.mobistock.domain.enums.UserRole;
import com.example.mobistock.repository.AppUserRepository;
import com.example.mobistock.repository.BrandRepository;
import com.example.mobistock.repository.CategoryRepository;
import com.example.mobistock.repository.CustomerRepository;
import com.example.mobistock.repository.ProductItemRepository;
import com.example.mobistock.repository.ProductModelRepository;
import com.example.mobistock.repository.SaleOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
@Profile("!test")
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final ProductModelRepository productModelRepository;
    private final ProductItemRepository productItemRepository;
    private final CustomerRepository customerRepository;
    private final AppUserRepository appUserRepository;
    private final SaleOrderRepository saleOrderRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (brandRepository.count() > 0) {
            return;
        }

        List<AppUser> users = seedAppUsers();
        AppUser cashier = users.get(2);

        List<Brand> brands = seedBrands();
        Brand apple = brands.get(0);
        Brand samsung = brands.get(1);
        Brand xiaomi = brands.get(2);
        Brand oppo = brands.get(3);
        Brand vivo = brands.get(4);

        List<Category> categories = seedCategories();
        Category smartphone = categories.get(0);
        Category tablet = categories.get(1);
        Category smartwatch = categories.get(2);
        Category accessories = categories.get(3);

        List<ProductModel> models = seedProductModels(apple, samsung, xiaomi, oppo, vivo, smartphone, tablet, smartwatch, accessories);
        ProductModel iphone16Pro = models.get(0);
        ProductModel iphone15 = models.get(2);
        ProductModel galaxyA55 = models.get(6);

        List<ProductItem> items = seedProductItems(models);
        ProductItem soldIphone16Pro = items.get(0);
        ProductItem soldGalaxyA55 = items.get(9);
        ProductItem soldSecondHandIphone15 = items.get(5);

        List<Customer> customers = seedCustomers();
        Customer somchai = customers.get(0);
        Customer kanda = customers.get(1);
        Customer teerapat = customers.get(2);

        seedSaleOrders(cashier, somchai, kanda, teerapat, iphone16Pro, soldIphone16Pro, galaxyA55, soldGalaxyA55, iphone15, soldSecondHandIphone15);
    }

    private List<AppUser> seedAppUsers() {
        AppUser admin = AppUser.builder()
                .username("admin")
                .email("admin@mobistockx.co.th")
                .password("$2a$10$7EqJtq98hPqEX7fNZaFWoOhiM9F4bM6Qk8u2zZ7v7l7FzFpZ4eX6e")
                .fullName("ผู้ดูแลระบบ สูงสุด")
                .phone("0819998888")
                .role(UserRole.ADMIN)
                .isActive(true)
                .build();

        AppUser manager = AppUser.builder()
                .username("somchai.m")
                .email("somchai.m@mobistockx.co.th")
                .password("$2a$10$7EqJtq98hPqEX7fNZaFWoOhiM9F4bM6Qk8u2zZ7v7l7FzFpZ4eX6e")
                .fullName("สมชาย มีทรัพย์")
                .phone("0891234567")
                .role(UserRole.MANAGER)
                .isActive(true)
                .build();

        AppUser cashier = AppUser.builder()
                .username("kanda.c")
                .email("kanda.c@mobistockx.co.th")
                .password("$2a$10$7EqJtq98hPqEX7fNZaFWoOhiM9F4bM6Qk8u2zZ7v7l7FzFpZ4eX6e")
                .fullName("กานดา ใจซื่อ")
                .phone("0865554321")
                .role(UserRole.CASHIER)
                .isActive(true)
                .build();

        AppUser technician = AppUser.builder()
                .username("teerapat.t")
                .email("teerapat.t@mobistockx.co.th")
                .password("$2a$10$7EqJtq98hPqEX7fNZaFWoOhiM9F4bM6Qk8u2zZ7v7l7FzFpZ4eX6e")
                .fullName("ธีรภัทร ช่างทอง")
                .phone("0958887777")
                .role(UserRole.TECHNICIAN)
                .isActive(true)
                .build();

        return appUserRepository.saveAll(List.of(admin, manager, cashier, technician));
    }

    private List<Brand> seedBrands() {
        Brand apple = Brand.builder()
                .brandName("Apple")
                .brandCountry("สหรัฐอเมริกา")
                .imageUrl("https://cdn.mobistockx.co.th/brands/apple.png")
                .build();

        Brand samsung = Brand.builder()
                .brandName("Samsung")
                .brandCountry("เกาหลีใต้")
                .imageUrl("https://cdn.mobistockx.co.th/brands/samsung.png")
                .build();

        Brand xiaomi = Brand.builder()
                .brandName("Xiaomi")
                .brandCountry("จีน")
                .imageUrl("https://cdn.mobistockx.co.th/brands/xiaomi.png")
                .build();

        Brand oppo = Brand.builder()
                .brandName("OPPO")
                .brandCountry("จีน")
                .imageUrl("https://cdn.mobistockx.co.th/brands/oppo.png")
                .build();

        Brand vivo = Brand.builder()
                .brandName("vivo")
                .brandCountry("จีน")
                .imageUrl("https://cdn.mobistockx.co.th/brands/vivo.png")
                .build();

        return brandRepository.saveAll(List.of(apple, samsung, xiaomi, oppo, vivo));
    }

    private List<Category> seedCategories() {
        Category smartphone = Category.builder()
                .categoryNameTh("สมาร์ทโฟน")
                .categoryNameEn("Smartphone")
                .isSerialized(true)
                .build();

        Category tablet = Category.builder()
                .categoryNameTh("แท็บเล็ต")
                .categoryNameEn("Tablet")
                .isSerialized(true)
                .build();

        Category smartwatch = Category.builder()
                .categoryNameTh("สมาร์ทวอทช์")
                .categoryNameEn("Smartwatch")
                .isSerialized(true)
                .build();

        Category accessories = Category.builder()
                .categoryNameTh("อุปกรณ์เสริม")
                .categoryNameEn("Accessories")
                .isSerialized(false)
                .build();

        return categoryRepository.saveAll(List.of(smartphone, tablet, smartwatch, accessories));
    }

    private List<ProductModel> seedProductModels(
            Brand apple, Brand samsung, Brand xiaomi, Brand oppo, Brand vivo,
            Category smartphone, Category tablet, Category smartwatch, Category accessories) {

        ProductModel m1 = ProductModel.builder()
                .modelName("iPhone 16 Pro")
                .color("Natural Titanium")
                .storageCapacity("256GB")
                .modelWarrantyDuration(12)
                .isSerialized(true)
                .stockQuantity(4)
                .standardCost(new BigDecimal("37500.00"))
                .standardPrice(new BigDecimal("43900.00"))
                .imageUrl("https://cdn.mobistockx.co.th/models/iphone16pro-natural.png")
                .brand(apple)
                .category(smartphone)
                .build();

        ProductModel m2 = ProductModel.builder()
                .modelName("iPhone 16")
                .color("Black")
                .storageCapacity("128GB")
                .modelWarrantyDuration(12)
                .isSerialized(true)
                .stockQuantity(6)
                .standardCost(new BigDecimal("25000.00"))
                .standardPrice(new BigDecimal("29900.00"))
                .imageUrl("https://cdn.mobistockx.co.th/models/iphone16-black.png")
                .brand(apple)
                .category(smartphone)
                .build();

        ProductModel m3 = ProductModel.builder()
                .modelName("iPhone 15")
                .color("Blue")
                .storageCapacity("128GB")
                .modelWarrantyDuration(12)
                .isSerialized(true)
                .stockQuantity(3)
                .standardCost(new BigDecimal("20500.00"))
                .standardPrice(new BigDecimal("24900.00"))
                .imageUrl("https://cdn.mobistockx.co.th/models/iphone15-blue.png")
                .brand(apple)
                .category(smartphone)
                .build();

        ProductModel m4 = ProductModel.builder()
                .modelName("iPad Air 11 นิ้ว (M2)")
                .color("Starlight")
                .storageCapacity("128GB")
                .modelWarrantyDuration(12)
                .isSerialized(true)
                .stockQuantity(5)
                .standardCost(new BigDecimal("18200.00"))
                .standardPrice(new BigDecimal("21900.00"))
                .imageUrl("https://cdn.mobistockx.co.th/models/ipad-air-m2-starlight.png")
                .brand(apple)
                .category(tablet)
                .build();

        ProductModel m5 = ProductModel.builder()
                .modelName("Apple Watch Series 10 46mm")
                .color("Jet Black")
                .storageCapacity("64GB")
                .modelWarrantyDuration(12)
                .isSerialized(true)
                .stockQuantity(4)
                .standardCost(new BigDecimal("13200.00"))
                .standardPrice(new BigDecimal("15900.00"))
                .imageUrl("https://cdn.mobistockx.co.th/models/apple-watch-s10.png")
                .brand(apple)
                .category(smartwatch)
                .build();

        ProductModel m6 = ProductModel.builder()
                .modelName("Samsung Galaxy S24 Ultra")
                .color("Titanium Gray")
                .storageCapacity("512GB")
                .modelWarrantyDuration(12)
                .isSerialized(true)
                .stockQuantity(3)
                .standardCost(new BigDecimal("39500.00"))
                .standardPrice(new BigDecimal("46900.00"))
                .imageUrl("https://cdn.mobistockx.co.th/models/galaxy-s24-ultra.png")
                .brand(samsung)
                .category(smartphone)
                .build();

        ProductModel m7 = ProductModel.builder()
                .modelName("Samsung Galaxy A55 5G")
                .color("Awesome Iceblue")
                .storageCapacity("256GB")
                .modelWarrantyDuration(12)
                .isSerialized(true)
                .stockQuantity(8)
                .standardCost(new BigDecimal("11200.00"))
                .standardPrice(new BigDecimal("13999.00"))
                .imageUrl("https://cdn.mobistockx.co.th/models/galaxy-a55.png")
                .brand(samsung)
                .category(smartphone)
                .build();

        ProductModel m8 = ProductModel.builder()
                .modelName("Samsung Galaxy Tab S9 FE")
                .color("Gray")
                .storageCapacity("128GB")
                .modelWarrantyDuration(12)
                .isSerialized(true)
                .stockQuantity(4)
                .standardCost(new BigDecimal("12000.00"))
                .standardPrice(new BigDecimal("14900.00"))
                .imageUrl("https://cdn.mobistockx.co.th/models/tab-s9-fe.png")
                .brand(samsung)
                .category(tablet)
                .build();

        ProductModel m9 = ProductModel.builder()
                .modelName("Xiaomi 14 Ultra")
                .color("Black")
                .storageCapacity("512GB")
                .modelWarrantyDuration(12)
                .isSerialized(true)
                .stockQuantity(2)
                .standardCost(new BigDecimal("31800.00"))
                .standardPrice(new BigDecimal("37990.00"))
                .imageUrl("https://cdn.mobistockx.co.th/models/xiaomi-14-ultra.png")
                .brand(xiaomi)
                .category(smartphone)
                .build();

        ProductModel m10 = ProductModel.builder()
                .modelName("Redmi Note 13 Pro+ 5G")
                .color("Midnight Black")
                .storageCapacity("256GB")
                .modelWarrantyDuration(12)
                .isSerialized(true)
                .stockQuantity(7)
                .standardCost(new BigDecimal("9300.00"))
                .standardPrice(new BigDecimal("11990.00"))
                .imageUrl("https://cdn.mobistockx.co.th/models/redmi-note-13-pro-plus.png")
                .brand(xiaomi)
                .category(smartphone)
                .build();

        ProductModel m11 = ProductModel.builder()
                .modelName("OPPO Find N3 Flip")
                .color("Cream Gold")
                .storageCapacity("256GB")
                .modelWarrantyDuration(12)
                .isSerialized(true)
                .stockQuantity(3)
                .standardCost(new BigDecimal("24200.00"))
                .standardPrice(new BigDecimal("29990.00"))
                .imageUrl("https://cdn.mobistockx.co.th/models/oppo-find-n3-flip.png")
                .brand(oppo)
                .category(smartphone)
                .build();

        ProductModel m12 = ProductModel.builder()
                .modelName("OPPO Reno11 5G")
                .color("Wave Green")
                .storageCapacity("256GB")
                .modelWarrantyDuration(12)
                .isSerialized(true)
                .stockQuantity(5)
                .standardCost(new BigDecimal("10100.00"))
                .standardPrice(new BigDecimal("12990.00"))
                .imageUrl("https://cdn.mobistockx.co.th/models/oppo-reno11.png")
                .brand(oppo)
                .category(smartphone)
                .build();

        ProductModel m13 = ProductModel.builder()
                .modelName("vivo V30 5G")
                .color("Shell White")
                .storageCapacity("256GB")
                .modelWarrantyDuration(12)
                .isSerialized(true)
                .stockQuantity(6)
                .standardCost(new BigDecimal("10900.00"))
                .standardPrice(new BigDecimal("13999.00"))
                .imageUrl("https://cdn.mobistockx.co.th/models/vivo-v30.png")
                .brand(vivo)
                .category(smartphone)
                .build();

        ProductModel m14 = ProductModel.builder()
                .modelName("Apple 20W USB-C Power Adapter")
                .color("White")
                .storageCapacity("-")
                .modelWarrantyDuration(12)
                .isSerialized(false)
                .stockQuantity(25)
                .standardCost(new BigDecimal("520.00"))
                .standardPrice(new BigDecimal("790.00"))
                .imageUrl("https://cdn.mobistockx.co.th/models/apple-20w-adapter.png")
                .brand(apple)
                .category(accessories)
                .build();

        ProductModel m15 = ProductModel.builder()
                .modelName("Samsung 45W Power Adapter")
                .color("Black")
                .storageCapacity("-")
                .modelWarrantyDuration(6)
                .isSerialized(false)
                .stockQuantity(18)
                .standardCost(new BigDecimal("790.00"))
                .standardPrice(new BigDecimal("1290.00"))
                .imageUrl("https://cdn.mobistockx.co.th/models/samsung-45w-adapter.png")
                .brand(samsung)
                .category(accessories)
                .build();

        return productModelRepository.saveAll(List.of(
                m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11, m12, m13, m14, m15
        ));
    }

    private List<ProductItem> seedProductItems(List<ProductModel> models) {
        ProductModel ip16Pro = models.get(0);
        ProductModel ip16 = models.get(1);
        ProductModel ip15 = models.get(2);
        ProductModel ipadAir = models.get(3);
        ProductModel aw10 = models.get(4);
        ProductModel s24Ultra = models.get(5);
        ProductModel a55 = models.get(6);
        ProductModel tabS9 = models.get(7);
        ProductModel mi14U = models.get(8);
        ProductModel reno11 = models.get(11);
        ProductModel v30 = models.get(12);

        ProductItem i1 = ProductItem.builder()
                .productModel(ip16Pro)
                .serialNumber("SN-AP-IP16P-001")
                .imei("358912345678901")
                .condition(ItemCondition.NEW)
                .grade("A+")
                .batteryHealth(100)
                .costPrice(new BigDecimal("37500.00"))
                .sellingPrice(new BigDecimal("43900.00"))
                .status(ItemStatus.SOLD)
                .warrantyExpireDate(LocalDateTime.now().plusMonths(12))
                .build();

        ProductItem i2 = ProductItem.builder()
                .productModel(ip16Pro)
                .serialNumber("SN-AP-IP16P-002")
                .imei("358912345678902")
                .condition(ItemCondition.NEW)
                .grade("A+")
                .batteryHealth(100)
                .costPrice(new BigDecimal("37500.00"))
                .sellingPrice(new BigDecimal("43900.00"))
                .status(ItemStatus.AVAILABLE)
                .build();

        ProductItem i3 = ProductItem.builder()
                .productModel(ip16Pro)
                .serialNumber("SN-AP-IP16P-003")
                .imei("358912345678903")
                .condition(ItemCondition.NEW)
                .grade("A+")
                .batteryHealth(100)
                .costPrice(new BigDecimal("37500.00"))
                .sellingPrice(new BigDecimal("43900.00"))
                .status(ItemStatus.RESERVED)
                .build();

        ProductItem i4 = ProductItem.builder()
                .productModel(ip16)
                .serialNumber("SN-AP-IP16-001")
                .imei("359012345678901")
                .condition(ItemCondition.NEW)
                .grade("A+")
                .batteryHealth(100)
                .costPrice(new BigDecimal("25000.00"))
                .sellingPrice(new BigDecimal("29900.00"))
                .status(ItemStatus.AVAILABLE)
                .build();

        ProductItem i5 = ProductItem.builder()
                .productModel(ip16)
                .serialNumber("SN-AP-IP16-002")
                .imei("359012345678902")
                .condition(ItemCondition.NEW)
                .grade("A+")
                .batteryHealth(100)
                .costPrice(new BigDecimal("25000.00"))
                .sellingPrice(new BigDecimal("29900.00"))
                .status(ItemStatus.AVAILABLE)
                .build();

        ProductItem i6 = ProductItem.builder()
                .productModel(ip15)
                .serialNumber("SN-AP-IP15-SH01")
                .imei("358712345678999")
                .condition(ItemCondition.SECOND_HAND)
                .grade("A")
                .batteryHealth(92)
                .costPrice(new BigDecimal("16000.00"))
                .sellingPrice(new BigDecimal("19900.00"))
                .status(ItemStatus.SOLD)
                .warrantyExpireDate(LocalDateTime.now().plusMonths(3))
                .build();

        ProductItem i7 = ProductItem.builder()
                .productModel(ip15)
                .serialNumber("SN-AP-IP15-SH02")
                .imei("358712345678998")
                .condition(ItemCondition.SECOND_HAND)
                .grade("B")
                .batteryHealth(87)
                .costPrice(new BigDecimal("14500.00"))
                .sellingPrice(new BigDecimal("17900.00"))
                .status(ItemStatus.AVAILABLE)
                .build();

        ProductItem i8 = ProductItem.builder()
                .productModel(ipadAir)
                .serialNumber("SN-AP-IPAD-001")
                .imei("356512345678901")
                .condition(ItemCondition.NEW)
                .grade("A+")
                .batteryHealth(100)
                .costPrice(new BigDecimal("18200.00"))
                .sellingPrice(new BigDecimal("21900.00"))
                .status(ItemStatus.AVAILABLE)
                .build();

        ProductItem i9 = ProductItem.builder()
                .productModel(aw10)
                .serialNumber("SN-AP-AW10-001")
                .imei("357112345678901")
                .condition(ItemCondition.NEW)
                .grade("A+")
                .batteryHealth(100)
                .costPrice(new BigDecimal("13200.00"))
                .sellingPrice(new BigDecimal("15900.00"))
                .status(ItemStatus.AVAILABLE)
                .build();

        ProductItem i10 = ProductItem.builder()
                .productModel(a55)
                .serialNumber("SN-SS-A55-001")
                .imei("354112345678901")
                .condition(ItemCondition.NEW)
                .grade("A+")
                .batteryHealth(100)
                .costPrice(new BigDecimal("11200.00"))
                .sellingPrice(new BigDecimal("13999.00"))
                .status(ItemStatus.SOLD)
                .warrantyExpireDate(LocalDateTime.now().plusMonths(12))
                .build();

        ProductItem i11 = ProductItem.builder()
                .productModel(a55)
                .serialNumber("SN-SS-A55-002")
                .imei("354112345678902")
                .condition(ItemCondition.NEW)
                .grade("A+")
                .batteryHealth(100)
                .costPrice(new BigDecimal("11200.00"))
                .sellingPrice(new BigDecimal("13999.00"))
                .status(ItemStatus.AVAILABLE)
                .build();

        ProductItem i12 = ProductItem.builder()
                .productModel(s24Ultra)
                .serialNumber("SN-SS-S24U-001")
                .imei("353312345678901")
                .condition(ItemCondition.NEW)
                .grade("A+")
                .batteryHealth(100)
                .costPrice(new BigDecimal("39500.00"))
                .sellingPrice(new BigDecimal("46900.00"))
                .status(ItemStatus.AVAILABLE)
                .build();

        ProductItem i13 = ProductItem.builder()
                .productModel(s24Ultra)
                .serialNumber("SN-SS-S24U-SH01")
                .imei("353312345678999")
                .condition(ItemCondition.SECOND_HAND)
                .grade("A+")
                .batteryHealth(96)
                .costPrice(new BigDecimal("32000.00"))
                .sellingPrice(new BigDecimal("37900.00"))
                .status(ItemStatus.AVAILABLE)
                .build();

        ProductItem i14 = ProductItem.builder()
                .productModel(tabS9)
                .serialNumber("SN-SS-TABS9-001")
                .imei("352212345678901")
                .condition(ItemCondition.NEW)
                .grade("A+")
                .batteryHealth(100)
                .costPrice(new BigDecimal("12000.00"))
                .sellingPrice(new BigDecimal("14900.00"))
                .status(ItemStatus.AVAILABLE)
                .build();

        ProductItem i15 = ProductItem.builder()
                .productModel(mi14U)
                .serialNumber("SN-XI-MI14U-001")
                .imei("861112345678901")
                .condition(ItemCondition.NEW)
                .grade("A+")
                .batteryHealth(100)
                .costPrice(new BigDecimal("31800.00"))
                .sellingPrice(new BigDecimal("37990.00"))
                .status(ItemStatus.AVAILABLE)
                .build();

        ProductItem i16 = ProductItem.builder()
                .productModel(reno11)
                .serialNumber("SN-OP-RENO11-001")
                .imei("862212345678901")
                .condition(ItemCondition.NEW)
                .grade("A+")
                .batteryHealth(100)
                .costPrice(new BigDecimal("10100.00"))
                .sellingPrice(new BigDecimal("12990.00"))
                .status(ItemStatus.AVAILABLE)
                .build();

        ProductItem i17 = ProductItem.builder()
                .productModel(v30)
                .serialNumber("SN-VV-V30-001")
                .imei("863312345678901")
                .condition(ItemCondition.NEW)
                .grade("A+")
                .batteryHealth(100)
                .costPrice(new BigDecimal("10900.00"))
                .sellingPrice(new BigDecimal("13999.00"))
                .status(ItemStatus.AVAILABLE)
                .build();

        return productItemRepository.saveAll(List.of(
                i1, i2, i3, i4, i5, i6, i7, i8, i9, i10, i11, i12, i13, i14, i15, i16, i17
        ));
    }

    private List<Customer> seedCustomers() {
        Customer c1 = Customer.builder()
                .firstName("สมชาย")
                .lastName("ใจดี")
                .phone("0812345678")
                .taxNumber("1409900123456")
                .idCard("1409900123456")
                .address("123/45 ถนนมิตรภาพ ต.ในเมือง อ.เมืองขอนแก่น จ.ขอนแก่น 40000")
                .build();

        Customer c2 = Customer.builder()
                .firstName("กานดา")
                .lastName("รัตนวิชัย")
                .phone("0897654321")
                .taxNumber("3100500987654")
                .idCard("3100500987654")
                .address("88/12 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110")
                .build();

        Customer c3 = Customer.builder()
                .firstName("ธีรภัทร")
                .lastName("วัฒนพงศ์")
                .phone("0954321098")
                .taxNumber("1509900234567")
                .idCard("1509900234567")
                .address("45/3 ถนนนิมมานเหมินท์ ต.สุเทพ อ.เมืองเชียงใหม่ จ.เชียงใหม่ 50200")
                .build();

        Customer c4 = Customer.builder()
                .firstName("นภัสสร")
                .lastName("บุญประเสริฐ")
                .phone("0623456789")
                .taxNumber("3400100456789")
                .idCard("3400100456789")
                .address("99 หมู่ 4 ต.เสม็ด อ.เมืองชลบุรี จ.ชลบุรี 20000")
                .build();

        Customer c5 = Customer.builder()
                .firstName("ชัยวัฒน์")
                .lastName("มณีโชติ")
                .phone("0845678901")
                .taxNumber("1809900345678")
                .idCard("1809900345678")
                .address("555 ถนนเพชรเกษม ต.หาดใหญ่ อ.หาดใหญ่ จ.สงขลา 90110")
                .build();

        Customer c6 = Customer.builder()
                .firstName("อรทัย")
                .lastName("พงษ์สวัสดิ์")
                .phone("0876543210")
                .taxNumber("3200800678901")
                .idCard("3200800678901")
                .address("12/8 ถนนมะลิวัลย์ ต.ในเมือง อ.เมืองขอนแก่น จ.ขอนแก่น 40000")
                .build();

        return customerRepository.saveAll(List.of(c1, c2, c3, c4, c5, c6));
    }

    private void seedSaleOrders(
            AppUser cashier,
            Customer somchai,
            Customer kanda,
            Customer teerapat,
            ProductModel iphone16Pro,
            ProductItem soldIphone16Pro,
            ProductModel galaxyA55,
            ProductItem soldGalaxyA55,
            ProductModel iphone15,
            ProductItem soldSecondHandIphone15) {

        SaleOrder order1 = createSingleItemOrder(
                "SO-20260915-0001",
                somchai,
                cashier,
                iphone16Pro,
                soldIphone16Pro,
                new BigDecimal("43900.00"),
                new BigDecimal("1000.00"),
                PaymentMethod.TRANSFER,
                "PP-20260915-8821",
                true,
                "INV-20260915-0001",
                "WAR-20260915-0001",
                12
        );

        SaleOrder order2 = createSingleItemOrder(
                "SO-20260915-0002",
                kanda,
                cashier,
                galaxyA55,
                soldGalaxyA55,
                new BigDecimal("13999.00"),
                BigDecimal.ZERO,
                PaymentMethod.CREDIT_CARD,
                "CC-VISA-4589",
                true,
                "INV-20260915-0002",
                "WAR-20260915-0002",
                12
        );

        SaleOrder order3 = createSingleItemOrder(
                "SO-20260916-0001",
                teerapat,
                cashier,
                iphone15,
                soldSecondHandIphone15,
                new BigDecimal("19900.00"),
                new BigDecimal("400.00"),
                PaymentMethod.CASH,
                "CASH-REC-0012",
                false,
                null,
                "WAR-20260916-0001",
                3
        );

        saleOrderRepository.saveAll(List.of(order1, order2, order3));
    }

    private SaleOrder createSingleItemOrder(
            String saleCode,
            Customer customer,
            AppUser cashier,
            ProductModel model,
            ProductItem item,
            BigDecimal unitPrice,
            BigDecimal discountAmount,
            PaymentMethod paymentMethod,
            String paymentRef,
            boolean requiresTaxInvoice,
            String invoiceNumber,
            String warrantyCode,
            int warrantyMonths) {

        BigDecimal lineTotal = unitPrice.subtract(discountAmount);

        SaleOrder saleOrder = SaleOrder.builder()
                .saleCode(saleCode)
                .saleDate(LocalDateTime.now().minusDays(1))
                .subtotalAmount(unitPrice)
                .discountAmount(discountAmount)
                .totalAmount(lineTotal)
                .status(SaleStatus.COMPLETED)
                .customer(customer)
                .createdBy(cashier)
                .build();

        SaleOrderItem orderItem = SaleOrderItem.builder()
                .productModel(model)
                .productItem(item)
                .quantity(1)
                .unitCost(item.getCostPrice())
                .unitPrice(unitPrice)
                .discountAmount(discountAmount)
                .warrantyExpireDate(LocalDateTime.now().plusMonths(warrantyMonths))
                .build();

        ProductWarranty warranty = ProductWarranty.builder()
                .warrantyCode(warrantyCode)
                .itemImei(item.getImei())
                .startDate(LocalDate.now().minusDays(1))
                .expireDate(LocalDate.now().plusMonths(warrantyMonths).minusDays(1))
                .termsConditions("รับประกันตัวเครื่อง " + warrantyMonths + " เดือน ครอบคลุมความบกพร่องจากการผลิต")
                .warrantyStatus("ACTIVE")
                .build();

        orderItem.setWarranty(warranty);
        saleOrder.addItem(orderItem);

        Payment payment = Payment.builder()
                .paymentMethod(paymentMethod)
                .amount(lineTotal)
                .paymentStatus(PaymentStatus.COMPLETED)
                .referenceNo(paymentRef)
                .paymentDate(LocalDateTime.now().minusDays(1))
                .receivedBy(cashier)
                .build();

        saleOrder.addPayment(payment);

        if (requiresTaxInvoice && invoiceNumber != null) {
            BigDecimal vatRate = new BigDecimal("7.00");
            BigDecimal preVatAmount = lineTotal.multiply(BigDecimal.valueOf(100))
                    .divide(BigDecimal.valueOf(107), 2, RoundingMode.HALF_UP);
            BigDecimal vatAmount = lineTotal.subtract(preVatAmount);

            TaxInvoice invoice = TaxInvoice.builder()
                    .invoiceNumber(invoiceNumber)
                    .companyOrBuyerName(customer.getFirstName() + " " + customer.getLastName())
                    .taxId(customer.getTaxNumber() != null ? customer.getTaxNumber() : "0000000000000")
                    .branchNumber("00000")
                    .address(customer.getAddress())
                    .subtotalAmount(preVatAmount)
                    .vatRate(vatRate)
                    .vatAmount(vatAmount)
                    .grandTotal(lineTotal)
                    .issuedAt(LocalDateTime.now().minusDays(1))
                    .build();

            saleOrder.setTaxInvoice(invoice);
        }

        return saleOrder;
    }
}
