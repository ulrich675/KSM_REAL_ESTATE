package com.ksm.realestate.application.service;

import com.ksm.realestate.application.port.out.VisitRequestRepositoryPort;
import com.ksm.realestate.domain.model.VisitRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.mockito.ArgumentMatchers.any;

@ExtendWith(MockitoExtension.class)
public class VisitRequestServiceTest {

    @Mock
    private VisitRequestRepositoryPort visitRequestRepositoryPort;

    private VisitRequestService visitRequestService;

    @BeforeEach
    public void setUp() {
        visitRequestService = new VisitRequestService(visitRequestRepositoryPort);
    }

    @Test
    public void testCreateVisitRequest_SetsStatusPendingAndPersists() {
        // Use thenAnswer so the mock returns the actual saved object with status set
        Mockito.when(visitRequestRepositoryPort.save(any(VisitRequest.class)))
                .thenAnswer(invocation -> Mono.just((VisitRequest) invocation.getArgument(0)));

        VisitRequest incoming = new VisitRequest();
        incoming.setPropertyId(1L);
        incoming.setUserId(2L);

        StepVerifier.create(visitRequestService.create(incoming))
                .expectNextMatches(req -> "PENDING".equals(req.getStatus()) && req.getRequestedAt() != null)
                .verifyComplete();
    }
}
