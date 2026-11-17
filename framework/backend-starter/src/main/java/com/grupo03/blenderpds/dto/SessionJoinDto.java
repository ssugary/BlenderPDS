package com.grupo03.blenderpds.dto;

import jakarta.validation.constraints.NotNull;

/** Input of {@code POST /sessions/{id}/join|leave|end}: who is acting. */
public record SessionJoinDto(@NotNull Long userId) {
}
