package dev.collab3d.api;

import dev.collab3d.dto.SessionCreateDto;
import dev.collab3d.dto.SessionDto;
import dev.collab3d.dto.SessionJoinDto;
import dev.collab3d.dto.SessionParticipantDto;
import dev.collab3d.model.Session;
import dev.collab3d.security.ActorResolver;
import dev.collab3d.session.SessionService;
import dev.collab3d.spi.Actor;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
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
 * <p>The acting user ALWAYS comes from the authenticated session
 * ({@link ActorResolver}), never from the payload. The ids that older clients still
 * send ({@code hostId}, {@code userId}, the {@code {userId}} paths) are kept for one
 * version: when they agree with the session they are ignored, when they disagree the
 * request is refused with 403 and logged — a client that tries to act as somebody else
 * is a bug or an attack, not something to honour silently.
 */
@Slf4j
@RestController
@RequestMapping("/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;
    private final ActorResolver actorResolver;

    /** Creates the room. 404 unknown user · 409 host already has an open room. */
    @PostMapping
    public ResponseEntity<SessionDto> create(@Valid @RequestBody(required = false) SessionCreateDto body) {
        Actor actor = actorResolver.current();
        rejectForeign(body == null ? null : body.hostId(), actor.userId(), "hostId");
        Session created = sessionService.createSession(actor.userId());
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

    /**
     * The room the authenticated host already has open ({@code WAITING} or
     * {@code ACTIVE}), or 404.
     *
     * <p>The hosting screen asks this before creating: a host may only have one open
     * room, so a screen that always created would get 409 on every revisit and leave
     * the previous room orphaned.
     */
    @GetMapping("/open/me")
    public ResponseEntity<SessionDto> myOpenSession() {
        return openSessionOf(actorResolver.currentId());
    }

    /** Compatibility route: same answer, but only for the session's own user. */
    @GetMapping("/open/{userId}")
    public ResponseEntity<SessionDto> openSessionOf(@PathVariable Long userId) {
        rejectForeign(userId, actorResolver.currentId(), "userId");
        return sessionService.getOpenSessionFor(userId)
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
    public ResponseEntity<SessionDto> join(@PathVariable Long id,
                                           @RequestBody(required = false) SessionJoinDto body) {
        Long actorId = actingUser(body);
        return ResponseEntity.ok(toDto(sessionService.joinSession(id, actorId)));
    }

    /** Leaves the room. Frees the seat; if nobody is connected anymore, back to WAITING. */
    @PostMapping("/{id}/leave")
    public ResponseEntity<Void> leave(@PathVariable Long id,
                                      @RequestBody(required = false) SessionJoinDto body) {
        sessionService.leaveSession(id, actingUser(body));
        return ResponseEntity.noContent().build();
    }

    /** Ends the room (host only). 403 for everyone else. The scene stays stored. */
    @PostMapping("/{id}/end")
    public ResponseEntity<Void> end(@PathVariable Long id,
                                    @RequestBody(required = false) SessionJoinDto body) {
        sessionService.endSession(id, actingUser(body));
        return ResponseEntity.noContent().build();
    }

    /** ACTIVE rooms (host connected) of the authenticated user's friends. */
    @GetMapping("/friends")
    public List<SessionDto> myFriendsSessions() {
        return friendsSessions(actorResolver.currentId());
    }

    /**
     * Compatibility route: ACTIVE rooms of this user's friends. This is what makes the
     * friend list show "hosting" and enable the join button.
     */
    @GetMapping("/friends/{userId}")
    public List<SessionDto> friendsSessions(@PathVariable Long userId) {
        rejectForeign(userId, actorResolver.currentId(), "userId");
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

    private Long actingUser(SessionJoinDto body) {
        long actorId = actorResolver.currentId();
        rejectForeign(body == null ? null : body.userId(), actorId, "userId");
        return actorId;
    }

    /**
     * The compatibility window: an id sent by an older client is accepted when it is the
     * session's user, refused when it is somebody else's.
     */
    private void rejectForeign(Long declared, long actorId, String field) {
        if (declared != null && declared != actorId) {
            log.warn("Recusado {}={} de um usuário autenticado como {}", field, declared, actorId);
            throw new AccessDeniedException("Você só pode agir em seu próprio nome.");
        }
    }

    private SessionDto toDto(Session session) {
        return SessionDto.from(session, sessionService.countParticipants(session.getId()),
                sessionService.maxParticipants(session.getId()));
    }
}
