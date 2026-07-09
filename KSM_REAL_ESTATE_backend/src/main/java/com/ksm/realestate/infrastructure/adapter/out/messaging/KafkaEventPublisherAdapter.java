package com.ksm.realestate.infrastructure.adapter.out.messaging;

import com.ksm.realestate.application.port.out.EventPublisherPort;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

/**
 * Adapter implementing EventPublisherPort using KafkaTemplate wrapped
 * reactively.
 *
 * @author Antigravity
 * @date 2026-07-08
 */
@Component
public class KafkaEventPublisherAdapter implements EventPublisherPort {

    private final KafkaTemplate<String, String> kafkaTemplate;

    public KafkaEventPublisherAdapter(KafkaTemplate<String, String> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    @Override
    public Mono<Void> publish(String topic, String payload) {
        return Mono.fromFuture(() -> kafkaTemplate.send(topic, payload))
                .then();
    }
}
