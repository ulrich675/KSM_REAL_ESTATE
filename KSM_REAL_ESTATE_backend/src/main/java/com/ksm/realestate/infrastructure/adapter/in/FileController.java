package com.ksm.realestate.infrastructure.adapter.in;

import com.ksm.realestate.application.port.out.KernelCoreFilePort;
import com.ksm.realestate.domain.model.KernelFileResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Instant;

/**
 * REST controller for file upload operations, delegating to kernel-core.
 * Exposes endpoints for the React frontend to upload, list, and delete files.
 *
 * @author Antigravity
 * @date 2026-07-10
 */
@Slf4j
@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final KernelCoreFilePort filePort;

    /**
     * Upload a file and associate it with a tierId (property or user UUID).
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<ApiResponse<KernelFileResult>> uploadFile(
            @RequestPart("file") FilePart file,
            @RequestParam("tierId") String tierId,
            @RequestParam("documentType") String documentType,
            @RequestParam(value = "label", required = false) String label) {

        log.info("Request to upload file name: '{}' for tierId: '{}', type: '{}', label: '{}'",
                file.filename(), tierId, documentType, label);

        return filePort.uploadFile(file, tierId, documentType, label)
                .map(result -> ApiResponse.<KernelFileResult>builder()
                        .status("SUCCESS")
                        .message("File uploaded successfully")
                        .data(result)
                        .timestamp(Instant.now())
                        .errors(null)
                        .build());
    }

    /**
     * List all files associated with a tierId.
     */
    @GetMapping("/tiers/{tierId}")
    public Flux<KernelFileResult> getFiles(@PathVariable("tierId") String tierId) {
        log.info("Request to list files for tierId: '{}'", tierId);
        return filePort.getFiles(tierId);
    }

    /**
     * Delete a specific file.
     */
    @DeleteMapping("/tiers/{tierId}/{documentId}")
    public Mono<ApiResponse<Void>> deleteFile(
            @PathVariable("tierId") String tierId,
            @PathVariable("documentId") String documentId) {
        log.info("Request to delete file id: '{}' for tierId: '{}'", documentId, tierId);

        return filePort.deleteFile(tierId, documentId)
                .then(Mono.just(ApiResponse.<Void>builder()
                        .status("SUCCESS")
                        .message("File deleted successfully")
                        .timestamp(Instant.now())
                        .errors(null)
                        .build()));
    }
}
