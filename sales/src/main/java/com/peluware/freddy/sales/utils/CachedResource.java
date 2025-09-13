package com.peluware.freddy.sales.utils;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestOperations;

import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.function.Function;

@Slf4j
public class CachedResource<K, T> {

    private final Cache<K, T> cache;
    private final Function<K, T> loader;

    public CachedResource(Function<K, T> loader) {
        this.cache = Caffeine.newBuilder()
                .expireAfterWrite(1, TimeUnit.MINUTES)
                .maximumSize(1500)
                .build();
        this.loader = loader;
    }

    public T get(K id) {
        return cache.get(id, loader);
    }

    public static <ID, T> CachedResource<ID, T> fromRest(RestOperations client, String resource, Class<T> responseType) {

        if (!resource.contains("{id}")) {
            throw new IllegalArgumentException("Resource path must contain {id} placeholder");
        }

        return new CachedResource<>(id -> {
            try {
                return client.getForObject(resource, responseType, Map.of("id", id));
            } catch (HttpClientErrorException e) {
                var body = e.getResponseBodyAsString();
                log.warn("Resource not get for ID {}: {} - {}", id, e.getStatusCode(), body);
                if (e.getStatusCode().value() == 404) {
                    return null; // Resource not found, return null
                }
                throw e;
            }
        });
    }
}
