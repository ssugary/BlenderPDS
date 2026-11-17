package com.grupo03.blenderpds.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

/**
 * One CRDT operation of the session log. The source of truth for the scene:
 * rebuilding the scene means applying these rows in {@code seq} order (the client
 * does that in {@code DocumentState}).
 *
 * <p>The server does NOT interpret the CRDT — {@code payload} holds the raw JSON that
 * came from the client. The {@code siteId}/{@code lamport}/{@code kind} columns exist
 * only to deduplicate and order. That is why the backend does not need to
 * reimplement LWW registers or tombstones to stay valid when the client grows new
 * operation types.
 *
 * <p>Two unique constraints carry the idempotency:
 * <ul>
 *   <li>{@code (session_id, seq)} — the server's total order;</li>
 *   <li>{@code (session_id, site_id, lamport)} — resending the same op (a reconnect)
 *       creates no new row and does not change the scene.</li>
 * </ul>
 */
@Entity
@Table(name = "session_operations", uniqueConstraints = {
        @UniqueConstraint(name = "uk_session_operation_seq", columnNames = {"session_id", "seq"}),
        @UniqueConstraint(name = "uk_session_operation_op", columnNames = {"session_id", "site_id", "lamport"})
})
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"session", "author", "payload"})
public class SessionOperation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_id", nullable = false)
    private Session session;

    /** The server's total order within the session (1, 2, 3...). */
    @Column(name = "seq", nullable = false)
    private Long seq;

    /** Replica that produced the op (the client's Lamport clock siteId). */
    @Column(name = "site_id", nullable = false, length = 100)
    private String siteId;

    @Column(name = "lamport", nullable = false)
    private Long lamport;

    /**
     * Who sent it. Nullable on purpose: deleting a user must not delete the scene
     * history (their ops still count for the other replicas).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    private User author;

    /** Operation type (add_object, set_transform...), for diagnostics/indexing only. */
    @Column(name = "kind", nullable = false, length = 32)
    private String kind;

    /** Raw JSON of the operation, relayed to the client exactly as it arrived. */
    @Column(name = "payload", nullable = false, columnDefinition = "text")
    private String payload;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
