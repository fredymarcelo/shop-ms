package com.peluware.freddy.products.controllers;

import com.peluware.freddy.products.dto.ProductDto;
import com.peluware.freddy.products.models.Product;
import com.peluware.freddy.products.services.ProductService;
import com.peluware.springframework.crud.core.web.controllers.CrudController;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controlador REST para la gestión de productos.
 */
@RestController
@RequestMapping("/products")
@CrossOrigin(origins = "*")
@Getter
@RequiredArgsConstructor
public class ProductController implements CrudController<Product, ProductDto, Long> {
    private final ProductService service;
}
