package com.ksm.realestate.infrastructure.adapter.out.kernelcore;

import com.ksm.realestate.application.port.out.KernelCoreFilePort;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

/**
 * Stub adapter for file-core. NOT FUNCTIONAL.
 *
 * <p>
 * <b>PHASE 4 — BLOQUÉ :</b> Aucun endpoint REST file-core n'est documenté dans
 * les rapports fournis. Cet adapter lève une exception explicite pour éviter
 * qu'un
 * faux endpoint silencieux ne survive en production.
 *
 * <p>
 * Pour débloquer cette phase, fournir un des documents suivants :
 * <ul>
 * <li>Collection Postman du file-core</li>
 * <li>Spec OpenAPI / Swagger du file-core</li>
 * <li>Extrait de code source montrant les @RestController du file-core</li>
 * </ul>
 *
 * @author Antigravity
 * @date 2026-07-09
 */
@Slf4j
@Component
public class KernelCoreFileAdapter implements KernelCoreFilePort {

    @Override
    public Mono<String> uploadFile(FilePart file, String targetType, String targetId) {
        log.error("KernelCoreFileAdapter.uploadFile called but file-core REST API is not documented. " +
                "Phase 4 is BLOCKED. targetType={}, targetId={}", targetType, targetId);
        return Mono.error(new UnsupportedOperationException(
                "file-core integration not implemented: REST API documentation required. " +
                        "See Phase 4 block notes in KernelCoreFilePort."));
    }
}
