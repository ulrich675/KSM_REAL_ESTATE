package com.ksm.realestate.infrastructure.adapter.in;

import com.ksm.realestate.application.dto.request.VisitRequestCreateRequest;
import com.ksm.realestate.application.dto.response.VisitRequestResponse;
import com.ksm.realestate.application.service.VisitRequestService;
import com.ksm.realestate.infrastructure.mapper.VisitRequestMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;
import java.time.Instant;

/**
 * REST controller for handling visit requests.
 *
 * @author ulrich675
 * @date 2026-07-08
 */
@RestController
@RequestMapping("/api/visits")
@RequiredArgsConstructor
public class VisitRequestController {

    private final VisitRequestService visitRequestService;
    private final VisitRequestMapper visitRequestMapper;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<ApiResponse<VisitRequestResponse>> createVisit(@RequestBody VisitRequestCreateRequest request) {
        return visitRequestService.create(visitRequestMapper.toDomain(request))
                .map(visitRequestMapper::toResponse)
                .map(response -> ApiResponse.<VisitRequestResponse>builder()
                        .status("SUCCESS")
                        .message("Visit request created successfully")
                        .data(response)
                        .timestamp(Instant.now())
                        .errors(null)
                        .build());
    }
}
