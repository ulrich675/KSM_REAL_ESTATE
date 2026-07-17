package com.ksm.realestate.infrastructure.mapper;

import com.ksm.realestate.domain.model.ProprietorRequest;
import com.ksm.realestate.infrastructure.entity.ProprietorRequestEntity;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ProprietorRequestMapper {
    ProprietorRequestEntity toEntity(ProprietorRequest domain);

    ProprietorRequest toDomain(ProprietorRequestEntity entity);
}
