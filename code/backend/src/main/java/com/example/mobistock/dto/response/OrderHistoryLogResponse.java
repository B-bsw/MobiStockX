package com.example.mobistock.dto.response;

import com.example.mobistock.domain.enums.OrderAction;
import com.example.mobistock.domain.enums.OrderType;
import com.fasterxml.jackson.databind.JsonNode;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class OrderHistoryLogResponse {

    private final Integer logId;
    private final OrderType orderType;
    private final Integer orderId;
    private final OrderAction action;
    private final String description;
    private final JsonNode oldData;
    private final JsonNode newData;
    private final String actionBy;
    private final LocalDateTime createdAt;
}
