package com.peluware.freddy.products.services;

import com.peluware.freddy.products.dto.ProductDto;
import com.peluware.freddy.products.models.Product;
import com.peluware.freddy.products.repositories.ProductRepository;
import com.peluware.springframework.crud.jpa.JpaCrudService;
import jakarta.persistence.EntityManager;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;

/**
 * Capa de servicio para la gestión de productos.
 */
@Service
@Getter // Genera los getters para los campos finales (Autoimplementación de la interfaz)
@RequiredArgsConstructor
public class ProductService implements JpaCrudService<Product, ProductDto, Long, ProductRepository> {

    private final ProductRepository repository;
    private final EntityManager entityManager;
    private final PlatformTransactionManager transactionManager;

    @Override
    public void mapModel(ProductDto dto, Product model) {
        model.setName(dto.getName());
        model.setDescription(dto.getDescription());
        model.setPrice(dto.getPrice());
        model.setStock(dto.getStock());
    }

    @Override
    public Class<Product> getEntityClass() {
        return Product.class;
    }
}
