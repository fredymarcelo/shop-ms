package com.peluware.freddy.products.dto;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

/**
 * Objeto de transferencia de datos (DTO) para un producto.
 */
@Data
public class ProductDto {

    @NotNull
    @NotEmpty
    private String name;

    @NotNull
    @Positive
    @Digits(integer = 10, fraction = 2, message = "Price must be a valid monetary amount")
    private BigDecimal price;

    @NotNull
    @NotEmpty
    private String description;

    @NotNull
    @Positive
    private Integer stock;
}
