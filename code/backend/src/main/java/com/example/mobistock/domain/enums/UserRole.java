package com.example.mobistock.domain.enums;

public enum UserRole {
    STAFF("staff"),
    CUSTOMER("customer");

    private final String databaseValue;

    UserRole(String databaseValue) {
        this.databaseValue = databaseValue;
    }

    public String getDatabaseValue() {
        return databaseValue;
    }

    public static UserRole fromDatabaseValue(String value) {
        for (UserRole role : values()) {
            if (role.databaseValue.equals(value)) {
                return role;
            }
        }
        throw new IllegalArgumentException("Unsupported user role: " + value);
    }
}
