package com.ksm.realestate.application.port.out;

import com.ksm.realestate.domain.model.KernelFileResult;
import org.springframework.http.codec.multipart.FilePart;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Outbound port for file storage operations via kernel-core tiers-documents
 * service.
 *
 * <p>
 * Endpoints:
 * <ul>
 * <li>POST /api/v1/tiers/{tierId}/documents — multipart upload</li>
 * <li>GET /api/v1/tiers/{tierId}/documents — list documents</li>
 * <li>DELETE /api/v1/tiers/{tierId}/documents/{documentId} — delete</li>
 * </ul>
 *
 * @author ulrich675
 * @date 2026-07-10
 */
public interface KernelCoreFilePort {

    /**
     * Uploads a file to kernel-core and associates it with a "tiers" entity.
     *
     * @param file         the multipart file (required)
     * @param tierId       the tiers/entity UUID in kernel-core (required)
     * @param documentType the document type discriminator (required, e.g.
     *                     "PROPERTY_IMAGE")
     * @param label        optional human-readable label for the document
     * @return the upload result with the file UUID and metadata
     */
    Mono<KernelFileResult> uploadFile(FilePart file, String tierId, String documentType, String label);

    /**
     * Lists all documents associated with a tiers entity.
     *
     * @param tierId the tiers entity UUID
     * @return stream of file results
     */
    Flux<KernelFileResult> getFiles(String tierId);

    /**
     * Deletes a specific document from kernel-core.
     *
     * @param tierId     the tiers entity UUID
     * @param documentId the UUID of the document to delete
     * @return empty Mono on success
     */
    Mono<Void> deleteFile(String tierId, String documentId);
}
