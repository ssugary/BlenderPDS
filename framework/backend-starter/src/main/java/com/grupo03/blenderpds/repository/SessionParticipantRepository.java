package com.grupo03.blenderpds.repository;

import com.grupo03.blenderpds.model.SessionParticipant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Persistence of membership and presence: who belongs to a room, who is connected
 * right now and how many seats are taken.
 */
public interface SessionParticipantRepository extends JpaRepository<SessionParticipant, Long> {

    Optional<SessionParticipant> findBySessionIdAndUserId(Long sessionId, Long userId);

    /**
     * Participants with the user already loaded (join fetch): the list is built after
     * the transaction and also outside the DispatcherServlet (the WebSocket handler has
     * no open-in-view), so lazy here would blow up.
     */
    @Query("select p from SessionParticipant p join fetch p.user where p.session.id = :sessionId order by p.joinedAt asc")
    List<SessionParticipant> findBySessionIdOrderByJoinedAtAsc(@Param("sessionId") Long sessionId);

    /** Total participants (connected or not) — what the session DTO shows. */
    long countBySessionId(Long sessionId);

    /** Participants connected right now (the host counts in this figure). */
    long countBySessionIdAndActiveTrue(Long sessionId);

    /**
     * Connected ones, ignoring one user. Used to check the capacity: somebody who is
     * RECONNECTING must not be counted twice against the limit.
     */
    long countBySessionIdAndActiveTrueAndUserIdNot(Long sessionId, Long userId);

    boolean existsBySessionIdAndUserId(Long sessionId, Long userId);

    void deleteBySessionId(Long sessionId);

    /** Before deleting a user: takes them out of other people's rooms. */
    void deleteByUserId(Long userId);

    void deleteBySessionIdAndUserId(Long sessionId, Long userId);
}
