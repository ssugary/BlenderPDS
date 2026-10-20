package com.grupo03.blenderpds.controller;

import com.grupo03.blenderpds.dto.ApiErrorDto;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

/**
 * One place for the REST error contract, instead of each controller repeating the same
 * handlers (and forgetting some of them).
 *
 * <p>Service exceptions keep their meaning: not found → 404, invalid input → 400,
 * conflicting state → 409, domain access rule → 403, and a unique-constraint hit on
 * insert → 409. The framework's own request failures (invalid body, wrong parameter
 * type, missing parameter) also come out in the same JSON shape the SPA reads.
 *
 * <p>Messages are deliberately generic and in English: they are what the UI shows, and
 * database or parser internals must not leak through them. There is no catch-all
 * handler on purpose: it would swallow the framework's own 404/405 resolutions and
 * turn them into 500.
 */
@Slf4j
@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiErrorDto> notFound(EntityNotFoundException ex) {
        return error(HttpStatus.NOT_FOUND, "Not found.");
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiErrorDto> badRequest(IllegalArgumentException ex) {
        return error(HttpStatus.BAD_REQUEST, "The request is invalid.");
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiErrorDto> conflict(IllegalStateException ex) {
        return error(HttpStatus.CONFLICT, "The request conflicts with the current state.");
    }

    /** Domain access rule from the services (not a friend of the host, not the host...). */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiErrorDto> forbidden(AccessDeniedException ex) {
        return error(HttpStatus.FORBIDDEN, "You are not allowed to do that.");
    }

    /**
     * A unique constraint hit that escaped the services' pre-checks (two concurrent
     * requests). The database message is logged, never returned.
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiErrorDto> dataIntegrity(DataIntegrityViolationException ex,
                                                     HttpServletRequest request) {
        log.warn("Constraint violation on {} {}: {}", request.getMethod(),
                request.getRequestURI(), ex.getMostSpecificCause().getMessage());
        return error(HttpStatus.CONFLICT, "The request conflicts with the current state.");
    }

    /** Bean validation on the request body, listing which fields failed and why. */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorDto> invalidBody(MethodArgumentNotValidException ex) {
        String detail = ex.getBindingResult().getFieldErrors().stream()
                .map(this::describe)
                .distinct()
                .collect(Collectors.joining("; "));
        return error(HttpStatus.BAD_REQUEST,
                detail.isBlank() ? "The request body is invalid." : detail);
    }

    /** Malformed JSON, wrong field type or an empty body. */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorDto> unreadableBody(HttpMessageNotReadableException ex) {
        return error(HttpStatus.BAD_REQUEST, "The request body is missing or malformed.");
    }

    /** A path/query value of the wrong type, e.g. {@code GET /users/abc}. */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiErrorDto> wrongParameterType(MethodArgumentTypeMismatchException ex) {
        return error(HttpStatus.BAD_REQUEST, "Invalid value for '" + ex.getName() + "'.");
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiErrorDto> missingParameter(MissingServletRequestParameterException ex) {
        return error(HttpStatus.BAD_REQUEST, "Missing required parameter '" + ex.getParameterName() + "'.");
    }

    private String describe(FieldError error) {
        return error.getField() + ": " + error.getDefaultMessage();
    }

    private ResponseEntity<ApiErrorDto> error(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(ApiErrorDto.of(status, message));
    }
}
