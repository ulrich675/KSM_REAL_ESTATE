package com.ksm.realestate.application.port.out;

import org.springframework.http.codec.multipart.FilePart;
import reactor.core.publisher.Mono;

/**
 * Generic outbound port for local file storage (temporary fallback to
 * file-core).
 *
 * @author ulrich675
 * @date 2026-07-17
 */
public interface LocalFileStoragePort {

    /**
     * Stores a file locally in the specified subdirectory.
     *
     * @param file         the multipart file to store
     * @param subdirectory the target subdirectory, e.g., "virtual-tours/123"
     * @return the relative URL to access the stored file
     */
    Mono<String> store(FilePart file, String subdirectory);
}
