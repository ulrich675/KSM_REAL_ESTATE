/**
 * Server-side JWT authentication filter for WebFlux.
 * Reads the Bearer token from the Authorization header, validates it,
 * and populates the reactive security context.
 *
 * @author Antigravity
 * @date 2026-07-08
 */
package com.ksm.realestate.infrastructure.security;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;
import java.util.Collections;

/**
 * JwtAuthenticationFilter extracts and validates the JWT token, then
 * propagates the authentication into the reactive security context.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter implements WebFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUserDetailsService customUserDetailsService;

    /**
     * Filter the incoming request to extract and validate the JWT token.
     *
     * @param exchange the current server web exchange
     * @param chain    the web filter chain
     * @return a Mono that represents the completion of the filter chain
     */
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtTokenProvider.validateToken(token)) {
                String username = jwtTokenProvider.getUsernameFromToken(token);
                return customUserDetailsService.findByUsername(username)
                        .map(userDetails -> new UsernamePasswordAuthenticationToken(
                                userDetails, token, userDetails.getAuthorities()))
                        .flatMap(auth -> chain.filter(exchange)
                                .contextWrite(ReactiveSecurityContextHolder.withAuthentication(auth)));
            }
        }
        return chain.filter(exchange);
    }
}
