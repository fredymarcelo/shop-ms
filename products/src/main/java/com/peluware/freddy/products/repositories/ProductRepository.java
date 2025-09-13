package com.peluware.freddy.products.repositories;

import com.peluware.freddy.products.models.Product;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Capa de acceso a datos para la entidad Product (Repositorio JPA).
 */
public interface ProductRepository extends JpaRepository<Product, Long> {
}
