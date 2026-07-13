package com.ksm.realestate;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

/**
 * Main entry point for the KSM Real Estate backend application.
 *
 * @author ulrich675
 * @date 2026-07-08
 */
@SpringBootApplication
@ComponentScan(basePackages = "com.ksm.realestate")
public class KsmRealEstateBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(KsmRealEstateBackendApplication.class, args);
    }
}
