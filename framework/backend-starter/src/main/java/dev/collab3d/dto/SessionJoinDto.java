package dev.collab3d.dto;

/**
 * Input of {@code POST /sessions/{id}/join|leave|end}. The acting user is the
 * authenticated one; {@code userId} survives one version for older clients, is ignored,
 * and a value that contradicts the session is refused with 403.
 */
public record SessionJoinDto(Long userId) {
}
