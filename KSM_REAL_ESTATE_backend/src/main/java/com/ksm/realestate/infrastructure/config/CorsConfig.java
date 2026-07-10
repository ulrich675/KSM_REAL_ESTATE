/**
 * Global CORS configuration for the reactive WebFlux stack.
 * <p>
 * Allowed origins are resolved from the environment variable
 * {@code CORS_ALLOWED_ORIGINS} (comma-separated list).
 * In development the default value is {@code http://localhost:3000}.
 * In production this variable MUST be set to the real frontend origin(s).
 *
 * @author Antigravity
 * @date 2026-07-09
 */
package com.ksm.realestate.infrastructure.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    /**
     * Comma-separated list of allowed origins.
     * Set {@code CORS_ALLOWED_ORIGINS} in the environment for production.
     */
    @Value("${cors.allowed-origins:http://localhost:3000}")
    private String allowedOriginsRaw;

    /**
     * Reactive CORS filter applied before Spring Security.
     *
     * @return the CorsWebFilter bean
     */
    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration corsConfig = new CorsConfiguration();

        // Parse comma-separated origins from environment
        List<String> origins = Arrays.asList(allowedOriginsRaw.split(","));
        origins.replaceAll(String::trim);
        corsConfig.setAllowedOrigins(origins);

        corsConfig.setAllowedMethods(List.of(
                HttpMethod.GET.name(),
                HttpMethod.POST.name(),
                HttpMethod.PUT.name(),
                HttpMethod.DELETE.name(),
                HttpMethod.OPTIONS.name(),
                HttpMethod.PATCH.name()));

        corsConfig.setAllowedHeaders(List.of(
                HttpHeaders.AUTHORIZATION,
                HttpHeaders.CONTENT_TYPE,
                HttpHeaders.ACCEPT,
                "X-Requested-With"));

        corsConfig.setExposedHeaders(List.of(HttpHeaders.AUTHORIZATION));
        corsConfig.setAllowCredentials(true);
        // Pre-flight cache duration (seconds)
        corsConfig.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);

        return new CorsWebFilter(source);
    }
}
