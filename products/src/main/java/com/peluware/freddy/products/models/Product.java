package com.peluware.freddy.products.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import org.springframework.data.domain.Persistable;

import java.math.BigDecimal;

/**
 * Entidad que representa un producto en el sistema. (JPA Entity)
 */
@Data
@Entity
public class Product implements Persistable<Long> {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private Integer stock;

    @JsonIgnore
    @Override
    public boolean isNew() {
        return id == null;
    }
}
