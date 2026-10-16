package com.grupo03.blenderpds.service;

import com.grupo03.blenderpds.model.Session;
import com.grupo03.blenderpds.model.SessionOperation;
import com.grupo03.blenderpds.model.SessionParticipant;
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

    /** Operations after {@code seq} (cursor-based catch-up, cheaper than the vv). */
    List<SessionOperation> syncSinceSeq(Long sessionId, Long seq);

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
