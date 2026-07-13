package com.ksm.realestate.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Result returned from kernel-core after a successful file upload via
 * POST /api/v1/tiers/{tierId}/documents.
 *
 * @author ulrich675
 * @date 2026-07-10
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class KernelFileResult {
    /** UUID of the stored document in kernel-core */
    private String id;
    private String fileName;
    private String documentType;
    private String label;
    /** tierId to which this file belongs */
    private String tierId;
    private String fileUrl;
}
