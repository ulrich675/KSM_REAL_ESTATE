package com.ksm.realestate.infrastructure.mapper;

import com.ksm.realestate.application.dto.request.VisitRequestCreateRequest;
import com.ksm.realestate.application.dto.response.VisitRequestResponse;
import com.ksm.realestate.domain.model.VisitRequest;
import com.ksm.realestate.infrastructure.entity.VisitRequestEntity;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

/**
 * Mapper for converting between VisitRequest DTOs, domain models, and
 * persistence entities.
 *
 * @author Antigravity
 * @date 2026-07-08
 */
@Mapper(componentModel = "spring")
public interface VisitRequestMapper {

    VisitRequestMapper INSTANCE = Mappers.getMapper(VisitRequestMapper.class);

    // Entity <-> Domain
    VisitRequestEntity toEntity(VisitRequest request);

    VisitRequest toDomain(VisitRequestEntity entity);

    // DTO <-> Domain
    VisitRequest toDomain(VisitRequestCreateRequest request);

    VisitRequestResponse toResponse(VisitRequest domain);
}
