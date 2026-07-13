package com.ksm.realestate.infrastructure.mapper;

import com.ksm.realestate.application.dto.request.PaymentCreateRequest;
import com.ksm.realestate.application.dto.response.PaymentResponse;
import com.ksm.realestate.domain.model.Payment;
import com.ksm.realestate.infrastructure.entity.PaymentEntity;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

/**
 * Mapper for converting between Payment DTOs, domain models, and persistence
 * entities.
 *
 * @author ulrich675
 * @date 2026-07-08
 */
@Mapper(componentModel = "spring", config = KsmMapperConfig.class)
public interface PaymentMapper {

    PaymentMapper INSTANCE = Mappers.getMapper(PaymentMapper.class);

    // Entity <-> Domain
    PaymentEntity toEntity(Payment payment);

    Payment toDomain(PaymentEntity entity);

    // DTO <-> Domain
    Payment toDomain(PaymentCreateRequest request);

    PaymentResponse toResponse(Payment domain);
}
