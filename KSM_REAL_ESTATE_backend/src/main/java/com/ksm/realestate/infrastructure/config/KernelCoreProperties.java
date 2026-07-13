package com.ksm.realestate.infrastructure.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration properties class mapping for external kernel-core connection.
 *
 * @author ulrich675
 * @date 2026-07-09
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "kernel-core")
public class KernelCoreProperties {
    private String baseUrl;
    private String clientId;
    private String apiKey;
    private String tenantId;
    private String organizationId;
}
