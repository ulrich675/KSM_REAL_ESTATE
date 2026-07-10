package com.ksm.realestate.infrastructure.adapter.out.kernelcore;

import com.ksm.realestate.application.port.out.KernelCoreFilePort;
import com.ksm.realestate.domain.exception.KernelCoreException;
import com.ksm.realestate.domain.model.KernelFileResult;
import com.ksm.realestate.infrastructure.config.KernelCoreProperties;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Adapter for file storage via kernel-core tiers-documents service.
 *
 * <p>
 * Endpoints (from kernel-core.yowyob.com OpenAPI):
 * <ul>
 * <li>POST /api/v1/tiers/{tierId}/documents
 * — multipart/form-data: file (required); query: documentType (required),
 * label</li>
 * <li>GET /api/v1/tiers/{tierId}/documents</li>
 * <li>DELETE /api/v1/tiers/{tierId}/documents/{documentId}</li>
 * </ul>
 *
 * <p>
 * Required headers: X-Tenant-Id (path param tierId is the kernel-core entity
 * UUID).
 *
 * @author Antigravity
 * @date 2026-07-10
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class KernelCoreFileAdapter implements KernelCoreFilePort {

        private final WebClient kernelCoreWebClient;
        private final KernelCoreProperties properties;

        @Override
        public Mono<KernelFileResult> uploadFile(FilePart file, String tierId, String documentType, String label) {
                MultipartBodyBuilder builder = new MultipartBodyBuilder();
                builder.asyncPart("file", file.content(), DataBuffer.class)
                                .filename(file.filename())
                                .contentType(MediaType.APPLICATION_OCTET_STREAM);

                WebClient.RequestHeadersSpec<?> req = kernelCoreWebClient.post()
                                .uri(uriBuilder -> {
                                        uriBuilder.path("/api/v1/tiers/{tierId}/documents")
                                                        .queryParam("documentType", documentType);
                                        if (label != null)
                                                uriBuilder.queryParam("label", label);
                                        return uriBuilder.build(tierId);
                                })
                                .header("X-Tenant-Id", properties.getTenantId())
                                .contentType(MediaType.MULTIPART_FORM_DATA)
                                .body(BodyInserters.fromMultipartData(builder.build()));

                return req.retrieve()
                                .onStatus(s -> s.isError(), r -> r.bodyToMono(KernelErrorResponse.class)
                                                .flatMap(err -> Mono.<Throwable>error(new KernelCoreException(
                                                                err.getErrorCode() != null ? err.getErrorCode()
                                                                                : "UPLOAD_FAILED",
                                                                err.getMessage() != null ? err.getMessage()
                                                                                : "File upload failed")))
                                                .switchIfEmpty(Mono.<Throwable>error(
                                                                new KernelCoreException("UPLOAD_FAILED",
                                                                                "File upload failed"))))
                                .bodyToMono(FileApiResponse.class)
                                .map(resp -> {
                                        if (resp.getData() == null) {
                                                return KernelFileResult.builder()
                                                                .tierId(tierId)
                                                                .fileName(file.filename())
                                                                .documentType(documentType)
                                                                .label(label)
                                                                .build();
                                        }
                                        return mapToResult(resp.getData(), tierId);
                                });
        }

        @Override
        public Flux<KernelFileResult> getFiles(String tierId) {
                return kernelCoreWebClient.get()
                                .uri("/api/v1/tiers/{tierId}/documents", tierId)
                                .header("X-Tenant-Id", properties.getTenantId())
                                .retrieve()
                                .onStatus(s -> s.isError(), r -> r.bodyToMono(KernelErrorResponse.class)
                                                .flatMap(err -> Mono.<Throwable>error(new KernelCoreException(
                                                                err.getErrorCode() != null ? err.getErrorCode()
                                                                                : "GET_FILES_FAILED",
                                                                err.getMessage() != null ? err.getMessage()
                                                                                : "Failed to list files"))))
                                .bodyToFlux(FileData.class)
                                .map(d -> mapToResult(d, tierId));
        }

        @Override
        public Mono<Void> deleteFile(String tierId, String documentId) {
                return kernelCoreWebClient.delete()
                                .uri("/api/v1/tiers/{tierId}/documents/{documentId}", tierId, documentId)
                                .header("X-Tenant-Id", properties.getTenantId())
                                .retrieve()
                                .onStatus(s -> s.isError(), r -> r.bodyToMono(KernelErrorResponse.class)
                                                .flatMap(err -> Mono.<Throwable>error(new KernelCoreException(
                                                                err.getErrorCode() != null ? err.getErrorCode()
                                                                                : "DELETE_FAILED",
                                                                err.getMessage() != null ? err.getMessage()
                                                                                : "File deletion failed"))))
                                .bodyToMono(Void.class);
        }

        private KernelFileResult mapToResult(FileData d, String tierId) {
                return KernelFileResult.builder()
                                .id(d.getId())
                                .fileName(d.getFileName())
                                .documentType(d.getType())
                                .label(d.getLabel())
                                .tierId(tierId)
                                .build();
        }

        // ─── inner DTOs ──────────────────────────────────────────────────────────

        @Data
        public static class FileApiResponse {
                private String status;
                private FileData data;
        }

        @Data
        public static class FileData {
                private String id;
                private String type;
                private String subjectId;
                private String fileId;
                private String fileName;
                private String label;
                private String contentHashHex;
                private String signedAt;
        }

        @Data
        public static class KernelErrorResponse {
                private String errorCode;
                private String message;
        }
}
