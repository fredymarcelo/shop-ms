package com.peluware.freddy.sales.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class SaleItemDto {

    @NotNull
    private Long productId;

    @NotNull
    @Positive
    private Integer quantity;

}