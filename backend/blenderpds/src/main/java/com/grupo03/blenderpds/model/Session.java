package com.grupo03.blenderpds.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

/**
 * Collaborative editing room. The host creates it, the host's friends join.
 *
 * <p>The scene state is NOT this row's responsibility: the server keeps the CRDT
 * operation log in {@code session_operations} (the source of truth) and here only
 * keeps an opaque JSON snapshot — materialised by a client — for fast reads. The
 * server does not interpret the CRDT; it only orders, deduplicates and persists.
 *
 * <p>The host column keeps the name {@code user_id}: with {@code ddl-auto=update}
 * Hibernate never drops the old column, and a new {@code host_id} would leave an
 * orphaned {@code user_id NOT NULL} that breaks every INSERT on databases that
 * already had the table.
 */
@Entity
@Table(name = "sessions")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"host", "sceneSnapshot"})
public class Session {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Who created the room: the only one who may end it. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User host;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private SessionStatus status = SessionStatus.WAITING;

    /** Short code so a friend can join without going through the friend list. */
    @Column(name = "code", nullable = false, unique = true, length = 12)
    private String code;

    /**
     * Scene materialisation (JSON) sent by a client. A denormalisation: if it
     * diverges from the operation log, the log wins.
     *
     * <p>{@code columnDefinition="text"} instead of {@code @Lob}: on Postgres a
     * {@code @Lob} on String falls back to a large object ({@code oid}), which is
     * not what we want.
     */
    @Column(name = "scene_snapshot", columnDefinition = "text")
    private String sceneSnapshot;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    /** Updated by the auditing on every change (presence, snapshot, status). */
    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;

    /** Filled in when the host ends the room. */
    @Column(name = "ended_at")
    private Instant endedAt;
}
