package com.grupo03.blenderpds.controller;

import com.grupo03.blenderpds.dto.SessionCreateDto;
import com.grupo03.blenderpds.dto.SessionDto;
import com.grupo03.blenderpds.dto.SessionJoinDto;
import com.grupo03.blenderpds.dto.SessionParticipantDto;
import com.grupo03.blenderpds.model.Session;
import com.grupo03.blenderpds.service.SessionService;
import com.grupo03.blenderpds.service.implementation.SessionServiceImpl;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Collaborative session REST API. CRDT operation traffic does not go through here:
 * it travels on the WebSocket at {@code /ws/sessions/{id}} — these routes handle the
 * lifecycle (create, join, leave, end) and the listings.
 *
 * <p>Who acts comes in the body/path (same convention as the friendship routes), so
 * access depends on Spring Security's standard authentication and the service checks
 * whether the user is a friend of the host.
 */
@RestController
@RequestMapping("/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;

    /** Creates the room. 404 unknown user · 409 host already has an open room. */
    @PostMapping
    public ResponseEntity<SessionDto> create(@Valid @RequestBody SessionCreateDto body) {
        Session created = sessionService.createSession(body.hostId());
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(created));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SessionDto> get(@PathVariable Long id) {
        return sessionService.getById(id)
                .map(this::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /** Lookup by the short code, which is what the friend pastes on the join screen. */
    @GetMapping("/code/{code}")
    public ResponseEntity<SessionDto> getByCode(@PathVariable String code) {
        return sessionService.getByCode(code)
                .map(this::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/participants")
    public List<SessionParticipantDto> participants(@PathVariable Long id) {
        return sessionService.getParticipants(id).stream().map(SessionParticipantDto::from).toList();
    }

    /**
     * Joins the room. 404 unknown session/user · 403 not a friend of the host ·
     * 409 room ended or full. Joining again is idempotent.
     */
    @PostMapping("/{id}/join")
    public ResponseEntity<SessionDto> join(@PathVariable Long id, @Valid @RequestBody SessionJoinDto body) {
        return ResponseEntity.ok(toDto(sessionService.joinSession(id, body.userId())));
    }

    /** Leaves the room. Frees the seat; if nobody is connected anymore, back to WAITING. */
    @PostMapping("/{id}/leave")
    public ResponseEntity<Void> leave(@PathVariable Long id, @Valid @RequestBody SessionJoinDto body) {
        sessionService.leaveSession(id, body.userId());
        return ResponseEntity.noContent().build();
    }

    /** Ends the room (host only). 403 for everyone else. The scene stays stored. */
    @PostMapping("/{id}/end")
    public ResponseEntity<Void> end(@PathVariable Long id, @Valid @RequestBody SessionJoinDto body) {
        sessionService.endSession(id, body.userId());
        return ResponseEntity.noContent().build();
    }

    /**
     * ACTIVE rooms (host connected) of this user's friends: this is what makes the
     * friend list show "hosting" and enable the join button.
     */
    @GetMapping("/friends/{userId}")
    public List<SessionDto> friendsSessions(@PathVariable Long userId) {
        return sessionService.getJoinableSessionsFor(userId).stream().map(this::toDto).toList();
    }

    /**
     * Last scene snapshot stored by a client — a shortcut so the whole log does not
     * have to be reprocessed. The operation log stays the source of truth.
     */
    @GetMapping("/{id}/state")
    public ResponseEntity<String> state(@PathVariable Long id) {
        return sessionService.getSnapshot(id)
                .filter(snapshot -> !snapshot.isBlank())
                .map(snapshot -> ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(snapshot))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private SessionDto toDto(Session session) {
        return SessionDto.from(session, sessionService.countParticipants(session.getId()),
                SessionServiceImpl.MAX_PARTICIPANTS);
    }

    @ExceptionHandler(EntityNotFoundException.class)
    ResponseEntity<Void> notFound(EntityNotFoundException ex) {
        return ResponseEntity.notFound().build();
    }

    @ExceptionHandler(IllegalArgumentException.class)
    ResponseEntity<Void> badRequest(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().build();
    }

    @ExceptionHandler(IllegalStateException.class)
    ResponseEntity<Void> sessionConflict(IllegalStateException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).build();
    }

    /** Domain access rule: not a friend of the host / not the host → 403. */
    @ExceptionHandler(AccessDeniedException.class)
    ResponseEntity<Void> forbidden(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }
}
