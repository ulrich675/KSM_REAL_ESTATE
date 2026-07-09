package com.ksm.realestate.infrastructure.adapter.out.cache;

import com.ksm.realestate.application.port.out.CachePort;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;
import java.time.Duration;

/**
 * Adapter implementing CachePort using ReactiveStringRedisTemplate.
 *
 * @author Antigravity
 * @date 2026-07-08
 */
@Component
public class RedisCacheAdapter implements CachePort {

    private final ReactiveStringRedisTemplate redisTemplate;

    public RedisCacheAdapter(ReactiveStringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    public Mono<String> get(String key) {
        return redisTemplate.opsForValue().get(key);
    }

    @Override
    public Mono<Void> put(String key, String value, long ttlSeconds) {
        return redisTemplate.opsForValue().set(key, value, Duration.ofSeconds(ttlSeconds)).then();
    }

    @Override
    public Mono<Void> evict(String key) {
        return redisTemplate.opsForValue().delete(key).then();
    }
}
