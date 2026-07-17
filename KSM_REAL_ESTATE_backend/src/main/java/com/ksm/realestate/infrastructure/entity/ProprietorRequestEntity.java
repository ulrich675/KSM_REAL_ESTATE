package com.ksm.realestate.infrastructure.entity;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.relational.core.mapping.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Persistence entity for proprietor requests.
 *
 * @author ulrich675
 * @date 2026-07-17
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table("proprietor_requests")
public class ProprietorRequestEntity {

    @Id
    private Long id;

    private Long userId;

    private String phoneNumber;

    private String physicalAddress;

    private String motivation;

    private String status;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
