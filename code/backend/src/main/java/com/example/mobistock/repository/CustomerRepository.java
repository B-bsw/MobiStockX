package com.example.mobistock.repository;

import com.example.mobistock.domain.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Optional<Customer> findByPhone(String phone);

    boolean existsByPhone(String phone);

    /*
     * ของเดิมเป็น derived query 3 OR + LOWER() ทับทุกคอลัมน์ → seq scan ตลอด
     * เขียนเป็น JPQL ตัวเดียวที่ normalize keyword ครั้งเดียวแทนการ bind 3 รอบ
     * leading wildcard ยังใช้ index ปกติไม่ได้ ดู comment เรื่อง pg_trgm ท้ายไฟล์
     */
    @Query("""
            SELECT c FROM Customer c
            WHERE LOWER(c.firstName) LIKE :pattern
               OR LOWER(c.lastName) LIKE :pattern
               OR c.phone LIKE :rawPattern
            """)
    Page<Customer> search(@Param("pattern") String lowerPattern,
                          @Param("rawPattern") String rawPattern,
                          Pageable pageable);
}
