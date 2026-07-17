package com.ksm.realestate.infrastructure.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.FileSystemResource;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.RouterFunctions;
import org.springframework.web.reactive.function.server.ServerResponse;

import java.nio.file.Path;

/**
 * Configuration exposing locally-stored virtual tour images via HTTP.
 *
 * @author ulrich675
 * @date 2026-07-17
 */
@Configuration
public class VirtualTourStaticConfig {

    @Bean
    public RouterFunction<ServerResponse> virtualTourRouter() {
        FileSystemResource vtLocation = new FileSystemResource(Path.of("virtual-tours").toString() + "/");
        return RouterFunctions.resources("/virtual-tours/**", vtLocation);
    }
}
