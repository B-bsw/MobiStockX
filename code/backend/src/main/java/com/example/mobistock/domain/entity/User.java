package com.example.mobistock.domain.entity;

import com.example.mobistock.domain.enums.user.UserRole;
import com.example.mobistock.domain.enums.user.UserRoleConverter;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.ColumnTransformer;

@Entity
@Table(name = "USERS")
@Getter
@Setter
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Integer userId;

    @Column(nullable = false, length = 255)
    private String username;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(nullable = false, length = 255)
    private String password;

    @Convert(converter = UserRoleConverter.class)
    @ColumnTransformer(write = "?::user_role_enum")
    @Column(nullable = false, columnDefinition = "user_role_enum")
    private UserRole role = UserRole.STAFF;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void initializeDefaults() {
        if (role == null) {
            role = UserRole.STAFF;
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
