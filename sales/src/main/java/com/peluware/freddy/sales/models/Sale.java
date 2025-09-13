package com.peluware.freddy.sales.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.peluware.freddy.sales.schemas.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.domain.Persistable;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "sales")
public class Sale implements Persistable<String> {

    @Id
    private String id;
    private Instant date;
    private String customerCi;
    private List<SaleItem> items = new ArrayList<>();
    private BigDecimal iva = BigDecimal.ZERO;
    private PaymentMethod paymentMethod;

    @JsonProperty
    public BigDecimal getTotal() {
        return items.stream().map(SaleItem::getSubTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @JsonProperty
    public BigDecimal getTotalWithIva() {
        var ivaFactor = BigDecimal.ONE.add(iva.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));
        return getTotal()
                .multiply(ivaFactor)
                .setScale(2, RoundingMode.HALF_UP);
    }

    @JsonIgnore
    @Override
    public boolean isNew() {
        return id == null;
    }

}
