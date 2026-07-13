package com.ksm.realestate.application.port.out;

import reactor.core.publisher.Mono;

/**
 * Outbound port for publishing events to a message broker (e.g., Kafka).
 *
 * Provides a reactive method to publish a payload to a specific topic.
 *
 * @author ulrich675
 * @date 2026-07-08
 */
public interface EventPublisherPort {

    /**
     * Publish an event payload to the given topic.
     *
     * @param topic   the target topic name
     * @param payload the event payload as a JSON string
     * @return a Mono signalling completion or error
     */
    Mono<Void> publish(String topic, String payload);
}
