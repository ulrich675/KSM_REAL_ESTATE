package com.ksm.realestate.infrastructure.mapper;

import com.ksm.realestate.domain.model.VirtualTourImage;
import com.ksm.realestate.infrastructure.entity.VirtualTourImageEntity;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

/**
 * Mapper for VirtualTourImage.
 *
 * @author ulrich675
 * @date 2026-07-17
 */
@Mapper(componentModel = "spring", config = KsmMapperConfig.class)
public interface VirtualTourImageMapper {

    VirtualTourImageMapper INSTANCE = Mappers.getMapper(VirtualTourImageMapper.class);

    VirtualTourImageEntity toEntity(VirtualTourImage domain);

    VirtualTourImage toDomain(VirtualTourImageEntity entity);

    com.ksm.realestate.application.dto.response.VirtualTourImageResponse toResponse(VirtualTourImage domain);
}
