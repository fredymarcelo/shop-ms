package com.peluware.freddy.sales;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.web.config.EnableSpringDataWebSupport;
import org.springframework.web.client.RestOperations;

@Configuration
@EnableSpringDataWebSupport(pageSerializationMode = EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO)
public class AppConfig {

    @Bean
    public RestOperations productMicroserviceRestOperations(RestTemplateBuilder builder, @Value("${product.service.host:http://localhost:8082}") String productsServiceUrl) {
        return builder
                .rootUri(productsServiceUrl)
                .build();
    }

}
