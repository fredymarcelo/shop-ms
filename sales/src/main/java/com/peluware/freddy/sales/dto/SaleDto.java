package com.peluware.freddy.sales.dto;

import com.peluware.freddy.sales.schemas.PaymentMethod;
import io.github.luidmidev.jakarta.validations.EquatorCi;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class SaleDto {

    @NotNull
    @EquatorCi
    private String customerCi;

    @NotNull
    @NotEmpty
    @Valid
    private List<@NotNull SaleItemDto> items;

    @NotNull
    private BigDecimal iva;

    @NotNull
    private PaymentMethod paymentMethod;
}
