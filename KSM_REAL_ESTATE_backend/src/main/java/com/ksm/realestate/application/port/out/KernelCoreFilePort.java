package com.ksm.realestate.application.port.out;

import org.springframework.http.codec.multipart.FilePart;
import reactor.core.publisher.Mono;

/**
 * Outbound port for delegation of file storage to file-core.
 *
 * <p>
 * <b>PHASE 4 — BLOQUÉ :</b> Les endpoints REST de file-core ne sont pas
 * documentés
 * dans les rapports fournis (rapport_Kernel_Réseau.pdf, main__6_.pdf,
 * RAPPORT-organisation-workflows-api.pdf).
 * Ce port est une interface contractuelle; l'adapter reste un stub non
 * fonctionnel.
 *
 * <p>
 * <b>Question à poser au propriétaire du projet :</b>
 * Quels sont les endpoints REST exposés par file-core pour l'upload et
 * l'association
 * de fichiers à une entité métier (targetType, targetId) ? Une collection
 * Postman,
 * une spec OpenAPI ou un extrait du code source du file-core serait nécessaire.
 *
 * @author Antigravity
 * @date 2026-07-09
 */
public interface KernelCoreFilePort {

    /**
     * Upload a file and associate it with a business entity.
     *
     * @param file       the multipart file to upload
     * @param targetType the type of entity owning the file (e.g., "PROPERTY")
     * @param targetId   the ID of the owning entity
     * @return the URL or file reference returned by file-core
     */
    Mono<String> uploadFile(FilePart file, String targetType, String targetId);
}
