package com.ksm.realestate.infrastructure.adapter.out.storage;

import com.ksm.realestate.application.port.out.LocalFileStoragePort;
import com.ksm.realestate.domain.exception.BusinessException;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.io.File;
import java.nio.file.Path;
import java.util.UUID;

/**
 * Adapter defining how file storage behaves locally.
 *
 * @author ulrich675
 * @date 2026-07-17
 */
@Component
public class LocalFileStorageAdapter implements LocalFileStoragePort {

    private static final String BASE_DIRECTORY = "virtual-tours";

    @Override
    public Mono<String> store(FilePart file, String subdirectory) {
        String filename = UUID.randomUUID().toString() + "_" + file.filename();
        Path basePath = Path.of(BASE_DIRECTORY, subdirectory);
        Path targetPath = basePath.resolve(filename);

        File dir = basePath.toFile();
        if (!dir.exists()) {
            boolean created = dir.mkdirs();
            if (!created) {
                return Mono
                        .error(new BusinessException("STORAGE_ERROR", "Could not create directory for virtual tours."));
            }
        }

        return file.transferTo(targetPath)
                .then(Mono.just("/" + BASE_DIRECTORY + "/" + subdirectory + "/" + filename));
    }
}
