package com.grupo03.blenderpds.dto;

import jakarta.validation.constraints.NotBlank;

/** Input of {@code POST /auth/login}: the e-mail is the system's username. */
public record LoginDto(@NotBlank String email, @NotBlank String password) {
}
