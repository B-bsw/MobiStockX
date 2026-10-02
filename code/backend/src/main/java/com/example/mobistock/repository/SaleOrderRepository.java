package com.example.mobistock.repository;

import com.example.mobistock.domain.entity.SaleOrder;
import com.example.mobistock.domain.enums.SaleStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SaleOrderRepository extends JpaRepository<SaleOrder, Long> {

    Optional<SaleOrder> findBySaleCode(String saleCode);

    /*
     * Detail endpoints: โหลดทั้ง aggregate ในชุดเดียว
     * ใช้ left join fetch เฉพาะ collection เดียว (items) เพื่อไม่ให้เกิด cartesian product
     * ส่วน payments / taxInvoice ปล่อยให้ default_batch_fetch_size ยุบเป็น query เดียวต่อ association
     */
    @Query("""
            SELECT DISTINCT so FROM SaleOrder so
            LEFT JOIN FETCH so.customer
            LEFT JOIN FETCH so.createdBy
            LEFT JOIN FETCH so.items i
            LEFT JOIN FETCH i.productModel
            LEFT JOIN FETCH i.productItem
            LEFT JOIN FETCH i.warranty
            WHERE so.saleId = :saleId
            """)
    Optional<SaleOrder> findDetailById(@Param("saleId") Long saleId);

    @Query("""
            SELECT DISTINCT so FROM SaleOrder so
            LEFT JOIN FETCH so.customer
            LEFT JOIN FETCH so.createdBy
            LEFT JOIN FETCH so.items i
            LEFT JOIN FETCH i.productModel
            LEFT JOIN FETCH i.productItem
            LEFT JOIN FETCH i.warranty
            WHERE so.saleCode = :saleCode
            """)
    Optional<SaleOrder> findDetailBySaleCode(@Param("saleCode") String saleCode);

    /*
     * List endpoints: join fetch แค่ *-to-one เท่านั้น
     * ห้าม fetch collection ใน paged query เพราะ Hibernate จะดึงทั้งตารางมา paginate ในหน่วยความจำ
     * collection ที่เหลือถูกยุบด้วย default_batch_fetch_size=64 → 1 query ต่อ association ต่อหน้า
     */
    @Override
    @EntityGraph(attributePaths = {"customer", "createdBy"})
    Page<SaleOrder> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"customer", "createdBy"})
    Page<SaleOrder> findByStatus(SaleStatus status, Pageable pageable);
}
