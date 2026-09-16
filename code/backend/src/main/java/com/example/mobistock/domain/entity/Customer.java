package com.example.mobistock.domain.entity;

import com.example.mobistock.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "CUSTOMER")
public class Customer extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "customer_id")
    private Long customerId;

    @Column(name = "customer_fname", nullable = false)
    private String firstName;

    @Column(name = "customer_lname", nullable = false)
    private String lastName;

    @Column(name = "customer_phone", nullable = false)
    private String phone;

    @Column(name = "customer_tax_number")
    private String taxNumber;

    @Column(name = "customer_id_card")
    private String idCard;

    @Column(name = "customer_address", columnDefinition = "TEXT")
    private String address;
}
