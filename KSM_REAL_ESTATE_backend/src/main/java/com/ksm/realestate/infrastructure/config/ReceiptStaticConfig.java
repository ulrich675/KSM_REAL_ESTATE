package com.ksm.realestate.infrastructure.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.FileSystemResource;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.RouterFunctions;
import org.springframework.web.reactive.function.server.ServerResponse;

import java.nio.file.Path;

/**
 * Configuration exposing locally-stored receipt PDFs via HTTP.
 *
 * @author ulrich675
 * @date 2026-07-08
 */
@Configuration
public class ReceiptStaticConfig {

    @Bean
    public RouterFunction<ServerResponse> receiptRouter() {
        FileSystemResource receiptsLocation = new FileSystemResource(Path.of("receipts").toString() + "/");
        return RouterFunctions.resources("/receipts/**", receiptsLocation);
    }
}