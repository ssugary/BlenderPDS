package com.grupo03.blenderpds.dto;

import jakarta.validation.constraints.NotNull;

/**
 * Input of {@code POST /sessions}: the host comes in the body (there is no HTTP
 * session login on the backend beyond Spring Security's cookie, and the actor of the
 * friendship routes also comes as a parameter).
 */
public record SessionCreateDto(@NotNull Long hostId) {
}
