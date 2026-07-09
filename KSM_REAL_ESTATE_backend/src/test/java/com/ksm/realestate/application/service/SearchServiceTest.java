package com.ksm.realestate.application.service;

import com.ksm.realestate.application.port.out.SearchPort;
import com.ksm.realestate.domain.model.Property;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Flux;
import reactor.test.StepVerifier;

@ExtendWith(MockitoExtension.class)
public class SearchServiceTest {

    @Mock
    private SearchPort searchPort;

    private SearchService searchService;
    private Property testProperty;

    @BeforeEach
    public void setUp() {
        searchService = new SearchService(searchPort);
        testProperty = new Property();
        testProperty.setPropertyId(1L);
        testProperty.setTitle("Elastic Search Property");
    }

    @Test
    public void testSearchProperties() {
        Mockito.when(searchPort.search("Elastic")).thenReturn(Flux.just(testProperty));

        Flux<Property> result = searchService.search("Elastic");

        StepVerifier.create(result)
                .expectNext(testProperty)
                .verifyComplete();
    }
}
