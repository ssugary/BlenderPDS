package com.grupo03.blenderpds.repository;

import com.grupo03.blenderpds.model.Session;
import com.grupo03.blenderpds.model.SessionStatus;
import jakarta.persistence.LockModeType;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SessionRepository extends JpaRepository<Session, Long> {

    Optional<Session> findByCode(String code);

    boolean existsByCode(String code);

    /** The host's still-open session (at most one per host). */
    Optional<Session> findFirstByHostIdAndStatusNot(Long hostId, SessionStatus status);

    /** Open rooms of the friends, with the host already loaded (the list shows the nickname). */
    @Query("select s from Session s join fetch s.host where s.host.id in :hostIds and s.status = :status")
    List<Session> findOpenByHostIds(@Param("hostIds") Collection<Long> hostIds, @Param("status") SessionStatus status);

    /**
     * The pessimistic-lock version used when storing operations: without it two
     * concurrent appends would compute the same {@code MAX(seq)+1}.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from Session s where s.id = :id")
    Optional<Session> findByIdForUpdate(@Param("id") Long id);

    /** Deleting a user takes along the rooms they were hosting. */
    List<Session> findByHostId(Long hostId);
}
