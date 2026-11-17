package com.grupo03.blenderpds.repository;

import com.grupo03.blenderpds.model.SessionOperation;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Persistence of the per-session operation log: the total order by {@code seq}, the
 * deduplication key and the current tail read on append.
 */
public interface SessionOperationRepository extends JpaRepository<SessionOperation, Long> {

    /** The session log in the server's total order — the order the client replicates. */
    List<SessionOperation> findBySessionIdOrderBySeqAsc(Long sessionId);

    Optional<SessionOperation> findTopBySessionIdOrderBySeqDesc(Long sessionId);

    /** Deduplication: the same op resent (a reconnect) does not enter twice. */
    boolean existsBySessionIdAndSiteIdAndLamport(Long sessionId, String siteId, Long lamport);

    void deleteBySessionId(Long sessionId);

    /**
     * Deleting a user must not delete the scene history: their ops still count for
     * the other replicas, so we only drop the author.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update SessionOperation o set o.author = null where o.author.id = :userId")
    void detachAuthor(@Param("userId") Long userId);
}
