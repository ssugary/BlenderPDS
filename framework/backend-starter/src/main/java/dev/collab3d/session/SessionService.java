package dev.collab3d.session;

import dev.collab3d.model.Session;
import dev.collab3d.model.SessionOperation;
import dev.collab3d.model.SessionParticipant;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Collaborative rooms: lifecycle, participation (host's friends only) and the CRDT
 * operation log.
 *
 * <p>Division of responsibility: the client stays the owner of the CRDT (merge, LWW,
 * tombstones); the server is the global sequencer and the durable storage — it checks
 * the shape, deduplicates, assigns {@code seq} and persists. It deliberately does not
 * compute the scene state.
 *
 * <p>Errors: {@code EntityNotFoundException} (404), {@code IllegalArgumentException}
 * (400), {@code IllegalStateException} (409) and {@code AccessDeniedException} (403).
 */
public interface SessionService {

    /**
     * Creates the room and registers the host as a participant (still inactive: the
     * WebSocket is what actually marks presence).
     *
     * @throws EntityNotFoundException if the host does not exist
     * @throws IllegalStateException   if the host already has another open room
     */
    Session createSession(Long hostId);

    Optional<Session> getById(Long sessionId);

    Optional<Session> getByCode(String code);

    /**
     * The host's still-open room ({@code WAITING} or {@code ACTIVE}), if they have one.
     *
     * <p>It exists because {@link #createSession} refuses a second open room per host:
     * a screen that only knew how to create would get 409 every time the host came back
     * to it, and would also orphan the room (nobody ever ends a room that was only
     * created and abandoned).
     */
    Optional<Session> getOpenSessionFor(Long hostId);

    /**
     * REST entry point: checks the friendship with the host, the state and the capacity
     * and leaves the participant registered (presence is actually marked in
     * {@link #connectParticipant}).
     *
     * @throws EntityNotFoundException if the session or the user does not exist
     * @throws AccessDeniedException   if the user is neither the host nor a friend of theirs
     * @throws IllegalStateException   if the session is ended or full
     */
    Session joinSession(Long sessionId, Long userId);

    /**
     * The WebSocket handshake gate: runs everything from {@link #joinSession} AND marks
     * the participant as connected, all under the session row lock — that is what stops
     * two simultaneous handshakes from blowing past the cap.
     *
     * @throws EntityNotFoundException if the session or the user does not exist
     * @throws AccessDeniedException   if the user is neither the host nor a friend of theirs
     * @throws IllegalStateException   if the session is ended or full
     */
    SessionParticipant connectParticipant(Long sessionId, Long userId);

    /**
     * Marks the participant as disconnected and, once nobody is connected anymore, the
     * room goes back to {@code WAITING}.
     *
     * <p>It is lenient on purpose: it also runs on the socket close of a room that was
     * already ended or deleted, where there is nothing to do.
     */
    void leaveSession(Long sessionId, Long userId);

    /**
     * Ends the room (host only) and publishes {@link SessionEndedEvent} so the
     * WebSocket layer drops the connections. The scene stays stored.
     *
     * @throws EntityNotFoundException if the session does not exist
     * @throws AccessDeniedException   if the caller is not the host
     */
    void endSession(Long sessionId, Long userId);

    /** Session participants (with the user already loaded). */
    List<SessionParticipant> getParticipants(Long sessionId);

    /** How many participants the session has, connected or not. */
    long countParticipants(Long sessionId);

    /**
     * How many seats the room has, as decided by the {@code SessionCapacityPolicy} chain
     * (the strictest policy wins). It is what {@code SessionDto.maxParticipants} reports,
     * so the REST answer cannot drift from the rule that actually refuses a join.
     */
    int maxParticipants(Long sessionId);

    /** ACTIVE rooms (host connected) among {@code userId}'s friends. */
    List<Session> getJoinableSessionsFor(Long userId);

    /**
     * Stores a batch of operations: checks that the sender is connected, drops
     * redeliveries ({@code siteId+lamport}) and assigns {@code seq} under the session
     * lock.
     *
     * @throws EntityNotFoundException if the session does not exist
     * @throws AccessDeniedException   if the sender is not connected to the session
     * @throws IllegalStateException   if the session is ended
     */
    List<SessionOperation> appendOperations(Long sessionId, Long userId, List<SessionOperationInput> inputs);

    /** Operations missing for whoever already has version vector {@code versionVector}. */
    List<SessionOperation> syncSince(Long sessionId, Map<String, Integer> versionVector);

    /**
     * One page of the catch-up: at most {@code limit} operations after {@code seq}, in
     * server order. The {@code seq} cursor is what the WebSocket catch-up advances page
     * by page, so the room is never loaded whole.
     */
    List<SessionOperation> syncSinceSeq(Long sessionId, Long seq, int limit);

    /**
     * Stores the JSON scene snapshot sent by a client (a denormalisation; the operation
     * log stays the source of truth).
     *
     * @throws IllegalArgumentException if the snapshot is null or over 1 MB
     */
    void saveSnapshot(Long sessionId, Long userId, String snapshotJson);

    Optional<String> getSnapshot(Long sessionId);

    /**
     * Clears everything that points at the user before deleting them: leaves other
     * people's rooms, and the rooms they hosted go away together with their operations
     * and participants. Their operations in other people's rooms stay, just without an
     * author (deleting history would break convergence for whoever already replicated).
     */
    void deleteAllForUser(Long userId);
}
