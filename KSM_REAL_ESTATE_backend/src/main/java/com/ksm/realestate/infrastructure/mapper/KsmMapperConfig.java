package com.ksm.realestate.infrastructure.mapper;

import org.mapstruct.MapperConfig;
import org.mapstruct.ReportingPolicy;

/**
 * Shared MapStruct configuration for all KSM Real Estate mappers.
 *
 * <p>
 * Sets unmappedTargetPolicy to IGNORE so that generated fields (IDs,
 * timestamps, status) managed by persistence/services do not produce warnings
 * during compilation. This is intentional: those fields are never blindly
 * copied from a DTO — they are set by the domain layer or the database.
 *
 * @author Antigravity
 * @date 2026-07-10
 */
@MapperConfig(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface KsmMapperConfig {
}
