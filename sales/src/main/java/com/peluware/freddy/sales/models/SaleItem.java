package com.peluware.freddy.sales.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.peluware.freddy.sales.schemas.Product;
import com.peluware.freddy.sales.utils.CachedResources;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Transient;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SaleItem {

    @JsonIgnore
    private Long productId;
    private BigDecimal price;
    private int quantity;

    @JsonProperty
    public BigDecimal getSubTotal() {
        return price.multiply(BigDecimal.valueOf(quantity));
    }

    @Transient
    @Getter(lazy = true)
    private final Product product = CachedResources.getInstance().getProducts().get(productId);
}