package com.example.mobistock.dto.request;

import com.example.mobistock.domain.enums.RepairImageType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class RepairOrderImageRequest {

    @NotNull
    private Integer repairId;

    @NotBlank
    @Size(max = 255)
    private String imageUrl;

    @Size(max = 255)
    private String imageCaption;

    private RepairImageType imageType = RepairImageType.received;
}
