package com.ksm.realestate.infrastructure.mapper;

import com.ksm.realestate.application.dto.request.UserCreateRequest;
import com.ksm.realestate.application.dto.response.UserResponse;
import com.ksm.realestate.domain.model.User;
import com.ksm.realestate.infrastructure.entity.UserEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserMapper INSTANCE = Mappers.getMapper(UserMapper.class);

    UserEntity toEntity(User user);

    User toDomain(UserEntity entity);

    @Mapping(target = "passwordHash", source = "password") // mot de passe brut transporté, hashé plus tard par
                                                           // UserService
    User toDomain(UserCreateRequest request);

    UserResponse toResponse(User user);
}