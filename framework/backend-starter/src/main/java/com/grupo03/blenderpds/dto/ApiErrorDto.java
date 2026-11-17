package com.grupo03.blenderpds.dto;

import org.springframework.http.HttpStatus;

/**
 * Error payload of the REST API.
 *
 * <p>The SPA already reads {@code body.message ?? body.error} when a request fails, so
 * every handled error goes out in this shape instead of an empty body.
 */
public record ApiErrorDto(int status, String error, String message) {

    public static ApiErrorDto of(HttpStatus status, String message) {
        return new ApiErrorDto(status.value(), status.getReasonPhrase(), message);
    }
}
