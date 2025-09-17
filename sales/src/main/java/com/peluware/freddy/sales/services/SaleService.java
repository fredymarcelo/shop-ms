package com.peluware.freddy.sales.services;

import com.peluware.freddy.sales.dto.SaleDto;
import com.peluware.freddy.sales.dto.SaleItemDto;
import com.peluware.freddy.sales.models.Sale;
import com.peluware.freddy.sales.models.SaleItem;
import com.peluware.freddy.sales.repositories.SaleRepository;
import com.peluware.freddy.sales.schemas.Product;
import com.peluware.springframework.crud.mongo.MongoCrudService;
import com.peluware.springframework.web.problemdetails.ProblemDetails;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestOperations;

import java.time.Instant;
import java.util.stream.Collectors;


@Service
@Slf4j
@Getter
@RequiredArgsConstructor
public class SaleService implements MongoCrudService<Sale, SaleDto, String, SaleRepository> {

    private final SaleRepository repository;
    private final MongoTemplate mongoTemplate;
    private final RestOperations productMicroserviceRestOperations;

    @Override
    public void mapModel(SaleDto dto, Sale model) {

        // Solo se permite crear una venta, no modificarla
        if (!model.isNew()) {
            throw ProblemDetails.badRequest("No se puede modificar una venta creada");
        }

        // Validar que no se repitan productos en la venta
        if (dto.getItems().stream().map(SaleItemDto::getProductId).distinct().count() != dto.getItems().size()) {
            throw ProblemDetails.badRequest("No se pueden repetir productos en una venta");
        }

        // Crear un mapa de productos con la cantidad solicitada para la venta
        var products = dto.getItems().stream().collect(Collectors.toMap(
                item -> getProduct(item.getProductId()),
                SaleItemDto::getQuantity,
                Integer::sum
        ));

        // Validar que haya suficiente stock para cada producto
        products.forEach((product, quantity) -> {
            if (product.getStock() < quantity) {
                throw ProblemDetails.badRequest("No hay suficiente stock para el producto: " + product.getName());
            }
        });

        // Crear los items de la venta y actualizar el stock de los productos
        products.forEach((product, quantity) -> {
            model.getItems().add(new SaleItem(
                    product.getId(),
                    product.getPrice(),
                    quantity
            ));
            product.setStock(product.getStock() - quantity);
            updateProduct(product);
        });

        model.setDate(Instant.now());
        model.setCustomerCi(dto.getCustomerCi());
        model.setIva(dto.getIva());
        model.setPaymentMethod(dto.getPaymentMethod());
    }

    public Product getProduct(Long productId) {
        try {
            return productMicroserviceRestOperations.getForObject("/products/{id}", Product.class, productId);
        } catch (HttpServerErrorException e) {
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                throw ProblemDetails.notFound("No se encontró el producto con ID: " + productId);
            }
            log.error("Error al comunicarse con el microservicio de productos: {}", e.getMessage(), e);
            throw ProblemDetails.internalServerError("Error al comunicarse con el microservicio de productos");
        }
    }

    public void updateProduct(Product product) {
        try {
            productMicroserviceRestOperations.put("/products/{id}", product, product.getId());
        } catch (Exception e) {
            log.error("Error al actualizar el stock del producto: {}", e.getMessage(), e);
            throw ProblemDetails.internalServerError("Error al actualizar el stock del producto: " + product.getName());
        }
    }

    public String noop() {
        System.out.println("noop");
        return "noop";
    }

    @Override
    public Class<Sale> getEntityClass() {
        return Sale.class;
    }
}
