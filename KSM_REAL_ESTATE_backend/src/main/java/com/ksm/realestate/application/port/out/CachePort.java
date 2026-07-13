package com.ksm.realestate.application.port.out;

import reactor.core.publisher.Mono;

/**
 * Outbound port for cache operations (e.g., Redis).
 *
 * Provides reactive methods for getting, setting, and evicting cache entries.
 *
 * @author ulrich675
 * @date 2026-07-08
 */
public interface CachePort {

    /**
     * Retrieve a cached value by key.
     *
     * @param key the cache key
     * @return a Mono emitting the cached value or empty if not present
     */
    Mono<String> get(String key);

    /**
     * Store a value in the cache with a TTL.
     *
     * @param key        the cache key
     * @param value      the value to cache
     * @param ttlSeconds time‑to‑live in seconds
     * @return a Mono signalling completion
     */
    Mono<Void> put(String key, String value, long ttlSeconds);

    /**
     * Evict a cache entry.
     *
     * @param key the cache key to remove
     * @return a Mono signalling completion
     */
    Mono<Void> evict(String key);
}
