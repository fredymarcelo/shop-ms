package com.peluware.freddy.sales.utils;

import com.peluware.freddy.sales.schemas.Product;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestOperations;

@Slf4j
@Component
public class CachedResources {

    private final RestOperations restOperations;

    @Setter(AccessLevel.PRIVATE)
    @Getter
    private static CachedResources instance;

    @Getter(lazy = true)
    private final CachedResource<Long, Product> products = CachedResource.fromRest(restOperations, "/products/{id}", Product.class);

    public CachedResources(@Qualifier("productMicroserviceRestOperations") RestOperations restOperations) {
        this.restOperations = restOperations;
        setInstance(this);
    }

}
