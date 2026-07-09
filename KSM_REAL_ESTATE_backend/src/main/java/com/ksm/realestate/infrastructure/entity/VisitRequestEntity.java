package com.ksm.realestate.infrastructure.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;
import java.time.Instant;

/**
 * Persistence entity for VisitRequest.
 *
 * Maps to a table "visit_requests".
 *
 * @author Antigravity
 * @date 2026-07-08
 */
@Table("visit_requests")
public class VisitRequestEntity {

    @Id
    @Column("request_id")
    private Long requestId;

    @Column("property_id")
    private Long propertyId;

    @Column("user_id")
    private Long userId;

    @Column("requested_at")
    private Instant requestedAt;

    @Column("status")
    private String status;

    @Column("updated_at")
    private Instant updatedAt;

    public Long getRequestId() {
        return requestId;
    }

    public void setRequestId(Long requestId) {
        this.requestId = requestId;
    }

    public Long getPropertyId() {
        return propertyId;
    }

    public void setPropertyId(Long propertyId) {
        this.propertyId = propertyId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Instant getRequestedAt() {
        return requestedAt;
    }

    public void setRequestedAt(Instant requestedAt) {
        this.requestedAt = requestedAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
