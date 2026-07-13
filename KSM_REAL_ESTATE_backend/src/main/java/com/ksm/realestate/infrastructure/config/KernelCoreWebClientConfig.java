package com.ksm.realestate.infrastructure.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * Pre-configured WebClient bean with base URL and default authentication
 * headers
 * for communication with the kernel-core endpoints.
 *
 * @author ulrich675
 * @date 2026-07-09
 */
@Configuration
public class KernelCoreWebClientConfig {

    @Bean
    public WebClient kernelCoreWebClient(KernelCoreProperties properties, WebClient.Builder webClientBuilder) {
        return webClientBuilder
                .baseUrl(properties.getBaseUrl())
                .defaultHeader("X-Client-Id", properties.getClientId())
                .defaultHeader("X-Api-Key", properties.getApiKey())
                .build();
    }
}
