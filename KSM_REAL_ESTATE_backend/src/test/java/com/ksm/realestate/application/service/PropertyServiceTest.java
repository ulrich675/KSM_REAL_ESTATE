package com.ksm.realestate.application.service;

import com.ksm.realestate.application.port.out.PropertyRepositoryPort;
import com.ksm.realestate.application.port.out.SearchPort;
import com.ksm.realestate.domain.model.Address;
import com.ksm.realestate.domain.model.Price;
import com.ksm.realestate.domain.model.Property;
import com.ksm.realestate.domain.spec.PropertySpecification;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;
import java.math.BigDecimal;
import com.ksm.realestate.application.port.out.UserRepositoryPort;

import static org.mockito.ArgumentMatchers.any;

@ExtendWith(MockitoExtension.class)
public class PropertyServiceTest {

    @Mock
    private PropertyRepositoryPort propertyRepositoryPort;

    @Mock
    private SearchPort searchPort;

    @Mock
    private UserRepositoryPort userRepositoryPort;

    private PropertyService propertyService;
    private Property testProperty;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        propertyService = new PropertyService(propertyRepositoryPort, searchPort, userRepositoryPort);
        testProperty = new Property();
        testProperty.setPropertyId(1L);
        testProperty.setTitle("Beautiful Apartment");
        testProperty.setCategory("Apartment");
        testProperty.setAddress(new Address("Street", "Douala", "LT", "12345", "Cameroon", 4.05, 9.7));
        testProperty.setPrice(new Price(BigDecimal.valueOf(150000), "XAF"));
    }

    @Test
    public void testCreateProperty() {
        Mockito.when(propertyRepositoryPort.save(any(Property.class))).thenReturn(Mono.just(testProperty));

        Mono<Property> result = propertyService.create(new Property());

        StepVerifier.create(result)
                .expectNextMatches(
                        prop -> prop.getPropertyId().equals(1L) && prop.getTitle().equals("Beautiful Apartment"))
                .verifyComplete();
    }

    @Test
    public void testGetPropertyById() {
        Mockito.when(propertyRepositoryPort.findById(1L)).thenReturn(Mono.just(testProperty));

        Mono<Property> result = propertyService.getById(1L);

        StepVerifier.create(result)
                .expectNext(testProperty)
                .verifyComplete();
    }

    @Test
    public void testDeleteProperty() {
        Mockito.when(propertyRepositoryPort.deleteById(1L)).thenReturn(Mono.empty());

        Mono<Void> result = propertyService.delete(1L);

        StepVerifier.create(result)
                .verifyComplete();
    }

    @Test
    public void testSearchProperties() {
        PropertySpecification spec = new PropertySpecification("Apartment", "Douala", null, null);
        Mockito.when(propertyRepositoryPort.search(spec)).thenReturn(Flux.just(testProperty));

        Flux<Property> result = propertyService.search(spec);

        StepVerifier.create(result)
                .expectNext(testProperty)
                .verifyComplete();
    }
}
