package dev.collab3d.spi;

import org.springframework.http.HttpStatus;

/**
 * Verdict of one {@link SessionJoinPolicy}. The HTTP status is carried so the chain can
 * reproduce today's mapping (404 unknown, 403 not allowed, 409 ended/full) instead of
 * flattening everything into 403.
 */
public record JoinDecision(boolean allowed, HttpStatus statusIfDenied, String code, String message) {

    public static JoinDecision allow() {
        return new JoinDecision(true, null, null, null);
    }

    public static JoinDecision deny(HttpStatus status, String code, String message) {
        return new JoinDecision(false, status, code, message);
    }
}
