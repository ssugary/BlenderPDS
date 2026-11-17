package dev.collab3d.dto;

import jakarta.validation.constraints.Size;

/**
 * Input of {@code POST /sessions}. The host is the authenticated user: {@code hostId} is
 * still accepted for one version because older clients send it, but it is ignored — and
 * a value that contradicts the session is refused with 403.
 *
 * <p>{@code appType} is accepted for forward compatibility but is ignored while a deploy
 * fixes the type through {@code collab3d.app-type} (P1.10): one deployment hosts one
 * application, so the client cannot choose it. The room's type is written from the
 * configuration, not from this field.
 */
public record SessionCreateDto(Long hostId, @Size(max = 32) String appType) {

    public SessionCreateDto(Long hostId) {
        this(hostId, null);
    }
}
