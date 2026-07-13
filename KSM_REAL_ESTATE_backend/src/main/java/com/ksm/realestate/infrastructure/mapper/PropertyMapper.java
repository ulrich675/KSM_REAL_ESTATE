package com.ksm.realestate.infrastructure.mapper;

import com.ksm.realestate.application.dto.request.PropertyCreateRequest;
import com.ksm.realestate.application.dto.response.PropertyResponse;
import com.ksm.realestate.domain.model.Property;
import com.ksm.realestate.infrastructure.entity.PropertyEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

/**
 * MapStruct mapper for Property domain model, DTOs, and persistence entity.
 *
 * @author ulrich675
 * @date 2026-07-08
 */
@Mapper(componentModel = "spring", config = KsmMapperConfig.class)
public interface PropertyMapper {

    PropertyMapper INSTANCE = Mappers.getMapper(PropertyMapper.class);

    @Mapping(target = "price.amount", source = "priceAmount")
    @Mapping(target = "price.currency", source = "priceCurrency")
    @Mapping(target = "address.street", source = "streetName")
    @Mapping(target = "address.city", source = "cityName")
    @Mapping(target = "address.state", source = "stateName")
    @Mapping(target = "address.postalCode", source = "zipCode")
    @Mapping(target = "address.country", source = "country")
    Property toDomain(PropertyCreateRequest request);

    @Mapping(target = "priceAmount", source = "price.amount")
    @Mapping(target = "priceCurrency", source = "price.currency")
    @Mapping(target = "streetName", source = "address.street")
    @Mapping(target = "cityName", source = "address.city")
    @Mapping(target = "stateName", source = "address.state")
    @Mapping(target = "zipCode", source = "address.postalCode")
    @Mapping(target = "country", source = "address.country")
    @Mapping(target = "latitude", source = "address.latitude")
    @Mapping(target = "longitude", source = "address.longitude")
    @Mapping(target = "status", source = "status")
    PropertyResponse toResponse(Property property);

    @Mapping(target = "priceAmount", source = "price.amount")
    @Mapping(target = "priceCurrency", source = "price.currency")
    @Mapping(target = "street", source = "address.street")
    @Mapping(target = "city", source = "address.city")
    @Mapping(target = "state", source = "address.state")
    @Mapping(target = "zipCode", source = "address.postalCode")
    @Mapping(target = "country", source = "address.country")
    PropertyEntity toEntity(Property property);

    @Mapping(target = "price.amount", source = "priceAmount")
    @Mapping(target = "price.currency", source = "priceCurrency")
    @Mapping(target = "address.street", source = "street")
    @Mapping(target = "address.city", source = "city")
    @Mapping(target = "address.state", source = "state")
    @Mapping(target = "address.postalCode", source = "zipCode")
    @Mapping(target = "address.country", source = "country")
    Property toDomain(PropertyEntity entity);
}
