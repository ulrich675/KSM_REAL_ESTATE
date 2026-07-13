/**
 * Standard API response envelope used by all controllers.
 *
 * @author ulrich675
 * @date 2026-07-08
 */
package com.ksm.realestate.infrastructure.adapter.in;

import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ApiResponse<T> {
    private String status; // SUCCESS or ERROR
    private String message;
    private T data;
    private Instant timestamp;
    private Object errors; // can be a list or map of error details
}
